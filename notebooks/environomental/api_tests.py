import pytest
import os
from dotenv import load_dotenv
import requests
from datetime import datetime, timedelta
import logging
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure requests with timeouts and retries
class TimeoutHTTPAdapter(HTTPAdapter):
    def __init__(self, timeout=3, *args, **kwargs):
        self.timeout = timeout
        super().__init__(*args, **kwargs)

    def send(self, request, **kwargs):
        timeout = kwargs.get('timeout', self.timeout)
        kwargs['timeout'] = timeout
        return super().send(request, **kwargs)

def create_session():
    session = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=1.0,
        status_forcelist=[408, 429, 500, 502, 503, 504],
        respect_retry_after_header=True
    )
    adapter = TimeoutHTTPAdapter(timeout=3, max_retries=retries)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

# Test fixtures
@pytest.fixture(scope='module')
def api_keys():
    nasa_token = os.getenv('NASA_TOKEN')
    noaa_key = os.getenv('NOAA_API_KEY')

    if not nasa_token or not noaa_key:
        pytest.skip("Missing required API keys in .env file")

    return {
        'nasa_token': nasa_token,
        'noaa_key': noaa_key
    }

@pytest.fixture(scope='module')
def session():
    return create_session()

# NASA API Tests
def test_nasa_auth(api_keys, session):
    """Test NASA API authentication with timeout"""
    logger.info("Testing NASA API authentication...")

    headers = {
        'Authorization': f'Bearer {api_keys["nasa_token"]}',
        'Accept': 'application/json'
    }

    try:
        response = session.get(
            "https://cmr.earthdata.nasa.gov/search/collections.umm_json",
            headers=headers,
            params={'page_size': 1}
        )
        response.raise_for_status()
        assert response.status_code == 200, f"NASA API auth failed: {response.text}"
        logger.info("NASA API authentication successful")
    except requests.exceptions.RequestException as e:
        logger.error(f"NASA API request failed: {str(e)}")
        pytest.fail(f"NASA API request failed: {str(e)}")

@pytest.mark.parametrize("collection_id,name", [
    ('C1000000220-LPDAAC_ECS', 'MODIS'),
    ('C1442037832-GES_DISC', 'GPM')
])
def test_nasa_collections(api_keys, session, collection_id, name):
    """Test NASA collection access"""
    logger.info(f"Testing NASA {name} collection access...")

    headers = {
        'Authorization': f'Bearer {api_keys["nasa_token"]}',
        'Accept': 'application/json'
    }

    try:
        response = session.get(
            "https://cmr.earthdata.nasa.gov/search/collections.umm_json",
            headers=headers,
            params={
                'concept_id': collection_id,
                'page_size': 1
            }
        )
        response.raise_for_status()
        assert response.status_code == 200, f"{name} collection access failed: {response.text}"
        data = response.json()
        assert 'items' in data, f"No items in {name} response"
        logger.info(f"NASA {name} collection access successful")
    except requests.exceptions.RequestException as e:
        logger.error(f"NASA {name} collection request failed: {str(e)}")
        pytest.fail(f"NASA {name} collection request failed: {str(e)}")

# NOAA API Tests
def test_noaa_auth(api_keys, session):
    """Test NOAA API authentication with timeout"""
    logger.info("Testing NOAA API authentication...")

    headers = {
        "token": api_keys["noaa_key"],
        "Accept": "application/json"
    }

    try:
        response = session.get(
            "https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets",
            headers=headers,
            params={'limit': 1}
        )

        # NOAA sometimes returns 503 during high load but the API is still functional
        if response.status_code == 503:
            logger.warning("NOAA API experiencing high load, but may still be functional")
            pytest.xfail("NOAA API temporarily unavailable (503)")

        response.raise_for_status()
        assert response.status_code == 200, f"NOAA API auth failed: {response.text}"
        logger.info("NOAA API authentication successful")
    except requests.exceptions.RequestException as e:
        logger.error(f"NOAA API request failed: {str(e)}")
        pytest.fail(f"NOAA API request failed: {str(e)}")

@pytest.mark.parametrize("dataset_id,name", [
    ('GHCND', 'Global Historical Climatology Network Daily'),
    ('GSOD', 'Global Summary of the Day')
])
def test_noaa_datasets(api_keys, session, dataset_id, name):
    """Test NOAA dataset access"""
    logger.info(f"Testing NOAA {dataset_id} dataset access...")

    headers = {
        "token": api_keys["noaa_key"],
        "Accept": "application/json"
    }

    try:
        response = session.get(
            f"https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets/{dataset_id}",
            headers=headers
        )

        if response.status_code == 503:
            logger.warning(f"NOAA {dataset_id} dataset temporarily unavailable")
            pytest.xfail(f"NOAA {dataset_id} dataset temporarily unavailable (503)")

        response.raise_for_status()
        assert response.status_code == 200, f"NOAA {dataset_id} dataset access failed: {response.text}"

        data = response.json()
        if 'id' not in data:
            logger.warning(f"NOAA {dataset_id} dataset returned unexpected structure")
            pytest.xfail(f"NOAA {dataset_id} dataset returned unexpected structure")

        assert data['id'] == dataset_id, f"Incorrect dataset ID for {name}"
        logger.info(f"NOAA {dataset_id} dataset access successful")
    except requests.exceptions.RequestException as e:
        logger.error(f"NOAA {dataset_id} dataset request failed: {str(e)}")
        pytest.fail(f"NOAA {dataset_id} dataset request failed: {str(e)}")

def test_noaa_minimal_data(api_keys, session):
    """Test minimal data retrieval from NOAA"""
    logger.info("Testing minimal NOAA data retrieval...")

    headers = {
        "token": api_keys["noaa_key"],
        "Accept": "application/json"
    }
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

    try:
        response = session.get(
            "https://www.ncdc.noaa.gov/cdo-web/api/v2/data",
            headers=headers,
            params={
                'datasetid': 'GHCND',
                'stationid': 'GHCND:USW00094728',  # Central Park, NY
                'startdate': yesterday,
                'enddate': yesterday,
                'limit': 1
            }
        )

        if response.status_code == 503:
            logger.warning("NOAA data retrieval temporarily unavailable")
            pytest.xfail("NOAA data retrieval temporarily unavailable (503)")

        response.raise_for_status()
        assert response.status_code == 200, f"NOAA data retrieval failed: {response.text}"
        logger.info("NOAA minimal data retrieval successful")
    except requests.exceptions.RequestException as e:
        logger.error(f"NOAA data retrieval failed: {str(e)}")
        pytest.fail(f"NOAA data retrieval failed: {str(e)}")

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--log-cli-level=INFO'])
