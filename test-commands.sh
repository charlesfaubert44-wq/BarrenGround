#!/bin/bash
# Multi-Tenancy Testing Commands
# Backend URL: https://backend-ten-lac-88.vercel.app

echo "======================================"
echo "MULTI-TENANCY ISOLATION TESTS"
echo "======================================"
echo ""

# Test 1: Create user in Shop 1 (barrenground)
echo "Test 1: Creating user in Shop 1 (barrenground)..."
curl -X POST https://backend-ten-lac-88.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456",
    "name": "Alice Shop1"
  }'
echo -e "\n"

# Test 2: Create user in Shop 2 (testcafe)
echo "Test 2: Creating user in Shop 2 (testcafe)..."
curl -X POST https://backend-ten-lac-88.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "bob@shop2.com",
    "password": "test123456",
    "name": "Bob Shop2"
  }'
echo -e "\n"

# Test 3: CRITICAL - Try to login Alice with Shop 2 context (SHOULD FAIL!)
echo "Test 3: CRITICAL - Attempting cross-shop login (SHOULD FAIL)..."
echo "Trying to login alice@shop1.com with testcafe shop context..."
curl -X POST https://backend-ten-lac-88.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456"
  }'
echo -e "\n"
echo "Expected: 401 Unauthorized (if you see a token, DATA ISOLATION IS BROKEN!)"
echo -e "\n"

# Test 4: Login Alice with correct shop context (SHOULD SUCCEED)
echo "Test 4: Login Alice with correct shop context (barrenground)..."
curl -X POST https://backend-ten-lac-88.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: barrenground" \
  -d '{
    "email": "alice@shop1.com",
    "password": "test123456"
  }'
echo -e "\n"
echo "Expected: Success with JWT token"
echo -e "\n"

# Test 5: Login Bob with correct shop context (SHOULD SUCCEED)
echo "Test 5: Login Bob with correct shop context (testcafe)..."
curl -X POST https://backend-ten-lac-88.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Shop-ID: testcafe" \
  -d '{
    "email": "bob@shop2.com",
    "password": "test123456"
  }'
echo -e "\n"
echo "Expected: Success with JWT token"
echo -e "\n"

echo "======================================"
echo "TESTS COMPLETE"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Check that Test 3 FAILED (401 error)"
echo "2. Verify users in database with SQL:"
echo "   SELECT id, email, name, shop_id FROM users WHERE email LIKE '%@shop%.com';"
echo ""
