import sys
import os
import logging
import time
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ensure parent directory and current directory are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from backend.routes import router
    from backend.auth_routes import router as auth_router
    from backend.application_routes import router as applications_router
    from backend.rag import init_rag_system
    from backend.database import get_connection, init_db
    from backend.llm import get_llm_provider
except ModuleNotFoundError:
    from routes import router
    from auth_routes import router as auth_router
    from application_routes import router as applications_router
    from rag import init_rag_system
    from database import get_connection, init_db
    from llm import get_llm_provider

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("jansahay.api")

app = FastAPI(
    title="JanSahay AI API",
    description="Backend API for multilingual RAG government scheme query assistant",
    version="1.0"
)

cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,https://jansahay.vercel.app").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit() and int(content_length) > 1_000_000:
        response = JSONResponse(status_code=413, content={"success": False, "error": {"code": "payload_too_large", "message": "Request payload is too large."}})
        response.headers["X-Request-ID"] = request_id
        return response
    started = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Unhandled request error request_id=%s method=%s path=%s", request_id, request.method, request.url.path)
        response = JSONResponse(status_code=500, content={"success": False, "error": {"code": "internal_error", "message": "Something went wrong. Please try again."}})
    response.headers["X-Request-ID"] = request_id
    logger.info("request_id=%s method=%s path=%s status=%s duration_ms=%.1f", request_id, request.method, request.url.path, response.status_code, (time.perf_counter() - started) * 1000)
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if request.url.path.startswith("/api/v1/"):
        detail = exc.detail if isinstance(exc.detail, dict) else {"code": "request_error", "message": str(exc.detail)}
        return JSONResponse(status_code=exc.status_code, content={"success": False, "error": detail}, headers=exc.headers)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers)

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
        "endpoints": ["/api/chat", "/api/schemes", "/api/schemes/{slug}", "/api/stats", "/api/feedback", "/api/v1/health"]
    }


@app.get("/api/v1/health")
async def health():
    provider = get_llm_provider()
    return {"success": True, "message": "Healthy", "data": {"status": "ok", "llm_provider": provider.name, "llm_available": provider.is_available}}


@app.get("/api/v1/health/live")
async def health_live():
    return {"success": True, "message": "Live", "data": {"status": "ok"}}


@app.get("/api/v1/health/ready")
async def health_ready():
    try:
        connection = get_connection()
        connection.close()
    except Exception:
        return JSONResponse(status_code=503, content={"success": False, "error": {"code": "dependency_unavailable", "message": "Database is unavailable."}})
    return {"success": True, "message": "Ready", "data": {"status": "ok"}}

# Include routers
app.include_router(router)
app.include_router(auth_router)
app.include_router(applications_router)

if __name__ == "__main__":
    # Start the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
