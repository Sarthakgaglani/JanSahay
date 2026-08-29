import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ensure the parent directory is in python path to allow importing backend.*
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routes import router
from backend.rag import init_rag_system
from backend.database import init_db

app = FastAPI(
    title="JanSahay AI API",
    description="Backend API for multilingual RAG government scheme query assistant",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://jansahay.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("Initializing Database...")
    init_db()
    
    print("Initializing RAG index system...")
    init_rag_system()
    
    print("JanSahay AI Backend Startup Sequence Completed.")

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "service": "JanSahay AI API",
        "version": "1.0",
        "endpoints": ["/api/chat", "/api/schemes", "/api/schemes/{slug}", "/api/stats", "/api/feedback"]
    }

# Include routers
app.include_router(router)

if __name__ == "__main__":
    # Start the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
