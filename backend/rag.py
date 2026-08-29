import os
import json
import re
import math
from datetime import datetime
from dotenv import load_dotenv

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

# Initialize Translation library
try:
    from deep_translator import GoogleTranslator
    HAS_TRANSLATOR = True
except ImportError:
    HAS_TRANSLATOR = False
    print("deep-translator not installed. Translation features will be mocked.")

# Initialize Gemini Client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
USE_MOCK_LLM = False

if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    print("Warning: GEMINI_API_KEY not set or invalid. Running in MOCK LLM mode.")
    USE_MOCK_LLM = True
else:
    try:
        from google import genai as _genai_check
        USE_MOCK_LLM = False
    except ImportError:
        try:
            import google.generativeai as _genai_old_check
            USE_MOCK_LLM = False
        except ImportError:
            print("Warning: google-genai package not installed. Running in MOCK LLM mode.")
            USE_MOCK_LLM = True

def init_rag_system():
    """Load indices and models into memory."""
    global faiss_index, metadata_chunks, tfidf_index, model
    
    # 1. Load metadata chunks
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            metadata_chunks = json.load(f)
        print(f"Loaded {len(metadata_chunks)} chunks of metadata.")
    else:
        print(f"Warning: Metadata file not found at {METADATA_FILE}")
        
    # 2. Try loading FAISS / ML packages
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
        print(f"Failed to load ML search index: {e}. Falling back to TF-IDF.")
        
    # 3. Fallback to TF-IDF
    if os.path.exists(TFIDF_INDEX_FILE):
        with open(TFIDF_INDEX_FILE, 'r', encoding='utf-8') as f:
            tfidf_index = json.load(f)
        print("TF-IDF fallback index loaded successfully.")
    else:
        print("Warning: No index files found. Queries will run without context.")

def clean_and_tokenize(text):
    text = text.lower()
    words = [re.sub(r'[^\w\s]', '', w) for w in text.split()]
    return [w for w in words if w]

def tfidf_search_query(query, k=5):
    """Fallback search using pure Python TF-IDF cosine similarity."""
    global tfidf_index, metadata_chunks
    if not tfidf_index or not metadata_chunks:
        return []
        
    query_tokens = clean_and_tokenize(query)
    if not query_tokens:
        return []
        
    vocab = tfidf_index["vocab"]
    idf = tfidf_index["idf"]
    vectors = tfidf_index["vectors"]
    vocab_idx = {word: i for i, word in enumerate(vocab)}
    
    # Compute query TF-IDF vector
    query_tf = {}
    for word in query_tokens:
        query_tf[word] = query_tf.get(word, 0) + 1
        
    query_vector = {}
    query_norm = 0
    for word, freq in query_tf.items():
        if word in vocab_idx:
            idx_str = str(vocab_idx[word])
            val = (freq / len(query_tokens)) * idf.get(word, 1.0)
            query_vector[idx_str] = val
            query_norm += val * val
    query_norm = math.sqrt(query_norm)
    
    if query_norm == 0:
        # If no terms match vocabulary, return first k as fallback
        return metadata_chunks[:k]
        
    # Compute cosine similarity for each document vector
    scores = []
    for doc_idx, doc_vector in enumerate(vectors):
        dot_product = 0
        doc_norm = 0
        
        # Doc norm
        for idx_str, val in doc_vector.items():
            doc_norm += val * val
            if idx_str in query_vector:
                dot_product += val * query_vector[idx_str]
                
        doc_norm = math.sqrt(doc_norm)
        if doc_norm == 0:
            score = 0
        else:
            score = dot_product / (query_norm * doc_norm)
            
        scores.append((doc_idx, score))
        
    # Sort and return top k chunks
    scores.sort(key=lambda x: x[1], reverse=True)
    top_indices = [idx for idx, score in scores[:k] if score > 0]
    
    # If no matches, fallback to first k
    if not top_indices:
        return metadata_chunks[:k]
        
    return [metadata_chunks[i] for i in top_indices]

