import os
import json
import re
from datetime import datetime, timezone

# Setup directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
CLEANED_DIR = os.path.join(BASE_DIR, 'data', 'cleaned')
CHUNKS_DIR = os.path.join(BASE_DIR, 'data', 'chunks')

os.makedirs(CLEANED_DIR, exist_ok=True)
os.makedirs(CHUNKS_DIR, exist_ok=True)

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    USE_LANGCHAIN = True
except ImportError:
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        USE_LANGCHAIN = True
    except ImportError:
        USE_LANGCHAIN = False
        print("Langchain text splitters not installed. Using fallback custom RecursiveTextSplitter.")

class FallbackTextSplitter:
    def __init__(self, chunk_size=500, chunk_overlap=50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text):
        """Simple fallback word-level chunker."""
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk_words = words[i:i + self.chunk_size]
            chunks.append(" ".join(chunk_words))
            if i + self.chunk_size >= len(words):
                break
            i += self.chunk_size - self.chunk_overlap
        return chunks

def clean_text(text):
    if not text:
        return ""
    # Strip HTML tags
    text = re.sub(r'<[^>]*>', '', text)
    # Normalize whitespaces
    text = re.sub(r'\s+', ' ', text)
    # Remove duplicate lines/characters
    text = text.strip()
    return text

def parse_and_chunk_schemes():
    print("Starting Parsing and Chunking Pipeline...")
    all_chunks = []
    chunk_counter = 0
    
    # Text splitter initialization
    if USE_LANGCHAIN:
        splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    else:
        splitter = FallbackTextSplitter(chunk_size=120, chunk_overlap=15) # roughly 120 words ~ 500 characters
        
    for portal in os.listdir(RAW_DIR):
        portal_raw_path = os.path.join(RAW_DIR, portal)
        if not os.path.isdir(portal_raw_path):
            continue
            
        portal_cleaned_path = os.path.join(CLEANED_DIR, portal)
        os.makedirs(portal_cleaned_path, exist_ok=True)
        
        print(f"Processing portal: {portal}...")
        
        for filename in os.listdir(portal_raw_path):
            if not filename.endswith('.json') or filename == '.gitkeep':
                continue
                
            raw_file_path = os.path.join(portal_raw_path, filename)
            with open(raw_file_path, 'r', encoding='utf-8') as f:
                scheme = json.load(f)
                
            # Clean fields
            name = clean_text(scheme.get("name", ""))
            desc = clean_text(scheme.get("description", ""))
            elig = clean_text(scheme.get("eligibility", ""))
            docs = clean_text(scheme.get("documents", ""))
            steps = clean_text(scheme.get("steps", ""))
            app_url = scheme.get("application_url", "")
            src_url = scheme.get("source_url", "")
            
            cleaned_scheme = {
                "name": name,
                "description": desc,
                "eligibility": elig,
                "documents": docs,
                "steps": steps,
                "application_url": app_url,
                "source_url": src_url,
                "cleaned_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Save cleaned data
            cleaned_file_path = os.path.join(portal_cleaned_path, filename)
            with open(cleaned_file_path, 'w', encoding='utf-8') as cf:
                json.dump(cleaned_scheme, cf, indent=4, ensure_ascii=False)
                
            # Prepare texts to chunk
            sections = [
                {"name": "Description", "text": desc},
                {"name": "Eligibility", "text": elig},
                {"name": "Documents", "text": docs},
                {"name": "Steps", "text": steps}
            ]
            
            # Create chunks
            for sec in sections:
                if not sec["text"]:
                    continue
                    
                chunks = splitter.split_text(sec["text"])
                for idx, chunk_text in enumerate(chunks):
                    # Combine scheme header contexts to help the retrieval matches
                    full_context_text = f"Scheme: {name} | Section: {sec['name']} | Content: {chunk_text}"
                    
                    chunk_obj = {
                        "chunk_id": f"chunk_{chunk_counter}",
                        "scheme_name": name,
                        "portal": portal,
                        "section": sec["name"],
                        "text": full_context_text,
                        "raw_text": chunk_text,
                        "source_url": src_url,
                        "application_url": app_url
                    }
                    all_chunks.append(chunk_obj)
                    chunk_counter += 1
                    
    # Save all chunks to data/chunks/all_chunks.json
    chunks_output_path = os.path.join(CHUNKS_DIR, 'all_chunks.json')
    with open(chunks_output_path, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, indent=4, ensure_ascii=False)
        
    print(f"Parsing and chunking complete. Total chunks generated: {len(all_chunks)}.")

if __name__ == "__main__":
    parse_and_chunk_schemes()
