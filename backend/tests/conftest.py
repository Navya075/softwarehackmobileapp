import pytest
from starlette.testclient import TestClient
from main import app
from firebase.firestore import FirestoreRepository
from simulator.simulator import simulator

@pytest.fixture(autouse=True)
def reset_state():
    FirestoreRepository.reset_in_memory_store()
    simulator.reset_demo()
    yield
    FirestoreRepository.reset_in_memory_store()

@pytest.fixture
def client():
    # Pass demo auth header for authenticated tests
    with TestClient(app) as test_client:
        test_client.headers = {"Authorization": "Bearer demo-token"}
        yield test_client