def search_context(query, k=5):
    """Retrieve top k matching chunks for query."""
    global faiss_index, model, metadata_chunks
    
    if faiss_index is not None and model is not None:
        try:
            import numpy as np
            query_emb = model.encode([query])
            distances, indices = faiss_index.search(np.array(query_emb).astype("float32"), k)
            results = []
            for idx in indices[0]:
                if idx < len(metadata_chunks) and idx >= 0:
                    results.append(metadata_chunks[idx])
            return results
        except Exception as e:
            print(f"FAISS search failed: {e}. Trying TF-IDF fallback...")
            
    return tfidf_search_query(query, k)

def translate_text(text, dest_lang="en"):
    """Translate text using deep-translator with robust fallback."""
    if not HAS_TRANSLATOR or (dest_lang == "en" and text.isascii()):
        return text
        
    try:
        # deep-translator works directly over HTTP
        translated = GoogleTranslator(source='auto', target=dest_lang).translate(text)
        return translated
    except Exception as e:
        print(f"Translation failed ({dest_lang}): {e}")
        return text

def build_mock_llm_response(question, chunks):
    """Simulates Gemini LLM response using retrieved context chunks."""
    if not chunks:
        return "I could not find this information. Please visit the official portal."
        
    # Match the best chunk to construct answer
    best_chunk = chunks[0]
    scheme_name = best_chunk.get("scheme_name", "Scheme")
    section = best_chunk.get("section", "Description")
    raw_text = best_chunk.get("raw_text", "")
    
    # Generate structured answer based on question type
    q = question.lower()
    if "exclusion" in q or "exclude" in q or "not eligible" in q:
        # Find eligibility chunk (which usually contains exclusions)
        elig_chunks = [c for c in chunks if c["section"] == "Eligibility"]
        chunk_to_use = elig_chunks[0] if elig_chunks else best_chunk
        return f"Regarding **{scheme_name}** exclusions:\n\n{chunk_to_use.get('raw_text', '')}\n\nPlease check the official portal for full exclusion parameters: {chunk_to_use.get('source_url', '')}."
    elif "eligibility" in q or "qualify" in q or "who can" in q:
        # Find eligibility chunk if possible
        elig_chunks = [c for c in chunks if c["section"] == "Eligibility"]
        chunk_to_use = elig_chunks[0] if elig_chunks else best_chunk
        return f"Regarding **{scheme_name}** eligibility: \n\n{chunk_to_use.get('raw_text', '')}\n\nPlease verify details on the official portal: {chunk_to_use.get('source_url', '')}."
    elif "document" in q or "what do i need" in q or "papers" in q:
        doc_chunks = [c for c in chunks if c["section"] == "Documents"]
        chunk_to_use = doc_chunks[0] if doc_chunks else best_chunk
        return f"To apply for **{scheme_name}**, the required documents are: \n\n{chunk_to_use.get('raw_text', '')}\n\nPlease check the official portal for guidelines: {chunk_to_use.get('source_url', '')}."
    else:
        # General question response
        desc_chunks = [c for c in chunks if c["section"] == "Description"]
        chunk_to_use = desc_chunks[0] if desc_chunks else best_chunk
        return f"Here is the details for **{scheme_name}**:\n\n{chunk_to_use.get('raw_text', '')}\n\nOfficial Apply Link: {chunk_to_use.get('application_url', '')}."

def reformulate_query_fallback(question: str, history: list) -> str:
    """Fallback query reformulation based on rules."""
    q = question.lower()
    pronouns = ["above", "it", "this", "that", "them", "scheme", "scholarship", "loan"]
    needs_context = any(p in q for p in pronouns)
    
    if not needs_context or not history:
        return question
        
    # Find the last scheme name mentioned by the assistant
    last_scheme = None
    for msg in reversed(history):
        # Handle pydantic object vs dict compatibility
        msg_sender = getattr(msg, "sender", None) or msg.get("sender", "")
        msg_text = getattr(msg, "text", None) or msg.get("text", "")
        
        if msg_sender == "assistant":
            # Search for scheme names in **double asterisks** or common names
            match = re.search(r'\*\*([^*]+)\*\*', msg_text)
            if match:
                last_scheme = match.group(1)
                break
                
    if last_scheme:
        # Append the scheme name to make the search contextual
        return f"{question} ({last_scheme})"
        
    return question

