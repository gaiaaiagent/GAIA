# src/envirosearch/providers/sdg.py
from typing import Dict, Any, List
import requests
from dataclasses import dataclass
from datetime import datetime
import logging

from envirosearch.core import BaseProvider, Credentials, QueryParams, ProviderRegistry

logger = logging.getLogger(__name__)

@dataclass
class SDGCredentials(Credentials):
    """SDG doesn't require credentials, but we maintain the interface"""
    api_key: str = ""  # Not used but kept for interface consistency

class SDGProvider(BaseProvider):
    """UN Sustainable Development Goals (SDG) data provider"""
    BASE_URL = "https://unstats.un.org/SDGAPI/v1"

    def __init__(self, credentials: SDGCredentials = SDGCredentials()):
        self.session = requests.Session()
        super().__init__(credentials)

    def _validate_credentials(self) -> None:
        """SDG API doesn't require authentication"""
        pass

    def get_metadata(self) -> Dict[str, Any]:
        """Get SDG provider metadata"""
        return {
            "name": "UN SDG API",
            "description": "United Nations Sustainable Development Goals Indicators",
            "base_url": self.BASE_URL,
            "documentation_url": "https://unstats.un.org/SDGAPI/swagger/"
        }

    def _get_available_goals(self) -> List[Dict[str, Any]]:
        """Get list of available SDG goals"""
        try:
            response = self.session.get(f"{self.BASE_URL}/Goals")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting SDG goals: {str(e)}")
            return []

    def _get_goal_indicators(self, goal_code: int) -> List[Dict[str, Any]]:
        """Get indicators for a specific goal"""
        try:
            response = self.session.get(f"{self.BASE_URL}/Goals/{goal_code}/Indicators")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting indicators for goal {goal_code}: {str(e)}")
            return []

    def _get_indicator_data(self, indicator_code: str) -> Dict[str, Any]:
        """Get data for a specific indicator"""
        try:
            response = self.session.get(f"{self.BASE_URL}/Indicators/Data",
                                      params={"indicatorCode": indicator_code})
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error getting data for indicator {indicator_code}: {str(e)}")
            return {}

    def get_data(self, params: QueryParams) -> Dict[str, Any]:
        """Get SDG data focusing on environmental goals

        Main environmental SDGs:
            6: Clean Water and Sanitation
            7: Affordable and Clean Energy
            11: Sustainable Cities and Communities
            13: Climate Action
            14: Life Below Water
            15: Life on Land
        """
        try:
            environmental_goals = [6, 7, 11, 13, 14, 15]
            all_results = []

            # Get data for environmental goals
            for goal in environmental_goals:
                indicators = self._get_goal_indicators(goal)

                for indicator in indicators:
                    try:
                        indicator_code = indicator.get('code')
                        if not indicator_code:
                            continue

                        data = self._get_indicator_data(indicator_code)
                        if data:
                            # Add goal and indicator metadata to the data
                            enriched_data = {
                                'goal': {
                                    'code': goal,
                                    'title': indicator.get('goal'),
                                    'description': indicator.get('description')
                                },
                                'indicator': {
                                    'code': indicator_code,
                                    'description': indicator.get('description')
                                },
                                'data': data
                            }
                            all_results.append(enriched_data)
                    except Exception as e:
                        logger.warning(f"Error processing indicator {indicator_code}: {str(e)}")
                        continue

            return {
                'status': 'success',
                'timestamp': datetime.now().isoformat(),
                'query_params': params.__dict__,
                'results': all_results[:params.limit] if params.limit else all_results,
                'total_results': len(all_results),
                'metadata': self.get_metadata()
            }

        except Exception as e:
            logger.error(f"Error in get_data: {str(e)}")
            return {
                'status': 'error',
                'timestamp': datetime.now().isoformat(),
                'error': str(e),
                'query_params': params.__dict__
            }

# Register the provider
ProviderRegistry.register('sdg', SDGProvider)
