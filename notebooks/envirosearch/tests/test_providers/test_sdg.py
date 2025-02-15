# tests/test_providers/test_sdg.py
import pytest
import logging
from datetime import datetime, timedelta
from envirosearch.providers.sdg import SDGProvider, SDGCredentials
from envirosearch.core.protocols import QueryParams

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@pytest.fixture(scope="module")
def sdg_provider():
    return SDGProvider()

def test_sdg_provider_metadata(sdg_provider):
    """Test SDG provider metadata"""
    metadata = sdg_provider.get_metadata()
    assert metadata["name"] == "UN SDG API"
    assert "description" in metadata
    assert "documentation_url" in metadata

def test_sdg_provider_get_data(sdg_provider):
    """Test SDG provider data retrieval"""
    params = QueryParams(
        start_date=datetime.now() - timedelta(days=365),  # Look back one year
        end_date=datetime.now(),
        limit=10
    )

    data = sdg_provider.get_data(params)
    logger.info(f"Got response with status: {data['status']}")

    assert data["status"] == "success"
    assert "results" in data
    assert isinstance(data["results"], list)

    if data["results"]:
        logger.info("\nSample SDG data entries:")
        for i, result in enumerate(data["results"][:2]):
            logger.info(f"\nResult {i+1}:")
            logger.info(f"Goal: {result['goal']['code']} - {result['goal']['title']}")
            logger.info(f"Indicator: {result['indicator']['code']}")
            logger.info(f"Description: {result['indicator']['description']}")

def test_sdg_provider_data_structure(sdg_provider):
    """Test the structure of returned SDG data"""
    params = QueryParams(
        start_date=datetime.now() - timedelta(days=365),
        end_date=datetime.now(),
        limit=1
    )

    data = sdg_provider.get_data(params)
    assert isinstance(data, dict)
    assert "status" in data
    assert "timestamp" in data
    assert "results" in data
    assert "query_params" in data
    assert "metadata" in data

    if data["results"]:
        result = data["results"][0]
        # Check structure
        assert "goal" in result
        assert "indicator" in result
        assert "data" in result
        # Check goal fields
        assert "code" in result["goal"]
        assert "title" in result["goal"]
        assert "description" in result["goal"]
        # Check indicator fields
        assert "code" in result["indicator"]
        assert "description" in result["indicator"]

def test_sdg_environmental_goals(sdg_provider):
    """Test that we're getting environmental SDG goals"""
    environmental_goals = {6, 7, 11, 13, 14, 15}

    params = QueryParams(
        start_date=datetime.now() - timedelta(days=365),
        end_date=datetime.now(),
        limit=100  # Get more results to ensure we have data
    )

    data = sdg_provider.get_data(params)
    assert data["status"] == "success"

    if data["results"]:
        # Check that all results are from environmental goals
        goal_codes = {result["goal"]["code"] for result in data["results"]}
        assert goal_codes.issubset(environmental_goals)

        # Log the distribution of goals
        goal_distribution = {}
        for result in data["results"]:
            goal_code = result["goal"]["code"]
            goal_distribution[goal_code] = goal_distribution.get(goal_code, 0) + 1

        logger.info("\nGoal distribution in results:")
        for goal_code, count in sorted(goal_distribution.items()):
            logger.info(f"Goal {goal_code}: {count} indicators")
