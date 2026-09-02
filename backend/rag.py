import os
import json
import re
import math
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from backend.llm import LLMProviderError, get_llm_provider

# Load environment variables using absolute path
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, '.env'))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VECTORDB_DIR = os.path.join(BASE_DIR, 'data', 'vectordb')
METADATA_FILE = os.path.join(VECTORDB_DIR, 'metadata.json')
FAISS_INDEX_FILE = os.path.join(VECTORDB_DIR, 'faiss_index.bin')
TFIDF_INDEX_FILE = os.path.join(VECTORDB_DIR, 'tfidf_index.json')

# Global variables for index
faiss_index = None
metadata_chunks = []
tfidf_index = None
model = None

# Stopwords & Domain Synonyms for search optimization
STOPWORDS = {
    'tell', 'me', 'about', 'the', 'schemes', 'scheme', 'related', 'to', 'a', 'an', 'in', 'of', 'for', 'is', 'are',
    'what', 'which', 'how', 'can', 'i', 'get', 'give', 'information', 'details', 'detail', 'know', 'want', 'please',
    'show', 'list', 'any', 'some', 'with', 'on', 'at', 'by', 'from', 'this', 'that', 'these', 'those', 'there', 'who'
}

DOMAIN_SYNONYMS = {
    'farmer': ['farmer', 'kisan', 'agriculture', 'fasal', 'farming', 'farm', 'crop'],
    'farmers': ['farmer', 'kisan', 'agriculture', 'fasal', 'farming', 'farm', 'crop'],
    'farming': ['farmer', 'kisan', 'agriculture', 'fasal', 'farming', 'farm', 'crop'],
    'kisan': ['farmer', 'kisan', 'agriculture', 'fasal', 'farming', 'farm', 'crop'],
    'student': ['student', 'scholarship', 'education', 'matric', 'vidyalaxmi', 'college', 'school'],
    'students': ['student', 'scholarship', 'education', 'matric', 'vidyalaxmi', 'college', 'school'],
    'scholarship': ['student', 'scholarship', 'education', 'matric', 'vidyalaxmi', 'minority'],
    'scholarships': ['student', 'scholarship', 'education', 'matric', 'vidyalaxmi', 'minority'],
    'pension': ['pension', 'atal', 'apy', 'senior', 'elderly', 'old age'],
    'health': ['health', 'ayushman', 'pmjay', 'hospital', 'insurance', 'medical', 'bima'],
    'loan': ['loan', 'mudra', 'svanidhi', 'credit', 'business', 'vendor'],
    'loans': ['loan', 'mudra', 'svanidhi', 'credit', 'business', 'vendor'],
    'vendor': ['svanidhi', 'street vendor', 'loan', 'vendor', 'business'],
    'vendors': ['svanidhi', 'street vendor', 'loan', 'vendor', 'business'],
    'house': ['awas', 'housing', 'home', 'shelter', 'pmay'],
    'housing': ['awas', 'housing', 'home', 'shelter', 'pmay'],
}

# Initialize Translation library
try:
    from deep_translator import GoogleTranslator
    HAS_TRANSLATOR = True
except ImportError:
    HAS_TRANSLATOR = False
    print("deep-translator not installed. Translation features will be mocked.")

LLM_PROVIDER = get_llm_provider()
USE_MOCK_LLM = not LLM_PROVIDER.is_available


def init_rag_system():
    """Load indices and models into memory."""
    global faiss_index, metadata_chunks, tfidf_index, model
    
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            metadata_chunks = json.load(f)
        print(f"Loaded {len(metadata_chunks)} chunks of metadata.")
    else:
        print(f"Warning: Metadata file not found at {METADATA_FILE}")
        
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        import numpy as np
        
        if os.path.exists(FAISS_INDEX_FILE) and len(metadata_chunks) > 0:
            print("Loading ML model SentenceTransformer('all-MiniLM-L6-v2')...")
            model = SentenceTransformer("all-MiniLM-L6-v2")
            print("Loading FAISS index...")
            faiss_index = faiss.read_index(FAISS_INDEX_FILE)
            print("FAISS index loaded successfully.")
            return
    except Exception as e:
        print(f"Failed to load ML search index: {e}. Falling back to TF-IDF & Keyword Search.")
        
    if os.path.exists(TFIDF_INDEX_FILE):
        with open(TFIDF_INDEX_FILE, 'r', encoding='utf-8') as f:
            tfidf_index = json.load(f)
        print("TF-IDF fallback index loaded successfully.")


