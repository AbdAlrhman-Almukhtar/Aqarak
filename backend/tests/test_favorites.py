import os
os.environ.setdefault("OPENAI_API_KEY", "test-key")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def auth():
    r = client.post(
        "/auth/token",
        data={"username": "u1@example.com", "password": "Secret123"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    r.raise_for_status()
    return {"Authorization": f"Bearer {r.json()['access_token']}"}

def test_favorites_flow():
    h = auth()
    resp = client.post("/favorites/1", headers=h)
    assert resp.status_code in (200, 201)
    cnt = client.get("/favorites/count", headers=h).json()["count"]
    assert cnt >= 1
    lst = client.get("/favorites/my", headers=h).json()
    assert any(p["id"] == 1 for p in lst)
    assert client.delete("/favorites/1", headers=h).status_code == 204