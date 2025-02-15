# src/envirosearch/providers/nasa.py
from typing import Dict, Any
import requests
from dataclasses import dataclass
from datetime import datetime

from envirosearch.core import BaseProvider, Credentials, QueryParams, ProviderRegistry
from envirosearch.utils.rate_limiter import rate_limit

@dataclass
class NASACredentials(Credentials):
    """NASA specific credentials"""
    api_key: str

class NASAProvider(BaseProvider):
    """NASA MODIS data provider"""
    BASE_URL = "https://cmr.earthdata.nasa.gov/search"
    COLLECTION_ID = "C1000000220-LPDAAC_ECS"  # MODIS LST collection

    def __init__(self, credentials: NASACredentials):
        # Set up session before calling parent's __init__
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {credentials.api_key}',
            'Accept': 'application/json'
        })
        # Now call parent's __init__ which will trigger _validate_credentials
        super().__init__(credentials)

    def _validate_credentials(self) -> None:
        """Validate NASA credentials"""
        try:
            response = self.session.get(
                f"{self.BASE_URL}/collections.json",
                params={'page_size': 1}
            )
            response.raise_for_status()
        except requests.RequestException as e:
            raise ValueError(f"Invalid NASA credentials: {str(e)}")

    def get_metadata(self) -> Dict[str, Any]:
        """Get NASA provider metadata"""
        return {
            "name": "NASA MODIS",
            "description": "MODIS Land Surface Temperature data",
            "collection_id": self.COLLECTION_ID,
            "base_url": self.BASE_URL,
            "documentation_url": "https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html"
        }

    def get_data(self, params: QueryParams) -> Dict[str, Any]:
        """Get MODIS data for the specified parameters"""
        query_params = {
            'collection_concept_id': self.COLLECTION_ID,
            'temporal': (
                f"{params.start_date.strftime('%Y-%m-%dT%H:%M:%SZ')},"
                f"{params.end_date.strftime('%Y-%m-%dT%H:%M:%SZ')}"
            ),
            'page_size': params.limit
        }

        if params.bbox:
            query_params['bounding_box'] = ','.join(map(str, params.bbox))

        try:
            response = self.session.get(
                f"{self.BASE_URL}/granules.json",
                params=query_params
            )
            response.raise_for_status()
            data = response.json()

            # Transform the response into a standardized format
            return {
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'query_params': query_params,
                'results': data.get('feed', {}).get('entry', []),
                'total_results': len(data.get('feed', {}).get('entry', [])),
                'metadata': self.get_metadata()
            }

        except requests.RequestException as e:
            return {
                'status': 'error',
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'query_params': query_params
            }

# Register the provider
ProviderRegistry.register('nasa', NASAProvider)
