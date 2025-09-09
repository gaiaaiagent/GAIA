#!/usr/bin/env python3
"""Test script to send a sensor event to the KOI coordinator"""

import requests
import json
from datetime import datetime

# Create a test event
event = {
    "node_id": "test-sensor",
    "node_type": "sensor",
    "event_type": "content_detected",
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "data": {
        "source": "test",
        "content": "Regenerative agriculture is a holistic farming approach that focuses on soil health, biodiversity, and carbon sequestration.",
        "metadata": {
            "url": "https://example.com/regen-ag",
            "title": "Understanding Regenerative Agriculture"
        }
    }
}

# Send to coordinator
try:
    response = requests.post(
        "http://localhost:8000/events/send",
        json=event,
        headers={"Content-Type": "application/json"}
    )
    print(f"Response status: {response.status_code}")
    print(f"Response body: {response.text}")
except Exception as e:
    print(f"Error sending event: {e}")

# Poll for events to verify it was received
try:
    poll_response = requests.get("http://localhost:8000/events/poll?node_id=test-processor")
    print(f"\nPolling response: {poll_response.json()}")
except Exception as e:
    print(f"Error polling: {e}")