def clean_and_tokenize(text):
    """Clean text, remove stopwords, and expand domain synonyms."""
    words = [re.sub(r'[^\w\s]', '', w.lower()) for w in text.split()]
    tokens = [w for w in words if w and w not in STOPWORDS]
    expanded = set(tokens)
    for t in tokens:
        if t in DOMAIN_SYNONYMS:
            expanded.update(DOMAIN_SYNONYMS[t])
    return list(expanded)


def search_context(query, k=5):
    """Retrieve top k matching chunks for query with keyword boosting & title scoring."""
    global faiss_index, model, metadata_chunks
    
    if not metadata_chunks:
        return []

    # 1. Try FAISS if available
    if faiss_index is not None and model is not None:
        try:
            import numpy as np
            query_emb = model.encode([query])
            distances, indices = faiss_index.search(np.array(query_emb).astype("float32"), k)
            results = []
            for idx in indices[0]:
                if idx < len(metadata_chunks) and idx >= 0:
                    results.append(metadata_chunks[idx])
            if results:
                return results
        except Exception as e:
            print(f"FAISS search failed: {e}. Falling back to Keyword search...")

    # 2. Enhanced Keyword & Relevance Search
    query_tokens = clean_and_tokenize(query)
    if not query_tokens:
        return metadata_chunks[:k]
        
    scores = []
    for idx, chunk in enumerate(metadata_chunks):
        scheme_name = (chunk.get('scheme_name') or '').lower()
        chunk_text = (chunk.get('text') or '').lower()
        
        score = 0
        for token in query_tokens:
            if token in scheme_name:
                score += 5.0
            if token in chunk_text:
                score += 1.5 + chunk_text.count(token) * 0.5
                
        scores.append((idx, score))
        
    scores.sort(key=lambda x: x[1], reverse=True)
    top_indices = [idx for idx, s in scores[:k] if s > 0]
    
    if not top_indices:
        return metadata_chunks[:k]
        
    return [metadata_chunks[i] for i in top_indices]


def translate_text(text, dest_lang="en"):
    """Translate text using deep-translator with robust fallback."""
    if not text or not HAS_TRANSLATOR or dest_lang == "en":
        return text

    try:
        translated = GoogleTranslator(source='auto', target=dest_lang).translate(text)
        if not translated or "Error 500" in translated or "That’s an error" in translated or "Server Error" in translated:
            return text
        return translated
    except Exception as e:
        print(f"Translation failed ({dest_lang}): {e}")
        return text


def build_mock_llm_response(question, chunks):
    """Simulates or formats response using retrieved context chunks."""
    if not chunks:
        return "JanSahay AI provides guidance on Indian Government Schemes including PM Kisan, Ayushman Bharat, Scholarships, and APY. Please try asking about a specific scheme or category!"
        
    best_chunk = chunks[0]
    scheme_name = best_chunk.get("scheme_name", "Government Scheme")
    
    # Collect all relevant chunks for this scheme
    scheme_chunks = [c for c in chunks if c.get("scheme_name") == scheme_name]
    if not scheme_chunks:
        scheme_chunks = chunks[:3]
        
    desc = next((c.get("raw_text") for c in scheme_chunks if c.get("section") == "Description"), best_chunk.get("raw_text", ""))
    elig = next((c.get("raw_text") for c in scheme_chunks if c.get("section") == "Eligibility"), None)
    docs = next((c.get("raw_text") for c in scheme_chunks if c.get("section") == "Documents"), None)
    steps = next((c.get("raw_text") for c in scheme_chunks if c.get("section") == "Steps"), None)
    
    response = f"### **{scheme_name}**\n\n{desc}\n\n"
    if elig:
        response += f"#### **Eligibility Criteria:**\n{elig}\n\n"
    if docs:
        response += f"#### **Required Documents:**\n{docs}\n\n"
    if steps:
        response += f"#### **Application Steps:**\n{steps}\n\n"
        
    response += f"📌 **Official Portal:** [{best_chunk.get('source_url', 'https://myscheme.gov.in')}]({best_chunk.get('source_url', 'https://myscheme.gov.in')})"
    return response


