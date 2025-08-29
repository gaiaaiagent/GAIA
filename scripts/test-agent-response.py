#!/usr/bin/env python3

import time
import requests
import json
from datetime import datetime

# RegenAI Response Time Analyzer
# Tests actual message processing and identifies bottlenecks

print("=" * 50)
print("RegenAI Response Time Analyzer")
print("=" * 50)

def test_agent_chat(port=3000, message="Hello, can you explain what Regen Network does?"):
    """Test a real chat interaction and measure response times"""
    
    url = f"http://localhost:{port}/api/chat"
    
    # Prepare the request
    payload = {
        "message": message,
        "agentId": "test-performance",
        "sessionId": f"perf-test-{int(time.time())}"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"\n📤 Sending message to port {port}:")
    print(f"   Message: '{message}'")
    print(f"   Timestamp: {datetime.now().isoformat()}")
    
    # Measure different phases
    timings = {}
    
    # Start total timing
    total_start = time.perf_counter()
    
    try:
        # Make the request with streaming
        timings['request_start'] = time.perf_counter()
        
        with requests.post(url, json=payload, headers=headers, stream=True, timeout=30) as response:
            timings['first_byte'] = time.perf_counter()
            
            # Check if request was successful
            if response.status_code != 200:
                print(f"❌ Error: HTTP {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return None
            
            # Read the streaming response
            full_response = ""
            chunk_count = 0
            first_chunk_time = None
            
            for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
                if chunk:
                    if first_chunk_time is None:
                        first_chunk_time = time.perf_counter()
                        timings['first_chunk'] = first_chunk_time
                    
                    chunk_count += 1
                    if isinstance(chunk, bytes):
                        full_response += chunk.decode('utf-8')
                    else:
                        full_response += chunk
            
            timings['last_chunk'] = time.perf_counter()
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out after 30 seconds")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None
    
    total_end = time.perf_counter()
    
    # Calculate durations
    durations = {
        'connection': (timings.get('first_byte', 0) - timings.get('request_start', 0)) * 1000,
        'time_to_first_chunk': (timings.get('first_chunk', 0) - timings.get('request_start', 0)) * 1000,
        'streaming_duration': (timings.get('last_chunk', 0) - timings.get('first_chunk', 0)) * 1000 if 'first_chunk' in timings else 0,
        'total_time': (total_end - total_start) * 1000
    }
    
    print(f"\n✅ Response received!")
    print(f"   Response length: {len(full_response)} characters")
    print(f"   Chunks received: {chunk_count}")
    
    print(f"\n⏱️  Timing Breakdown:")
    print(f"   Connection established: {durations['connection']:.1f}ms")
    print(f"   Time to first chunk: {durations['time_to_first_chunk']:.1f}ms")
    print(f"   Streaming duration: {durations['streaming_duration']:.1f}ms")
    print(f"   Total time: {durations['total_time']:.1f}ms")
    
    # Show response preview
    if full_response:
        preview = full_response[:200] + "..." if len(full_response) > 200 else full_response
        print(f"\n📝 Response preview:")
        print(f"   {preview}")
    
    return durations

def test_health_check(port=3000):
    """Test basic health endpoint for baseline"""
    
    url = f"http://localhost:{port}/health"
    
    print(f"\n🔍 Testing health check on port {port}...")
    
    start = time.perf_counter()
    try:
        response = requests.get(url, timeout=5)
        end = time.perf_counter()
        duration = (end - start) * 1000
        
        if response.status_code == 200:
            print(f"   ✅ Health check: {duration:.1f}ms")
        else:
            print(f"   ⚠️  Health check returned {response.status_code}: {duration:.1f}ms")
        
        return duration
    except:
        print(f"   ❌ Health check failed")
        return None

def analyze_bottlenecks(timings):
    """Analyze where the delays are occurring"""
    
    print("\n🔍 Bottleneck Analysis:")
    
    if not timings:
        print("   No timing data available")
        return
    
    # Identify the slowest phase
    ttfc = timings.get('time_to_first_chunk', 0)
    streaming = timings.get('streaming_duration', 0)
    
    if ttfc > 5000:  # More than 5 seconds
        print(f"   ⚠️  SLOW INITIAL RESPONSE: {ttfc:.1f}ms")
        print("      Likely causes:")
        print("      - Slow model initialization")
        print("      - Large context loading from database")
        print("      - API rate limiting")
        print("      - Cold start (first request)")
    elif ttfc > 2000:  # More than 2 seconds
        print(f"   ⚠️  Moderate initial delay: {ttfc:.1f}ms")
        print("      Consider:")
        print("      - Reducing context size")
        print("      - Using faster model")
        print("      - Implementing response caching")
    else:
        print(f"   ✅ Good initial response time: {ttfc:.1f}ms")
    
    if streaming > 10000:  # More than 10 seconds streaming
        print(f"\n   ⚠️  Long streaming duration: {streaming:.1f}ms")
        print("      Possible issues:")
        print("      - Model generating very long response")
        print("      - Network latency")
        print("      - Rate limiting during generation")
    
    # Overall assessment
    total = timings.get('total_time', 0)
    if total < 2000:
        print(f"\n   🚀 Excellent performance! Total: {total:.1f}ms")
    elif total < 5000:
        print(f"\n   ✅ Good performance. Total: {total:.1f}ms")
    elif total < 10000:
        print(f"\n   ⚠️  Moderate performance. Total: {total:.1f}ms")
    else:
        print(f"\n   ❌ Poor performance. Total: {total:.1f}ms")

def main():
    # Test agents on different ports
    agents = [
        (3000, "RegenAI"),
        (3001, "Advocate"),
        (3002, "VoiceOfNature"),
        (3003, "Governor"),
        (3004, "Narrative")
    ]
    
    print("\n" + "=" * 50)
    print("Testing All Agents")
    print("=" * 50)
    
    for port, name in agents:
        print(f"\n{'='*50}")
        print(f"Testing {name} (port {port})")
        print(f"{'='*50}")
        
        # First do a health check
        health_time = test_health_check(port)
        
        if health_time is not None:
            # Then test actual chat
            timings = test_agent_chat(port, "What is regenerative agriculture?")
            
            if timings:
                analyze_bottlenecks(timings)
        else:
            print(f"   Skipping chat test - agent not responding")
    
    print("\n" + "=" * 50)
    print("RECOMMENDATIONS")
    print("=" * 50)
    
    print("""
Based on the analysis, here are the key optimizations:

1. MODEL SELECTION:
   Current: gpt-5-nano-2025-08-07
   
   For faster responses, try:
   - gpt-3.5-turbo (2-3x faster)
   - gpt-4o-mini (good balance)
   - Local models via Ollama (no network latency)

2. REDUCE INITIAL DELAY:
   - Limit conversation history (MAX_MESSAGES=10)
   - Reduce embedding searches (EMBEDDING_THRESHOLD=0.8)
   - Cache frequent queries

3. OPTIMIZE STREAMING:
   - Set max response length (MAX_TOKENS=500)
   - Enable chunked encoding
   - Use HTTP/2 if available

4. DATABASE OPTIMIZATION:
   - Add indexes on frequently queried columns
   - Implement connection pooling
   - Use prepared statements

To apply optimizations, update the startup script with:
   TEXT_MODEL=gpt-3.5-turbo
   MAX_CONTEXT_LENGTH=2000
   ENABLE_CACHE=true
   DB_POOL_SIZE=10
""")

if __name__ == "__main__":
    main()