# tests/test_providers/test_nasa.py
import pytest
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from envirosearch.providers.nasa import NASAProvider, NASACredentials
from envirosearch.core.protocols import QueryParams

# Load environment variables
load_dotenv()

@pytest.fixture(scope="module")
def nasa_credentials():
    token = os.getenv("NASA_TOKEN")
    if not token:
        pytest.skip("NASA_TOKEN not found in environment variables")
    return NASACredentials(api_key=token)

@pytest.fixture(scope="module")
def nasa_provider(nasa_credentials):
    return NASAProvider(nasa_credentials)

def test_nasa_provider_metadata(nasa_provider):
    """Test NASA provider metadata"""
    metadata = nasa_provider.get_metadata()
    assert metadata["name"] == "NASA MODIS"
    assert metadata["collection_id"] == "C1000000220-LPDAAC_ECS"
    assert "documentation_url" in metadata

def test_nasa_provider_get_data(nasa_provider):
    """Test NASA provider data retrieval with real API"""
    # Look back 60 days to ensure we have data
    params = QueryParams(
        start_date=datetime.now() - timedelta(days=60),
        end_date=datetime.now() - timedelta(days=30),
        # US bounding box for testing
        bbox=(-124.848974, 24.396308, -66.885444, 49.384358),
        limit=10
    )

    data = nasa_provider.get_data(params)
    assert data["status"] == "success"
    assert "results" in data
    assert isinstance(data["results"], list)
    assert data["total_results"] >= 0

    if data["results"]:
        first_result = data["results"][0]
        print("\nSample MODIS data entry:")
        print(f"Title: {first_result.get('title')}")
        print(f"Start Time: {first_result.get('time_start')}")
        print(f"End Time: {first_result.get('time_end')}")
        print(f"ID: {first_result.get('id')}")

def test_nasa_provider_data_structure(nasa_provider):
    """Test the structure of returned NASA data"""
    params = QueryParams(
        start_date=datetime.now() - timedelta(days=60),
        end_date=datetime.now() - timedelta(days=30),
        limit=1
    )

    data = nasa_provider.get_data(params)
    assert isinstance(data, dict)
    assert "status" in data
    assert "timestamp" in data
    assert "results" in data
    assert "query_params" in data
    assert "metadata" in data

    if data["results"]:
        result = data["results"][0]
        required_fields = ["id", "title"]
        for field in required_fields:
            assert field in result, f"Missing required field: {field}"
