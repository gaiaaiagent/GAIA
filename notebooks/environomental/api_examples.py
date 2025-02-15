import requests
import json
from datetime import datetime, timedelta
import os
from typing import Dict, List, Any

# NASA EOSDIS (EARTHDATA) API
def nasa_earthdata_example(token: str) -> Dict:
    """
    Access NASA's EARTHDATA API using token authentication
    Requires Earth Data Token: https://urs.earthdata.nasa.gov/user_tokens
    """
    # CMR API endpoint
    base_url = "https://cmr.earthdata.nasa.gov/search"

    # Set up headers with token
    headers = {
        'Authorization': f'Bearer {token}'
    }

    # Search for MODIS land surface temperature data
    params = {
        'collection_concept_id': 'C1000000220-LPDAAC_ECS',  # MODIS LST collection
        'temporal': '2024-01-01T00:00:00Z,2024-01-31T23:59:59Z',
        'page_size': 10,
        'format': 'json'
    }

    response = requests.get(f"{base_url}/collections.json", headers=headers, params=params)
    return response.json()

# NOAA Climate Data API
def noaa_climate_data_example(api_key: str) -> Dict:
    """
    Access NOAA's Climate Data API
    Requires API key from: https://www.ncdc.noaa.gov/cdo-web/webservices/v2
    """
    base_url = "https://www.ncdc.noaa.gov/cdo-web/api/v2"
    headers = {"token": api_key}

    # Get temperature data for a specific station
    params = {
        'datasetid': 'GHCND',  # Daily summaries
        'stationid': 'GHCND:USW00094728',  # Central Park, NY
        'startdate': '2024-01-01',
        'enddate': '2024-01-31',
        'limit': 1000
    }

    response = requests.get(f"{base_url}/data", headers=headers, params=params)
    return response.json()

# Global Forest Watch API
def global_forest_watch_example(api_key: str) -> Dict:
    """
    Access Global Forest Watch API
    Requires API key from: https://www.globalforestwatch.org/help/api/
    """
    base_url = "https://data-api.globalforestwatch.org/dataset/gfw_forest_loss/latest/query"

    # Query forest loss data for a specific area
    params = {
        'geostore_id': '123e4567-e89b-12d3-a456-426614174000',  # Example geostore ID
        'period': '2001-01-01,2023-12-31',
        'format': 'json'
    }

    headers = {'Authorization': f'Bearer {api_key}'}
    response = requests.get(base_url, headers=headers, params=params)
    return response.json()

# GBIF (Global Biodiversity Information Facility) API
def gbif_example() -> Dict:
    """
    Access GBIF API
    No API key required for basic access
    """
    base_url = "https://api.gbif.org/v1"

    # Search for species occurrences
    params = {
        'scientificName': 'Panthera tigris',  # Tiger
        'country': 'IN',  # India
        'limit': 100
    }

    response = requests.get(f"{base_url}/occurrence/search", params=params)
    return response.json()

# iNaturalist API
def inaturalist_example(api_key: str) -> Dict:
    """
    Access iNaturalist API
    Requires API key from: https://api.inaturalist.org/v1/docs/
    """
    base_url = "https://api.inaturalist.org/v1"
    headers = {'Authorization': api_key}

    # Search for observations
    params = {
        'taxon_name': 'Monarch Butterfly',
        'quality_grade': 'research',
        'per_page': 100
    }

    response = requests.get(f"{base_url}/observations", headers=headers, params=params)
    return response.json()

# UN SDGs API (Using UN Statistics Division API)
def un_sdg_example() -> Dict:
    """
    Access UN SDG Indicators API
    No API key required
    """
    base_url = "https://unstats.un.org/SDGAPI/v1"

    # Get data for a specific SDG goal
    goal_number = 13  # Climate Action

    response = requests.get(f"{base_url}/Goals/{goal_number}/Indicators")
    return response.json()

# Example usage with error handling
def main():
    try:
        # Replace with your actual API keys
        nasa_token = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6InlnZ19hbmRlcnNvbiIsImV4cCI6MTc0NDgzNjQzOCwiaWF0IjoxNzM5NjUyNDM4LCJpc3MiOiJodHRwczovL3Vycy5lYXJ0aGRhdGEubmFzYS5nb3YiLCJpZGVudGl0eV9wcm92aWRlciI6ImVkbF9vcHMiLCJhY3IiOiJlZGwiLCJhc3N1cmFuY2VfbGV2ZWwiOjN9.eLdlPBd3eBNOBGKV9pp9vV1N1Y_neF4InngiPp8btTUR_BC-HI-SExXDe6Ep7xNYDAi0i22NKxC7THEMoDs3zWBnEwoxNSXD88HtSQPQy1RdVh68kdzDkRbYOf1kPC0RwFD5weljmXHT5QA3uUHIgGD84gRAXBC55aXjvGccWq_Wphe0ZUiFGzl6wOluZyx9ln6OqCBIz7H2Sn6DgQ38xQVoOMM1FYGf5jHdqsvYy1UR9zWKpveQi-WaSZ6S7yBC8kBlqP5_AcUkV94C9hUBHP0AJ-h5RcCkVyXudOZ_NcU5hL7C_Y3zyBtc7SvACgKLxxU6LDELQHy57SiEF9r0lQ"
        noaa_api_key = "bjHMxHpaBLJAyaNoBzDefsWTwneJnNyv"
        # gfw_api_key = "your_gfw_api_key"
        inaturalist_api_key = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjo4OTUzOTY2LCJleHAiOjE3Mzk3Mzk4ODl9.kDDbZL17nxniXldNEm8PGN7-_oskxj_RKl1F3fxKiNKVa0oBFhjSRkTW-_6Xk-pEzV1Y2RBJ9XG3prUhrNGapg"

        # NASA EOSDIS example
        nasa_data = nasa_earthdata_example(nasa_token)
        print("NASA Data:", json.dumps(nasa_data, indent=2))

        # NOAA example
        noaa_data = noaa_climate_data_example(noaa_api_key)
        print("NOAA Data:", json.dumps(noaa_data, indent=2))

        # Global Forest Watch example
        # gfw_data = global_forest_watch_example(gfw_api_key)
        # print("GFW Data:", json.dumps(gfw_data, indent=2))

        # GBIF example
        gbif_data = gbif_example()
        print("GBIF Data:", json.dumps(gbif_data, indent=2))

        # iNaturalist example
        inaturalist_data = inaturalist_example(inaturalist_api_key)
        print("iNaturalist Data:", json.dumps(inaturalist_data, indent=2))

        # UN SDG example
        sdg_data = un_sdg_example()
        print("UN SDG Data:", json.dumps(sdg_data, indent=2))

    except requests.exceptions.RequestException as e:
        print(f"Error making API request: {e}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
