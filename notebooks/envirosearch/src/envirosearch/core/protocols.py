# src/envirosearch/core/protocols.py
from typing import Protocol, Dict, Any, TypeVar
from abc import ABC, abstractmethod
from datetime import datetime
from dataclasses import dataclass

T = TypeVar('T')

@dataclass
class Credentials:
    """Base credentials class"""
    api_key: str

@dataclass
class QueryParams:
    """Base query parameters"""
    start_date: datetime
    end_date: datetime
    bbox: tuple[float, float, float, float] | None = None
    limit: int = 100

class DataProvider(Protocol):
    """Protocol defining interface for all data providers"""
    def get_metadata(self) -> Dict[str, Any]: ...
    def get_data(self, params: QueryParams) -> T: ...
    def validate_credentials(self) -> bool: ...

class BaseProvider(ABC):
    """Abstract base class for data providers"""
    def __init__(self, credentials: Credentials):
        self.credentials = credentials
        self._validate_credentials()

    @abstractmethod
    def _validate_credentials(self) -> None:
        """Validate the provided credentials"""
        pass

    @abstractmethod
    def get_metadata(self) -> Dict[str, Any]:
        """Get provider metadata"""
        pass

    @abstractmethod
    def get_data(self, params: QueryParams) -> Any:
        """Get data from the provider"""
        pass
