#!/bin/bash

# RAG System Test Script
# Tests if the knowledge retrieval system is working correctly

set -e

echo "🧪 RAG System Functionality Test"
echo "=================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
CONTAINER_NAME="regenai"
TEST_QUESTION="what are jaguar credits?"
EXPECTED_TERMS=("Ecuador" "10,000 hectares" "Altos Planos" "16,000")

# Check if container is running
echo "1️⃣  Checking container status..."
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}✓${NC} Container $CONTAINER_NAME is running"
else
    echo -e "${RED}✗${NC} Container $CONTAINER_NAME is not running"
    echo "   Start it with: docker compose up -d"
    exit 1
fi
echo

# Check if documents are present
echo "2️⃣  Checking indexed documents..."
DOC_COUNT=$(docker exec $CONTAINER_NAME ls /app/knowledge/regen-network/governance/articles/ 2>/dev/null | wc -l || echo "0")
if [ "$DOC_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $DOC_COUNT documents"
    
    # Check for jaguar document specifically
    if docker exec $CONTAINER_NAME ls /app/knowledge/regen-network/governance/articles/ 2>/dev/null | grep -q "jaguar"; then
        echo -e "${GREEN}✓${NC} Jaguar credits document exists"
    else
        echo -e "${YELLOW}⚠${NC} Jaguar credits document not found"
    fi
else
    echo -e "${RED}✗${NC} No documents found in knowledge directory"
    exit 1
fi
echo

# Check if knowledge service is running
echo "3️⃣  Checking knowledge service..."
if docker logs $CONTAINER_NAME 2>&1 | grep -q "Starting Knowledge service"; then
    echo -e "${GREEN}✓${NC} Knowledge service started"
else
    echo -e "${YELLOW}⚠${NC} Knowledge service may not be running"
fi
echo

# Check if knowledge plugin loaded
echo "4️⃣  Checking knowledge plugin..."
if docker logs $CONTAINER_NAME 2>&1 | grep -q "\[KNOWLEDGE\]"; then
    echo -e "${GREEN}✓${NC} Knowledge plugin loaded"
    
    # Check for dynamic:true
    if docker logs $CONTAINER_NAME 2>&1 | grep -q "Provider dynamic: true"; then
        echo -e "${GREEN}✓${NC} Provider has dynamic: true"
    else
        echo -e "${YELLOW}⚠${NC} Provider may not have dynamic: true"
    fi
else
    echo -e "${RED}✗${NC} Knowledge plugin not loaded"
fi
echo

# Test provider selection
echo "5️⃣  Testing provider selection..."
echo "   Checking recent logs for provider selection..."

# Look for provider selection in recent responses
RECENT_PROVIDERS=$(docker logs $CONTAINER_NAME --tail 500 2>&1 | grep "<providers>" | tail -5)
if echo "$RECENT_PROVIDERS" | grep -q "KNOWLEDGE"; then
    echo -e "${GREEN}✓${NC} KNOWLEDGE provider is being selected"
    echo "   Recent selections:"
    echo "$RECENT_PROVIDERS" | sed 's/^/   /'
else
    if [ -n "$RECENT_PROVIDERS" ]; then
        echo -e "${RED}✗${NC} KNOWLEDGE provider NOT being selected"
        echo "   Recent selections (should include KNOWLEDGE):"
        echo "$RECENT_PROVIDERS" | sed 's/^/   /'
    else
        echo -e "${YELLOW}⚠${NC} No recent provider selections found"
        echo "   Try asking a question to test"
    fi
fi
echo

# Check if provider is being called
echo "6️⃣  Checking provider execution..."
if docker logs $CONTAINER_NAME --tail 500 2>&1 | grep -q "KNOWLEDGE Provider took"; then
    echo -e "${GREEN}✓${NC} KNOWLEDGE provider is being called"
    
    # Show recent execution times
    echo "   Recent execution times:"
    docker logs $CONTAINER_NAME --tail 500 2>&1 | grep "KNOWLEDGE Provider took" | tail -3 | sed 's/^/   /'
else
    echo -e "${RED}✗${NC} KNOWLEDGE provider not being called"
    echo "   This means it's not selected or not registered properly"
fi
echo

# Check for RAG logs
echo "7️⃣  Checking RAG activity..."
RAG_LOGS=$(docker logs $CONTAINER_NAME --tail 500 2>&1 | grep "\[RAG\]" | tail -5)
if [ -n "$RAG_LOGS" ]; then
    echo -e "${GREEN}✓${NC} RAG system is active"
    echo "   Recent RAG activity:"
    echo "$RAG_LOGS" | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠${NC} No RAG activity detected"
    echo "   RAG logs may not be implemented or provider not retrieving documents"
fi
echo

# Summary
echo "📊 Test Summary"
echo "==============="

TESTS_PASSED=0
TESTS_TOTAL=7

# Count passed tests
docker ps | grep -q "$CONTAINER_NAME" && ((TESTS_PASSED++))
[ "$DOC_COUNT" -gt 0 ] && ((TESTS_PASSED++))
docker logs $CONTAINER_NAME 2>&1 | grep -q "Starting Knowledge service" && ((TESTS_PASSED++))
docker logs $CONTAINER_NAME 2>&1 | grep -q "\[KNOWLEDGE\]" && ((TESTS_PASSED++))
echo "$RECENT_PROVIDERS" | grep -q "KNOWLEDGE" && ((TESTS_PASSED++))
docker logs $CONTAINER_NAME --tail 500 2>&1 | grep -q "KNOWLEDGE Provider took" && ((TESTS_PASSED++))
[ -n "$RAG_LOGS" ] && ((TESTS_PASSED++))

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}✅ All tests passed! ($TESTS_PASSED/$TESTS_TOTAL)${NC}"
    echo "   RAG system appears to be fully functional"
elif [ $TESTS_PASSED -ge 5 ]; then
    echo -e "${YELLOW}⚠️  Mostly working ($TESTS_PASSED/$TESTS_TOTAL)${NC}"
    echo "   RAG system partially functional, check warnings above"
else
    echo -e "${RED}❌ RAG system not working properly ($TESTS_PASSED/$TESTS_TOTAL)${NC}"
    echo "   See failures above for debugging"
fi
echo

# Provide test command
echo "💡 Manual Test Command:"
echo "   Ask in the UI: \"$TEST_QUESTION\""
echo "   Expected response should mention:"
for term in "${EXPECTED_TERMS[@]}"; do
    echo "   - $term"
done
echo
echo "📝 Monitor logs with:"
echo "   docker logs $CONTAINER_NAME -f | grep -E '\[RAG\]|KNOWLEDGE|<providers>'"