def reformulate_query_fallback(question: str, history: list) -> str:
    """Fallback query reformulation based on rules."""
    q = question.lower()
    pronouns = ["above", "it", "this", "that", "them", "scheme", "scholarship", "loan"]
    needs_context = any(p in q for p in pronouns)
    
    if not needs_context or not history:
        return question
        
    last_scheme = None
    for msg in reversed(history):
        msg_sender = getattr(msg, "sender", None) or msg.get("sender", "")
        msg_text = getattr(msg, "text", None) or msg.get("text", "")
        
        if msg_sender == "assistant":
            match = re.search(r'\*\*([^*]+)\*\*', msg_text)
            if match:
                last_scheme = match.group(1)
                break
                
    if last_scheme:
        return f"{question} ({last_scheme})"
        
    return question


async def rewrite_query_with_gemini(question: str, history: list) -> str:
    """Rewrite follow-up question using Gemini to be standalone."""
    if not history:
        return question
        
    history_str = ""
    for m in history[-5:]:
        msg_sender = getattr(m, "sender", None) or m.get("sender", "")
        msg_text = getattr(m, "text", None) or m.get("text", "")
        history_str += f"{msg_sender.capitalize()}: {msg_text}\n"
        
    prompt = f"""You are a query rewriting assistant. Given the chat history and a follow-up question, rewrite the follow-up question to be a self-contained, standalone search query in English.
Do NOT answer the question. Just return the rewritten query text.

History:
{history_str}

Follow-up: {question}
Standalone English Query:"""

    try:
        rewritten = await LLM_PROVIDER.generate_response(prompt, temperature=0.1)
        return rewritten or reformulate_query_fallback(question, history)
    except LLMProviderError:
        return reformulate_query_fallback(question, history)


async def query_rag(question: str, language: str = "en", history: list = None, state: str = "") -> dict:
    """Core RAG pipeline: Translation, Retrieval, LLM query, and formatting."""
    query_en = question
    if language != "en":
        query_en = await asyncio.to_thread(translate_text, question, "en")
        
    if history:
        if USE_MOCK_LLM:
            query_en = reformulate_query_fallback(query_en, history)
        else:
            query_en = await rewrite_query_with_gemini(query_en, history)
        
    chunks = await asyncio.to_thread(search_context, query_en, 5)
    
    context_str = ""
    sources = []
    seen_urls = set()
    
    for c in chunks:
        context_str += f"Portal: {c.get('portal', '')}\nScheme: {c.get('scheme_name', '')}\nSection: {c.get('section', '')}\nContent: {c.get('raw_text', '')}\n\n"
        
        url = c.get("source_url")
        if url and url not in seen_urls:
            seen_urls.add(url)
            sources.append({
                "scheme_name": c.get("scheme_name"),
                "portal": c.get("portal"),
                "url": url,
                "apply_url": c.get("application_url")
            })
            
    prompt = f"""You are JanSahay AI, a highly intelligent, empathetic, and knowledgeable assistant for Indian government schemes.
Your goal is to provide helpful, clear, and well-structured answers to citizens looking for government scheme information.

Context from Database:
{context_str}

User Location/State: {state if state else "India"}
User Question: {query_en}

Instructions:
1. Provide a comprehensive, clear, and well-structured response using markdown (bold titles, bullet points for eligibility, key benefits, and required documents).
2. If the user asks general questions or greetings (e.g., "Hello", "How does JanSahay work?"), answer warmly as JanSahay AI.
3. If the context contains details about a matching scheme, synthesize and present it clearly. If the exact answer is missing from the provided context chunks, use your comprehensive knowledge of Indian government schemes to provide accurate information and guide the user to official portals like https://myscheme.gov.in.
4. Never reply with robotic refusal messages like "I could not find this information". Always be helpful and informative!

Provide a direct, friendly response:"""

    if USE_MOCK_LLM:
        answer_en = build_mock_llm_response(query_en, chunks)
    else:
        try:
            answer_en = await LLM_PROVIDER.generate_response(prompt, temperature=0.3)
            if not answer_en or "I could not find" in answer_en:
                answer_en = build_mock_llm_response(query_en, chunks)
        except LLMProviderError:
            answer_en = build_mock_llm_response(query_en, chunks)
            
    answer_final = answer_en
    if language != "en":
        answer_final = await asyncio.to_thread(translate_text, answer_en, language)
        
    return {
        "answer": answer_final,
        "sources": sources,
        "language": language
    }
