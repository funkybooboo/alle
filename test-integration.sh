#!/bin/bash

echo "================================"
echo "Testing Backend-Frontend Integration"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local data=$3

    echo -n "Testing $name... "

    if response=$(curl -s -X POST "$url" -H "Content-Type: application/json" -d "$data" 2>&1); then
        if echo "$response" | grep -q '"data"'; then
            echo -e "${GREEN}✓ PASSED${NC}"
            ((PASSED++))
            echo "  Response: $(echo $response | jq -c '.data' 2>/dev/null || echo $response)"
        else
            echo -e "${RED}✗ FAILED${NC}"
            ((FAILED++))
            echo "  Error: $response"
        fi
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
        echo "  Error: Connection failed"
    fi
    echo ""
}

# Test 1: Basic connectivity
echo "1. Testing Basic GraphQL Connectivity"
test_endpoint "Schema introspection" \
    "http://localhost:8000/graphql" \
    '{"query":"query { __typename }"}'

# Test 2: Get all tasks
echo "2. Testing Task Queries"
test_endpoint "Get all tasks" \
    "http://localhost:8000/graphql" \
    '{"query":"query { tasks { id title completed date } }"}'

# Test 3: Create a task
echo "3. Testing Task Mutations"
TIMESTAMP=$(date +%s)
test_endpoint "Create task" \
    "http://localhost:8000/graphql" \
    "{\"query\":\"mutation { createTask(input: { title: \\\"Test Task $TIMESTAMP\\\", date: \\\"2026-01-15T12:00:00Z\\\" }) { id title completed date } }\"}"

# Test 4: Get settings
echo "4. Testing Settings Queries"
test_endpoint "Get settings" \
    "http://localhost:8000/graphql" \
    '{"query":"query { settings { id columnMinWidth singleArrowDays doubleArrowDays todayShowsPrevious fontSize fontType } }"}'

# Test 5: Get trash
echo "5. Testing Trash Queries"
test_endpoint "Get trash items" \
    "http://localhost:8000/graphql" \
    '{"query":"query { trash { id taskText taskDate taskCompleted taskType deletedAt } }"}'

# Test 6: Test WebSocket endpoint
echo "6. Testing WebSocket Endpoint"
echo -n "Checking WebSocket availability... "
if curl -s -I http://localhost:8000/ws | grep -q "426"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    echo "  WebSocket endpoint is available (HTTP 426 Upgrade Required)"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "  WebSocket endpoint may not be properly configured"
fi
echo ""

# Test 7: Frontend accessibility
echo "7. Testing Frontend Accessibility"
echo -n "Checking frontend... "
if curl -s http://localhost:5173 | grep -q "vite"; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
    echo "  Frontend is accessible at http://localhost:5173"
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
    echo "  Frontend is not accessible"
fi
echo ""

# Summary
echo "================================"
echo "Test Summary"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    echo ""
    echo "Frontend: http://localhost:5173"
    echo "Backend GraphQL: http://localhost:8000/graphql"
    echo "Backend WebSocket: ws://localhost:8000/ws"
    exit 0
else
    echo -e "${RED}Some tests failed! ✗${NC}"
    exit 1
fi
