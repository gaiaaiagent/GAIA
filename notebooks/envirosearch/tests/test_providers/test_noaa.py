# tests/test_providers/test_noaa.py
import pytest
import os
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from envirosearch.providers.noaa import NOAAProvider, NOAACredentials
from envirosearch.core.protocols import QueryParams

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

@pytest.fixture(scope="module")
def noaa_credentials():
    token = os.getenv("NOAA_API_KEY")
    if not token:
        pytest.skip("NOAA_API_KEY not found in environment variables")
    return NOAACredentials(api_key=token)

@pytest.fixture(scope="module")
def noaa_provider(noaa_credentials):
    return NOAAProvider(noaa_credentials)

def test_noaa_provider_metadata(noaa_provider):
    """Test NOAA provider metadata"""
    metadata = noaa_provider.get_metadata()
    assert metadata["name"] == "NOAA GHCND"
    assert metadata["dataset_id"] == "GHCND"
    assert "documentation_url" in metadata

def test_noaa_provider_get_data(noaa_provider):
    """Test NOAA provider data retrieval with real API"""
    # Look back 90 days for better data availability
    end_date = datetime.now() - timedelta(days=60)  # Ensure data is available
    start_date = end_date - timedelta(days=30)

    params = QueryParams(
        start_date=start_date,
        end_date=end_date,
        bbox=(-74.0, 40.7, -73.9, 40.8),  # Central Park area
        limit=10
    )

    data = noaa_provider.get_data(params)
    logger.info(f"Got response with status: {data['status']}")

    assert data["status"] == "success"
    assert "results" in data
    assert "stations" in data
    assert isinstance(data["results"], list)
    assert isinstance(data["stations"], list)

    if data["results"]:
        logger.info("\nSample NOAA data entries:")
        for i, result in enumerate(data["results"][:2]):
            logger.info(f"\nResult {i+1}:")
            logger.info(f"Station: {result['station']['name']}")
            logger.info(f"Location: {result['station']['latitude']}, {result['station']['longitude']}")
            logger.info(f"Date: {result.get('date')}")
            logger.info(f"Data Type: {result.get('datatype')}")
            logger.info(f"Value: {result.get('value')}")

def test_noaa_provider_data_structure(noaa_provider):
    """Test the structure of returned NOAA data"""
    # Use historical data for reliability
    end_date = datetime.now() - timedelta(days=60)
    start_date = end_date - timedelta(days=30)

    params = QueryParams(
        start_date=start_date,
        end_date=end_date,
        bbox=(-74.0, 40.7, -73.9, 40.8),  # Central Park area
        limit=1
    )

    data = noaa_provider.get_data(params)
    assert isinstance(data, dict)
    assert "status" in data
    assert "timestamp" in data
    assert "results" in data
    assert "query_params" in data
    assert "metadata" in data
    assert "stations" in data

    if data["stations"]:
        station = data["stations"][0]
        required_station_fields = ["id", "name", "latitude", "longitude"]
        for field in required_station_fields:
            assert field in station, f"Missing required station field: {field}"

def test_noaa_provider_invalid_dates(noaa_provider):
    """Test NOAA provider with invalid dates"""
    # End date before start date
    params = QueryParams(
        start_date=datetime.now(),
        end_date=datetime.now() - timedelta(days=1),
        limit=10
    )

    data = noaa_provider.get_data(params)
    assert data["status"] == "error"
    assert "error" in data
    assert "End date must be after start date" in data["error"]

def test_noaa_provider_future_dates(noaa_provider):
    """Test NOAA provider with future dates"""
    params = QueryParams(
        start_date=datetime.now() + timedelta(days=1),
        end_date=datetime.now() + timedelta(days=30),
        limit=10
    )

    data = noaa_provider.get_data(params)
    assert data["status"] == "success"
    assert len(data["results"]) == 0  # Should have no results for future dates
