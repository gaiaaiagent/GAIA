# src/envirosearch/providers/noaa.py
from typing import Dict, Any, List
import requests
from dataclasses import dataclass
from datetime import datetime
import time
import logging

from envirosearch.core import BaseProvider, Credentials, QueryParams, ProviderRegistry

logger = logging.getLogger(__name__)

@dataclass
class NOAACredentials(Credentials):
    """NOAA specific credentials"""
    api_key: str

class NOAAProvider(BaseProvider):
    """NOAA GHCND (Global Historical Climatology Network Daily) provider"""
    BASE_URL = "https://www.ncdc.noaa.gov/cdo-web/api/v2"
    DATASET_ID = "GHCND"  # Global Historical Climatology Network Daily
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds

    def __init__(self, credentials: NOAACredentials):
        self.session = requests.Session()
        self.session.headers.update({
            'token': credentials.api_key,
            'Accept': 'application/json'
        })
        super().__init__(credentials)

    def _make_request(self, endpoint: str, params: dict) -> Dict[str, Any]:
        """Make request with retries"""
        url = f"{self.BASE_URL}/{endpoint}"
        logger.debug(f"Making request to {url} with params {params}")

        for attempt in range(self.MAX_RETRIES):
            try:
                response = self.session.get(url, params=params)
                response.raise_for_status()
                return response.json()
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 503 and attempt < self.MAX_RETRIES - 1:
                    time.sleep(self.RETRY_DELAY * (attempt + 1))
                    continue
                logger.error(f"HTTP error {e.response.status_code} for {url}: {str(e)}")
                raise
            except Exception as e:
                logger.error(f"Error making request to {url}: {str(e)}")
                raise

    def _validate_credentials(self) -> None:
        """Validate NOAA credentials"""
        try:
            # Just check if we can access the API
            self._make_request("datasets", {'limit': 1})
        except requests.RequestException as e:
            raise ValueError(f"Invalid NOAA credentials: {str(e)}")

    def get_metadata(self) -> Dict[str, Any]:
        """Get NOAA provider metadata"""
        return {
            "name": "NOAA GHCND",
            "description": "Global Historical Climatology Network Daily",
            "dataset_id": self.DATASET_ID,
            "base_url": self.BASE_URL,
            "documentation_url": "https://www.ncdc.noaa.gov/cdo-web/webservices/v2"
        }

    def _get_stations(self, params: dict) -> List[Dict[str, Any]]:
        """Get available stations based on parameters"""
        station_params = {
            'datasetid': self.DATASET_ID,
            'datacategoryid': 'TEMP',
            'limit': 1000  # Get more stations to ensure coverage
        }

        if 'extent' in params:
            station_params['extent'] = params['extent']

        try:
            response = self._make_request("stations", station_params)
            stations = response.get('results', [])
            logger.info(f"Found {len(stations)} stations matching criteria")
            return stations
        except Exception as e:
            logger.error(f"Error getting stations: {str(e)}")
            return []

    def get_data(self, params: QueryParams) -> Dict[str, Any]:
        """Get NOAA GHCND data for the specified parameters"""
        # Validate dates
        if params.end_date <= params.start_date:
            return {
                'status': 'error',
                'timestamp': datetime.now().isoformat(),
                'error': 'End date must be after start date',
                'query_params': params.__dict__
            }

        try:
            # Prepare query parameters
            query_params = {
                'datasetid': self.DATASET_ID,
                'startdate': params.start_date.strftime('%Y-%m-%d'),
                'enddate': params.end_date.strftime('%Y-%m-%d'),
                'limit': params.limit,
                'datacategoryid': 'TEMP'
            }

            if params.bbox:
                # NOAA expects: north,west,south,east
                west, south, east, north = params.bbox
                query_params['extent'] = f"{north},{west},{south},{east}"

            # Get stations first
            stations = self._get_stations(query_params)
            if not stations:
                return {
                    'status': 'success',
                    'timestamp': datetime.now().isoformat(),
                    'query_params': query_params,
                    'stations': [],
                    'results': [],
                    'total_results': 0,
                    'metadata': self.get_metadata()
                }

            # Get data for up to 3 stations
            all_results = []
            used_stations = []

            for station in stations[:3]:
                try:
                    data_params = query_params.copy()
                    data_params['stationid'] = station['id']

                    data = self._make_request("data", data_params)

                    if data.get('results'):
                        # Enrich results with station info
                        for result in data['results']:
                            result['station'] = {
                                'id': station['id'],
                                'name': station['name'],
                                'latitude': station['latitude'],
                                'longitude': station['longitude'],
                                'elevation': station.get('elevation'),
                                'elevationUnit': station.get('elevationUnit')
                            }
                        all_results.extend(data['results'])
                        used_stations.append(station)
                except Exception as e:
                    logger.warning(f"Error getting data for station {station['id']}: {str(e)}")
                    continue

            return {
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'query_params': query_params,
                'stations': used_stations,
                'results': all_results[:params.limit],
                'total_results': len(all_results),
                'metadata': self.get_metadata()
            }

        except Exception as e:
            logger.error(f"Error in get_data: {str(e)}")
            return {
                'status': 'error',
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'query_params': query_params if 'query_params' in locals() else params.__dict__
            }

# Register the provider
ProviderRegistry.register('noaa', NOAAProvider)
