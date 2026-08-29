import asyncio
import sys
import os

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from rag import init_rag_system, query_rag

async def run_tests():
    print("Initializing RAG system...")
    init_rag_system()
    
    test_queries = [
        {"question": "Who is eligible for PM-KISAN scheme?", "lang": "en"},
        {"question": "पीएम-किसान योजना के लिए कौन पात्र है?", "lang": "hi"},
        {"question": "What documents are needed for Ayushman Bharat card?", "lang": "en"}
    ]
    
    for test in test_queries:
        print("\n" + "="*50)
        print(f"QUERY [{test['lang']}]: {test['question']}")
        print("="*50)
        
        res = await query_rag(test['question'], language=test['lang'])
        print(f"\n[ANSWER ({res['language']})]:")
        print(res['answer'])
        
        print("\n[SOURCES]:")
        for src in res['sources']:
            print(f" - {src['scheme_name']} ({src['portal']}): {src['url']}")

if __name__ == "__main__":
    asyncio.run(run_tests())
