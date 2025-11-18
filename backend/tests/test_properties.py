from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def auth_token():
    data = {"username": "u1@example.com", "password": "Secret123"}
    r = client.post("/auth/token", data=data)
    assert r.status_code == 200
    return r.json()["access_token"]

def test_fuzzy_search():
    token = auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    r = client.get("/properties", params={"q": "abdoun"}, headers=headers)
    assert r.status_code == 200
    titles = [x["title"].lower() for x in r.json()]
    assert any("abdoun" in t for t in titles)

    rc = client.get("/properties/count", params={"q": "abdoun"}, headers=headers)
    assert rc.status_code == 200
    assert rc.json()["count"] >= 1