import os
import requests
from typing import Dict, List
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables
load_dotenv()

class DataCatalog:
    def __init__(self):
        self.apis = {
            'nasa': {
                'name': 'NASA EOSDIS',
                'datasets': {
                    'modis_lst': {
                        'name': 'MODIS Land Surface Temperature',
                        'id': 'C1000000220-LPDAAC_ECS',
                        'description': 'Global land surface temperature data from MODIS instrument'
                    },
                    'gpm': {
                        'name': 'Global Precipitation Measurement',
                        'id': 'C1442037832-GES_DISC',
                        'description': 'Global precipitation data from GPM mission'
                    }
                }
            },
            'noaa': {
                'name': 'NOAA Climate Data',
                'datasets': {
                    'ghcnd': {
                        'name': 'Daily Summaries',
                        'id': 'GHCND',
                        'description': 'Global Historical Climatology Network Daily'
                    },
                    'gsod': {
                        'name': 'Global Summary of the Day',
                        'id': 'GSOD',
                        'description': 'Daily global weather observations'
                    }
                }
            }
        }

    def list_apis(self) -> List[str]:
        """Return list of available APIs"""
        return [(key, self.apis[key]['name']) for key in self.apis.keys()]

    def list_datasets(self, api_key: str) -> List[str]:
        """Return list of datasets for given API"""
        if api_key in self.apis:
            return [(k, v['name']) for k, v in self.apis[api_key]['datasets'].items()]
        return []

    def get_dataset_info(self, api_key: str, dataset_key: str) -> Dict:
        """Return detailed information about a specific dataset"""
        if api_key in self.apis and dataset_key in self.apis[api_key]['datasets']:
            return self.apis[api_key]['datasets'][dataset_key]
        return {}

class APIInterface:
    def __init__(self):
        self.nasa_token = os.getenv('NASA_TOKEN')
        self.noaa_key = os.getenv('NOAA_API_KEY')

    def get_nasa_collections(self, dataset_id: str) -> Dict:
        """Get NASA dataset collection information"""
        base_url = "https://cmr.earthdata.nasa.gov/search"
        headers = {
            'Authorization': f'Bearer {self.nasa_token}',
            'Accept': 'application/json'
        }

        # Using concept-id instead of collection_concept_id
        params = {
            'concept_id': dataset_id,
            'page_size': 1
        }

        try:
            response = requests.get(f"{base_url}/collections.umm_json",
                                 headers=headers,
                                 params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            if response.status_code == 400:
                # Add more specific error information
                error_body = response.json() if response.text else {}
                return {'error': f"API Error: {error_body.get('errors', ['Unknown error'])[0]}"}
            return {'error': str(e)}

    def get_noaa_dataset_info(self, dataset_id: str) -> Dict:
        """Get NOAA dataset information"""
        base_url = "https://www.ncdc.noaa.gov/cdo-web/api/v2"
        headers = {"token": self.noaa_key}

        try:
            response = requests.get(f"{base_url}/datasets/{dataset_id}",
                                headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'error': str(e)}

def print_menu(options: List, title: str):
    """Print a menu with numbered options"""
    print(f"\n{title}")
    print("-" * len(title))
    for idx, (key, name) in enumerate(options, 1):
        print(f"{idx}. {name}")
    print("0. Exit/Back")

def main():
    catalog = DataCatalog()
    api_interface = APIInterface()

    while True:
        # Show main menu of APIs
        apis = catalog.list_apis()
        print_menu(apis, "Available Environmental Data APIs")

        choice = input("\nSelect an API (0 to exit): ")
        if choice == '0':
            break

        try:
            api_key, api_name = apis[int(choice) - 1]
        except (ValueError, IndexError):
            print("Invalid selection")
            continue

        while True:
            # Show datasets for selected API
            datasets = catalog.list_datasets(api_key)
            print_menu(datasets, f"\nAvailable {api_name} Datasets")

            dataset_choice = input("\nSelect a dataset (0 to go back): ")
            if dataset_choice == '0':
                break

            try:
                dataset_key, dataset_name = datasets[int(dataset_choice) - 1]
            except (ValueError, IndexError):
                print("Invalid selection")
                continue

            # Show dataset information
            dataset_info = catalog.get_dataset_info(api_key, dataset_key)
            print("\nDataset Information:")
            print(f"Name: {dataset_info['name']}")
            print(f"ID: {dataset_info['id']}")
            print(f"Description: {dataset_info['description']}")

            # Get live dataset status
            print("\nChecking current dataset status...")
            if api_key == 'nasa':
                status = api_interface.get_nasa_collections(dataset_info['id'])
                if 'error' not in status:
                    if 'items' in status and status['items']:
                        print("Dataset is available")
                        print("\nDataset Details:")
                        item = status['items'][0]['umm']
                        print(f"Version: {item.get('Version', 'N/A')}")
                        print(f"Last Updated: {item.get('LastUpdate', 'N/A')}")
                        print(f"Description: {item.get('Abstract', 'N/A')[:200]}...")
                    else:
                        print("Dataset found but no items available")
                else:
                    print(f"Error checking dataset: {status['error']}")
            elif api_key == 'noaa':
                status = api_interface.get_noaa_dataset_info(dataset_info['id'])
                if 'error' not in status:
                    print("Dataset is available")
                    print("\nDataset Details:")
                    print(f"Name: {status.get('name', 'N/A')}")
                    print(f"ID: {status.get('id', 'N/A')}")
                    print(f"Data Coverage: {status.get('mindate', 'N/A')} to {status.get('maxdate', 'N/A')}")
                else:
                    print(f"Error checking dataset: {status['error']}")

            input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