async def rewrite_query_with_gemini(question: str, history: list) -> str:
    """Rewrite follow-up question using Gemini to be standalone and self-contained."""
    if not history:
        return question
        
    history_str = ""
    for m in history[-5:]:  # Take the last 5 turns to keep it fast
        msg_sender = getattr(m, "sender", None) or m.get("sender", "")
        msg_text = getattr(m, "text", None) or m.get("text", "")
        history_str += f"{msg_sender.capitalize()}: {msg_text}\n"
        
    prompt = f"""You are a query rewriting assistant. Given the chat history and a follow-up question, rewrite the follow-up question to be a self-contained, standalone search query in English that has all the necessary context from the history.
Do NOT answer the question. Just return the rewritten question text.

History:
{history_str}

Follow-up: {question}
Standalone English Query:"""

    try:
        # Try new google.genai SDK first
        try:
            from google import genai as new_genai
            client = new_genai.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt,
                config=new_genai.types.GenerateContentConfig(temperature=0.1)
            )
            rewritten = response.text.strip()
        except (ImportError, AttributeError):
            # Fallback to old google.generativeai SDK
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_API_KEY)
            model_gemini = genai.GenerativeModel('gemini-2.0-flash')
            response = model_gemini.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(temperature=0.1)
            )
            rewritten = response.text.strip()
        print(f"Gemini query rewrite: '{question}' -> '{rewritten}'")
        return rewritten
    except Exception as e:
        print(f"Gemini rewrite failed: {e}. Using fallback.")
        return reformulate_query_fallback(question, history)

async def query_rag(question: str, language: str = "en", history: list = None, state: str = "") -> dict:
    """Core RAG pipeline: Translation, Retrieval, LLM query, and formatting."""
    # 1. Translate question to English for retrieval
    query_en = question
    if language != "en":
        print(f"Translating query from {language} to en: {question}")
        query_en = translate_text(question, dest_lang="en")
        print(f"Translated query: {query_en}")
        
    # 1.5. Rewrite query using history to make it standalone
    if history:
        if USE_MOCK_LLM:
            query_en = reformulate_query_fallback(query_en, history)
        else:
            query_en = await rewrite_query_with_gemini(query_en, history)
        print(f"Reformulated query for RAG: {query_en}")
        
    # 2. Retrieve relevant context
    chunks = search_context(query_en, k=5)
    
    # 3. Create context string
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
            
    # 4. Prompt building
    state_context = f"\nUser's State/Location: {state}. Prioritize state-specific information and schemes where applicable." if state else ""
    prompt = f"""You are JanSahay AI, a helpful public assistant for Indian government schemes.
Answer the user's question clearly, politely, and factual, based ONLY on the provided context.
If the context does not have the answer or is not relevant, say: "I could not find this information in the database. Please check the official portal."
Always keep the answers clear and simple, structured in bullet points where appropriate.{state_context}

Context:
{context_str}

Question:
{query_en}

Provide a direct, helpful response:"""

    # 5. Get Answer (Gemini or Mock)
    if USE_MOCK_LLM:
        answer_en = build_mock_llm_response(query_en, chunks)
    else:
        try:
            # Try new google.genai SDK first
            try:
                from google import genai as new_genai
                client = new_genai.Client(api_key=GEMINI_API_KEY)
                response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=prompt,
                    config=new_genai.types.GenerateContentConfig(temperature=0.2)
                )
                answer_en = response.text.strip()
            except (ImportError, AttributeError):
                # Fallback to old google.generativeai SDK
                import google.generativeai as genai
                genai.configure(api_key=GEMINI_API_KEY)
                model_gemini = genai.GenerativeModel('gemini-2.0-flash')
                response = model_gemini.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(temperature=0.2)
                )
                answer_en = response.text.strip()
        except Exception as e:
            print(f"Gemini API call failed: {e}. Falling back to mock generator.")
            answer_en = build_mock_llm_response(query_en, chunks)
            
    # 6. Translate response back to user language
    answer_final = answer_en
    if language != "en":
        print(f"Translating response from en to {language}...")
        answer_final = translate_text(answer_en, dest_lang=language)
        
    return {
        "answer": answer_final,
        "sources": sources,
        "language": language
    }
