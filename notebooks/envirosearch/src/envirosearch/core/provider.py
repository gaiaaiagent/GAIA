# src/envirosearch/core/provider.py
from typing import Dict, Type, Any
from .protocols import BaseProvider

class ProviderRegistry:
    """Registry for data providers"""
    _providers: Dict[str, Type[BaseProvider]] = {}

    @classmethod
    def register(cls, name: str, provider: Type[BaseProvider]) -> None:
        """Register a new provider"""
        cls._providers[name] = provider

    @classmethod
    def get_provider(cls, name: str) -> Type[BaseProvider]:
        """Get a provider by name"""
        if name not in cls._providers:
            raise KeyError(f"Provider {name} not found")
        return cls._providers[name]

    @classmethod
    def list_providers(cls) -> Dict[str, Type[BaseProvider]]:
        """List all registered providers"""
        return cls._providers.copy()
