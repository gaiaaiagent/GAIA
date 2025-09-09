#!/usr/bin/env python3
"""
KOI Website Sensor - Monitors a website and sends content to KOI pipeline
"""

import requests
import json
import time
import hashlib
import sys
from datetime import datetime
from bs4 import BeautifulSoup
import re

class WebsiteSensor:
    def __init__(self, coordinator_url="http://localhost:8000", node_id="website-sensor-001"):
        self.coordinator_url = coordinator_url
        self.node_id = node_id
        self.processed_content = set()
        
    def scrape_website(self, url):
        """Scrape content from the website"""
        try:
            print(f"[Sensor] Fetching content from {url}", flush=True)
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract text content
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            # Clean up text
            text = re.sub(r'\s+', ' ', text)
            
            # Extract title
            title = soup.find('title')
            title_text = title.string if title else "Untitled"
            
            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc.get('content', '') if meta_desc else ''
            
            # Extract main content sections
            content_sections = []
            
            # Look for main content areas
            for tag in ['article', 'main', 'section', 'div']:
                elements = soup.find_all(tag)
                for element in elements[:5]:  # Limit to first 5 of each type
                    content = element.get_text(strip=True)
                    if len(content) > 100:  # Only include substantial content
                        content_sections.append(content[:500])  # Limit length
            
            return {
                'url': url,
                'title': title_text,
                'description': description,
                'content': text[:2000],  # Limit total content
                'sections': content_sections[:3],  # Top 3 sections
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            
        except Exception as e:
            print(f"[Sensor] Error scraping {url}: {e}", flush=True)
            return None
    
    def create_event(self, content_data):
        """Create a KOI event from scraped content"""
        # Create unique ID for this content
        content_hash = hashlib.sha256(
            json.dumps(content_data, sort_keys=True).encode()
        ).hexdigest()[:12]
        
        # Create RID for this event (Resource ID for KOI)
        rid = f"sensor.website.{content_hash}"
        
        event = {
            "rid": rid,  # Required by coordinator
            "source_node": self.node_id,  # Required by coordinator
            "timestamp": datetime.utcnow().isoformat() + "Z",  # Required by coordinator
            "node_id": self.node_id,
            "node_type": "sensor",
            "event_type": "content_detected",
            "event_id": f"evt_{content_hash}_{int(time.time())}",
            "data": {
                "source": "website",
                "url": content_data['url'],
                "title": content_data['title'],
                "content": content_data['content'],
                "metadata": {
                    "description": content_data['description'],
                    "sections_count": len(content_data['sections']),
                    "content_length": len(content_data['content']),
                    "scraped_at": content_data['timestamp']
                }
            }
        }
        
        return event
    
    def send_event(self, event):
        """Send event to KOI Coordinator"""
        try:
            # Use the correct coordinator broadcast endpoint
            response = requests.post(
                f"{self.coordinator_url}/events/broadcast",
                json=event,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code in [200, 201, 202]:
                print(f"[Sensor] ✓ Event sent successfully: {event['event_id']}", flush=True)
                return True
            else:
                print(f"[Sensor] Failed to send event: {response.status_code} - {response.text[:200]}", flush=True)
                return False
                
        except requests.exceptions.ConnectionError:
            print(f"[Sensor] Cannot connect to coordinator at {self.coordinator_url}", flush=True)
            return False
        except Exception as e:
            print(f"[Sensor] Error sending event: {e}", flush=True)
            return False
    
    def monitor_website(self, url, interval=30):
        """Monitor website and send events periodically"""
        print(f"[Sensor] Starting website monitor for {url}", flush=True)
        print(f"[Sensor] Sending events to coordinator at {self.coordinator_url}", flush=True)
        print(f"[Sensor] Check interval: {interval} seconds", flush=True)
        sys.stdout.flush()
        
        while True:
            try:
                # Scrape website
                content = self.scrape_website(url)
                
                if content:
                    # Create content hash to detect changes
                    content_hash = hashlib.sha256(
                        content['content'].encode()
                    ).hexdigest()
                    
                    # Only send if content is new or changed
                    if content_hash not in self.processed_content:
                        event = self.create_event(content)
                        if self.send_event(event):
                            self.processed_content.add(content_hash)
                            print(f"[Sensor] Content processed: {content['title'][:50]}...", flush=True)
                        else:
                            print("[Sensor] Failed to send event, will retry next cycle", flush=True)
                    else:
                        print("[Sensor] No new content detected", flush=True)
                
                # Wait before next check
                print(f"[Sensor] Waiting {interval} seconds before next check...", flush=True)
                sys.stdout.flush()
                time.sleep(interval)
                
            except KeyboardInterrupt:
                print("\n[Sensor] Stopping website monitor", flush=True)
                break
            except Exception as e:
                print(f"[Sensor] Error in monitor loop: {e}", flush=True)
                time.sleep(interval)

if __name__ == "__main__":
    # Configuration
    COORDINATOR_URL = "http://127.0.0.1:8200"  # KOI Coordinator on port 8200
    WEBSITE_URL = "https://regen.gaiaai.xyz/irl/"
    CHECK_INTERVAL = 30  # seconds
    
    # Create and start sensor
    sensor = WebsiteSensor(
        coordinator_url=COORDINATOR_URL,
        node_id="website-sensor-irl"
    )
    
    print("=" * 60, flush=True)
    print("KOI Website Sensor - Real Event Generator", flush=True)
    print("=" * 60, flush=True)
    print(f"Target: {WEBSITE_URL}", flush=True)
    print(f"Coordinator: {COORDINATOR_URL}", flush=True)
    print("=" * 60, flush=True)
    sys.stdout.flush()
    
    # Start monitoring
    sensor.monitor_website(WEBSITE_URL, interval=CHECK_INTERVAL)