#!/usr/bin/env python3
"""Test sending a single event to KOI Coordinator"""

import requests
import json
from datetime import datetime

# Create a test event in the format KOI expects
event = {
    "rid": "sensor.test.manual001",
    "source_node": "test-sensor",
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "node_id": "test-sensor",
    "event_type": "content_detected", 
    "data": {
        "title": "Test Content from REGEN IRL",
        "content": "This is a test event sent manually to verify the KOI pipeline is working. The REGEN IRL grant competition offers $888 USDC to the winner.",
        "url": "https://regen.gaiaai.xyz/irl/",
        "metadata": {
            "source": "manual_test"
        }
    }
}

print("Sending test event to KOI Coordinator...")
print(f"Event: {json.dumps(event, indent=2)}")

try:
    response = requests.post(
        "http://localhost:8200/events/broadcast",
        json=event,
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code in [200, 201, 202]:
        print("✓ Event sent successfully!")
    else:
        print(f"✗ Failed to send event: {response.status_code}")
        
except Exception as e:
    print(f"✗ Error: {e}")