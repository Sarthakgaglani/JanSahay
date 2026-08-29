import json
import asyncio
import re
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel
from typing import Optional, List
from backend.rag import query_rag, translate_text
from backend.database import save_feedback, log_query, get_analytics
from backend.llm import LLMProviderError, get_llm_provider
from backend.schemes import load_all_schemes
from backend.rate_limit import enforce_rate_limit

TRANSLATION_CACHE = {}

def get_cached_translation(text: str, lang: str) -> str:
    if not text or lang == "en":
        return text
    key = (text, lang)
    if key not in TRANSLATION_CACHE:
        res = translate_text(text, lang)
        if res and "Error 500" not in res and "That’s an error" not in res and "Server Error" not in res:
            TRANSLATION_CACHE[key] = res
        else:
            return text
    return TRANSLATION_CACHE[key]

router = APIRouter()

class ChatMessage(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    question: str
    language: str = "en"
    history: Optional[List[ChatMessage]] = None
    state: Optional[str] = None

class FeedbackRequest(BaseModel):
    question: str
    helpful: bool

class EligibilityRequest(BaseModel):
    age: int
    gender: str  # "male", "female", "other"
    state: str
    occupation: str  # "farmer", "student", "worker", "unemployed", "salaried", "self_employed", "other"
    annual_income: int  # in INR
    caste_category: str  # "general", "obc", "sc", "st", "ews"

@router.post("/api/chat")
async def chat(req: ChatRequest, request: Request):
    await enforce_rate_limit(request, "chat", limit=20)
    if not req.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        res = await query_rag(req.question, req.language, req.history, req.state)

        # Log the query for analytics (hashed for privacy)
        portal_used = res.get("sources", [{}])[0].get("portal", "") if res.get("sources") else ""
        log_query(req.question, req.language, portal_used)

        return res
    except Exception:
        raise HTTPException(status_code=503, detail="The assistant is temporarily unavailable. Please try again.")

@router.get("/api/schemes")
def get_schemes(
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    lang: str = "en"
):
    schemes = load_all_schemes()
    
    # Apply category filter
    if category:
        schemes = [s for s in schemes if s.get("category", "").lower() == category.lower()]
        
    # Apply search filter
    if search:
        search_query = search.lower()
        schemes = [
            s for s in schemes 
            if search_query in s.get("name", "").lower() or search_query in s.get("description", "").lower()
        ]
        
    # Pagination
    total = len(schemes)
    start = (page - 1) * limit
    end = start + limit
    paginated_schemes = schemes[start:end]
    
    # Return brief summaries in cards list to keep bundle light
    summaries = []
    for s in paginated_schemes:
        name = get_cached_translation(s.get("name"), lang)
        desc = get_cached_translation(s.get("description", ""), lang)
        
        summaries.append({
            "name": name,
            "slug": s.get("slug"),
            "category": s.get("category"),
            "portal": s.get("portal"),
            "description": desc[:150] + "..." if len(desc) > 150 else desc,
            "application_url": s.get("application_url"),
            "source_url": s.get("source_url")
        })
        
    return {
        "schemes": summaries,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/api/schemes/{slug}")
def get_scheme_detail(slug: str, lang: str = "en"):
    schemes = load_all_schemes()
    for s in schemes:
        if s.get("slug") == slug:
            if lang != "en":
                s_translated = dict(s)
                s_translated["name"] = get_cached_translation(s.get("name"), lang)
                s_translated["description"] = get_cached_translation(s.get("description"), lang)
                if "eligibility" in s:
                    s_translated["eligibility"] = get_cached_translation(s.get("eligibility"), lang)
                if "documents" in s:
                    s_translated["documents"] = get_cached_translation(s.get("documents"), lang)
                if "steps" in s:
                    s_translated["steps"] = get_cached_translation(s.get("steps"), lang)
                return s_translated
            return s
    raise HTTPException(status_code=404, detail="Scheme not found.")

@router.get("/api/stats")
def get_dashboard_stats():
    schemes = load_all_schemes()
    
    # Portals count (max 6 portals, or directories in cleaned)
    portals = set()
    for s in schemes:
        portals.add(s.get("portal"))
        
    return {
        "schemes_count": len(schemes),
        "portals_count": len(portals) if portals else 6,
        "languages_count": 7
    }

@router.get("/api/analytics")
def get_dashboard_analytics():
    """Returns analytics data for the public analytics dashboard page."""
    try:
        from backend.database import get_analytics
        data = get_analytics()
    except Exception:
        data = {
            "total_queries": 0,
            "queries_by_day": [],
            "language_distribution": [],
            "portal_usage": [],
            "total_feedback": 0,
            "helpful_count": 0,
            "helpful_ratio": 0
        }

    try:
        schemes = load_all_schemes()
        portals = set(s.get("portal") for s in schemes)
        data["schemes_count"] = len(schemes)
        data["portals_count"] = len(portals) if portals else 6
    except Exception:
        pass

    return data

@router.post("/api/eligibility")
async def check_eligibility(req: EligibilityRequest, request: Request):
    """
    Provider-enhanced eligibility checker with a deterministic fallback.
    """
    await enforce_rate_limit(request, "eligibility", limit=20)
    try:
        from backend.rag import search_context

        # Build a descriptive query from the user profile
        profile_text = (
            f"Age: {req.age}, Gender: {req.gender}, State: {req.state}, "
            f"Occupation: {req.occupation}, Annual Income: Rs {req.annual_income:,}, "
            f"Caste Category: {req.caste_category.upper()}"
        )
        query = f"government schemes eligible for person with profile: {profile_text}"

        # Retrieve relevant scheme chunks using existing RAG search
        chunks = await asyncio.to_thread(search_context, query, 10)

        # Get scheme names from chunks
        seen_schemes = {}
        for c in chunks:
            name = c.get("scheme_name", "")
            if name and name not in seen_schemes:
                seen_schemes[name] = {
                    "name": name,
                    "portal": c.get("portal", ""),
                    "source_url": c.get("source_url", ""),
                    "apply_url": c.get("application_url", ""),
                    "description": c.get("raw_text", "")[:300]
                }

        scheme_list_text = "\n".join([
            f"- {name}: {info['description']}"
            for name, info in seen_schemes.items()
        ])

        prompt = f"""You are JanSahay AI, a helpful assistant for Indian government schemes.

A citizen has the following profile:
- Age: {req.age} years
- Gender: {req.gender}
- State: {req.state}
- Occupation: {req.occupation}
- Annual Income: Rs {req.annual_income:,}
- Caste Category: {req.caste_category.upper()}

Based ONLY on the following schemes available in the database, determine which ones this person is likely eligible for.
For each eligible scheme, explain in ONE simple sentence why they qualify.
If none clearly match, say so honestly.

Available Schemes:
{scheme_list_text}

Return your response in this EXACT JSON format (no extra text, just the JSON array):
[
  {{
    "scheme_name": "Name of scheme",
    "reason": "Why this person qualifies in one sentence",
    "confidence": "high/medium/low"
  }}
]"""

        try:
            response_text = await get_llm_provider().generate_structured_response(prompt, temperature=0.1)

            # Parse JSON response from Gemini
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                matches = json.loads(json_match.group())
            else:
                matches = []

            # Enrich with portal/URL info
            enriched = []
            for m in matches:
                if not isinstance(m, dict):
                    continue
                s_name = str(m.get("scheme_name") or "Eligible Government Scheme")
                scheme_info = seen_schemes.get(s_name, {})
                r_val = m.get("reason", "")
                if isinstance(r_val, list):
                    r_val = " ".join([str(x) for x in r_val])
                elif isinstance(r_val, dict):
                    r_val = str(r_val)
                else:
                    r_val = str(r_val or "Matches citizen demographic eligibility guidelines.")

                enriched.append({
                    "scheme_name": s_name,
                    "reason": r_val,
                    "confidence": str(m.get("confidence") or "medium").lower(),
                    "portal": str(scheme_info.get("portal") or ""),
                    "source_url": str(scheme_info.get("source_url") or ""),
                    "apply_url": str(scheme_info.get("apply_url") or "")
                })

            log_query(f"eligibility_check:{req.occupation}:{req.state}", "en", "eligibility")
            return {"matched_schemes": enriched, "profile": profile_text, "total_matched": len(enriched)}

        except (LLMProviderError, json.JSONDecodeError, TypeError):
            # Gemini quota exceeded or any API error — use rule-based fallback gracefully
            return _rule_based_eligibility(req, seen_schemes, profile_text)

    except Exception:
        raise HTTPException(status_code=500, detail="Unable to check eligibility right now.")

def _rule_based_eligibility(req, seen_schemes: dict, profile_text: str) -> dict:
    """
    Smart rule-based eligibility matching used as fallback when Gemini is
    unavailable (quota exceeded, no API key, etc.).
    """
    matched = []

    occ = req.occupation.lower()
    inc = req.annual_income
    age = req.age
    caste = req.caste_category.lower()
    gender = req.gender.lower()

    SCHEME_RULES = {
        "farmer":      lambda s: any(k in s["name"].lower() for k in ["kisan", "krishi", "farmer", "agriculture", "agri"]),
        "student":     lambda s: any(k in s["name"].lower() for k in ["scholarship", "student", "education", "vidya", "shiksha"]),
        "worker":      lambda s: any(k in s["name"].lower() for k in ["shram", "labour", "worker", "labour", "unorganized"]),
        "unemployed":  lambda s: any(k in s["name"].lower() for k in ["rozgar", "employment", "skill", "mudra", "msme"]),
        "salaried":    lambda s: any(k in s["name"].lower() for k in ["pension", "insurance", "bima", "epf", "provident"]),
        "self_employed": lambda s: any(k in s["name"].lower() for k in ["mudra", "msme", "startup", "business", "stand up"]),
    }

    income_rule   = lambda s: inc < 300000 or any(k in s["name"].lower() for k in ["jan dhan", "jdy", "bpl", "poverty", "ration"])
    health_rule   = lambda s: any(k in s["name"].lower() for k in ["health", "ayushman", "pmjay", "arogya", "medical"])
    sc_st_rule    = lambda s: caste in ("sc", "st") and any(k in s["name"].lower() for k in ["sc", "st", "tribal", "dalit", "scheduled"])
    obc_rule      = lambda s: caste == "obc" and any(k in s["name"].lower() for k in ["obc", "backward", "minority"])
    women_rule    = lambda s: gender == "female" and any(k in s["name"].lower() for k in ["mahila", "women", "woman", "beti", "stree"])
    senior_rule   = lambda s: age >= 60 and any(k in s["name"].lower() for k in ["pension", "senior", "elderly", "vridha"])

    occ_matcher = SCHEME_RULES.get(occ, lambda s: True)

    for name, info in seen_schemes.items():
        name_lower = name.lower()
        # Exclude student-specific scholarships for non-students over age 28
        if any(k in name_lower for k in ["scholarship", "student", "matric"]) and occ != "student" and age > 28:
            continue

        scheme_obj = {"name": name}
        reasons = []

        if occ_matcher(scheme_obj):
            reasons.append(f"suitable for {occ}s")
        if income_rule(scheme_obj):
            reasons.append("matches income bracket")
        if sc_st_rule(scheme_obj):
            reasons.append(f"reserved for {caste.upper()} category")
        if obc_rule(scheme_obj):
            reasons.append("available for OBC category")
        if women_rule(scheme_obj):
            reasons.append("women-specific benefit")
        if senior_rule(scheme_obj):
            reasons.append("senior citizen benefit")
        if health_rule(scheme_obj):
            reasons.append("healthcare coverage for all residents")

        if reasons or any(k in name.lower() for k in ["jan dhan", "ration", "ujjwala", "digital"]):
            confidence = "high" if len(reasons) >= 2 else "medium"
            matched.append({
                "scheme_name": name,
                "reason": f"This scheme is {' and '.join(reasons) if reasons else 'available to general public'}. Age: {age}, State: {req.state}.",
                "confidence": confidence,
                "portal": info.get("portal", ""),
                "source_url": info.get("source_url", ""),
                "apply_url": info.get("apply_url", "")
            })

    # Sort: high confidence first, limit to 8
    matched.sort(key=lambda x: 0 if x["confidence"] == "high" else 1)
    matched = matched[:8]

    log_query(f"eligibility_check:{req.occupation}:{req.state}", "en", "eligibility")
    return {"matched_schemes": matched, "profile": profile_text, "total_matched": len(matched)}

@router.post("/api/feedback")
def post_feedback(req: FeedbackRequest):
    try:
        save_feedback(req.question, req.helpful)
        return {"status": "success", "message": "Feedback logged successfully."}
    except Exception:
        raise HTTPException(status_code=503, detail="Feedback could not be saved right now.")
