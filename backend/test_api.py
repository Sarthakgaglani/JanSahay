"""
JanSahay AI — Backend API Tests
Run with: python -m pytest backend/test_api.py -v
"""
import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Use TestClient (synchronous) instead of httpx for simplicity
from backend.main import app

client = TestClient(app)


# ────────────────────────────────────────────────
# 1. Root / Health endpoint
# ────────────────────────────────────────────────
def test_root_health():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "JanSahay" in data["service"]


# ────────────────────────────────────────────────
# 2. Stats endpoint
# ────────────────────────────────────────────────
def test_get_stats():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "schemes_count" in data
    assert "portals_count" in data
    assert "languages_count" in data
    assert data["languages_count"] == 7


# ────────────────────────────────────────────────
# 3. Schemes list endpoint
# ────────────────────────────────────────────────
def test_get_schemes_default():
    response = client.get("/api/schemes")
    assert response.status_code == 200
    data = response.json()
    assert "schemes" in data
    assert "total" in data
    assert "page" in data
    assert isinstance(data["schemes"], list)


def test_get_schemes_with_category():
    response = client.get("/api/schemes", params={"category": "Health"})
    assert response.status_code == 200
    data = response.json()
    for scheme in data["schemes"]:
        assert scheme["category"].lower() == "health"


def test_get_schemes_pagination():
    response = client.get("/api/schemes", params={"page": 1, "limit": 5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["schemes"]) <= 5


# ────────────────────────────────────────────────
# 4. Analytics endpoint
# ────────────────────────────────────────────────
def test_get_analytics():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "total_queries" in data
    assert "language_distribution" in data
    assert "portal_usage" in data
    assert "queries_by_day" in data
    assert "helpful_ratio" in data


# ────────────────────────────────────────────────
# 5. Chat endpoint (mock mode if no API key)
# ────────────────────────────────────────────────
def test_chat_basic():
    response = client.post("/api/chat", json={
        "question": "What is PM-KISAN scheme?",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data
    assert "language" in data
    assert isinstance(data["sources"], list)


def test_chat_empty_question():
    response = client.post("/api/chat", json={
        "question": "",
        "language": "en"
    })
    assert response.status_code == 400


def test_chat_with_history():
    response = client.post("/api/chat", json={
        "question": "Tell me more about it",
        "language": "en",
        "history": [
            {"sender": "user", "text": "What is eSHRAM?"},
            {"sender": "assistant", "text": "eSHRAM is a national database for unorganised workers."}
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data


# ────────────────────────────────────────────────
# 6. Eligibility endpoint
# ────────────────────────────────────────────────
def test_eligibility_basic():
    response = client.post("/api/eligibility", json={
        "age": 30,
        "gender": "male",
        "state": "Rajasthan",
        "occupation": "farmer",
        "annual_income": 80000,
        "caste_category": "general"
    })
    assert response.status_code == 200
    data = response.json()
    assert "matched_schemes" in data
    assert "total_matched" in data
    assert "profile" in data
    assert isinstance(data["matched_schemes"], list)


def test_eligibility_student():
    response = client.post("/api/eligibility", json={
        "age": 19,
        "gender": "female",
        "state": "Maharashtra",
        "occupation": "student",
        "annual_income": 250000,
        "caste_category": "sc"
    })
    assert response.status_code == 200
    data = response.json()
    assert "matched_schemes" in data


# ────────────────────────────────────────────────
# 7. Feedback endpoint
# ────────────────────────────────────────────────
def test_post_feedback_helpful():
    response = client.post("/api/feedback", json={
        "question": "What is Ayushman Bharat?",
        "helpful": True
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


def test_post_feedback_not_helpful():
    response = client.post("/api/feedback", json={
        "question": "Some test question",
        "helpful": False
    })
    assert response.status_code == 200


# ────────────────────────────────────────────────
# 8. 404 for unknown scheme
# ────────────────────────────────────────────────
def test_scheme_detail_not_found():
    response = client.get("/api/schemes/this-scheme-does-not-exist-xyz")
    assert response.status_code == 404
