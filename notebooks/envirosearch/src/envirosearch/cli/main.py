# src/envirosearch/cli/main.py
import click
from datetime import datetime, timedelta
import json
from pathlib import Path
import os
from typing import Optional
from dotenv import load_dotenv

from ..core.protocols import QueryParams
from ..core.provider import ProviderRegistry
from ..providers.nasa import NASACredentials, NASAProvider

# Load environment variables
load_dotenv()

def format_output(data: dict, format: str = 'json') -> str:
    """Format output data"""
    if format == 'json':
        return json.dumps(data, indent=2)
    # Add more format options as needed
    return str(data)

@click.group()
def cli():
    """Environmental Data Search CLI"""
    pass

@cli.command()
def list_providers():
    """List all available data providers"""
    providers = ProviderRegistry.list_providers()
    click.echo("Available Providers:")
    for name, provider in providers.items():
        click.echo(f"- {name}: {provider.__doc__}")

@cli.command()
@click.option('--provider', '-p', required=True, help='Provider name (e.g., nasa)')
def get_metadata(provider: str):
    """Get metadata for a specific provider"""
    try:
        provider_class = ProviderRegistry.get_provider(provider)
        credentials = _get_credentials(provider)
        provider_instance = provider_class(credentials)
        metadata = provider_instance.get_metadata()
        click.echo(format_output(metadata))
    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)

@cli.command()
@click.option('--provider', '-p', required=True, help='Provider name (e.g., nasa)')
@click.option('--start-date', '-s', type=click.DateTime(), default=str(datetime.now() - timedelta(days=30)),
              help='Start date (YYYY-MM-DD)')
@click.option('--end-date', '-e', type=click.DateTime(), default=str(datetime.now()),
              help='End date (YYYY-MM-DD)')
@click.option('--bbox', type=str, help='Bounding box (lon1,lat1,lon2,lat2)')
@click.option('--limit', type=int, default=100, help='Maximum number of results')
@click.option('--output-format', '-f', type=click.Choice(['json'], case_sensitive=False),
              default='json', help='Output format')
def search(provider: str, start_date: datetime, end_date: datetime,
           bbox: Optional[str], limit: int, output_format: str):
    """Search for environmental data"""
    try:
        # Parse bounding box if provided
        bbox_tuple = None
        if bbox:
            bbox_tuple = tuple(map(float, bbox.split(',')))
            if len(bbox_tuple) != 4:
                raise ValueError("Bounding box must be in format: lon1,lat1,lon2,lat2")

        # Create query parameters
        params = QueryParams(
            start_date=start_date,
            end_date=end_date,
            bbox=bbox_tuple,
            limit=limit
        )

        # Get provider and execute search
        provider_class = ProviderRegistry.get_provider(provider)
        credentials = _get_credentials(provider)
        provider_instance = provider_class(credentials)
        results = provider_instance.get_data(params)

        click.echo(format_output(results, output_format))

    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)

def _get_credentials(provider: str):
    """
