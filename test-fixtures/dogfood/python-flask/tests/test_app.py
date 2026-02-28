import pytest
from src.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health(client):
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.json == {'status': 'ok'}

def test_get_users(client):
    resp = client.get('/api/users')
    assert resp.status_code == 200
    assert 'users' in resp.json
