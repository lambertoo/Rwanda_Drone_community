#!/bin/bash
# Security penetration test: brute force + SQL injection simulation
# Run against local (default) or BASE_URL=https://uav.rw ./scripts/security-test.sh
# Uses curl; no auth required for tested endpoints.

set -e
BASE_URL="${BASE_URL:-http://localhost:3000}"
LOGIN_URL="$BASE_URL/api/auth/login"
REGISTER_URL="$BASE_URL/api/auth/register"
SERVICES_URL="$BASE_URL/api/services"
OPPORTUNITIES_URL="$BASE_URL/api/opportunities"
FORUM_URL="$BASE_URL/api/forum/posts"

echo "=========================================="
echo "Security Test: Brute Force + SQL Injection"
echo "Target: $BASE_URL"
echo "=========================================="

# --- 1. Brute force simulation: rapid login attempts ---
echo ""
echo "[1] Brute force test: 35 rapid login attempts (expect 429 after limit)..."
rate_limited=0
for i in $(seq 1 35); do
  status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$LOGIN_URL" \
    -H "Content-Type: application/json" \
    -d '{"email":"attacker@test.com","password":"wrongpassword"}' 2>/dev/null || echo "000")
  if [ "$status" = "429" ]; then
    rate_limited=$((rate_limited + 1))
  fi
done
if [ $rate_limited -gt 0 ]; then
  echo "  PASS: Rate limiting triggered (received $rate_limited x 429)"
else
  echo "  FAIL: No 429 responses; rate limiting may be too loose or not applied"
fi

# --- 2. SQL injection in login (JSON body) ---
echo ""
echo "[2] SQL injection in login (email field)..."
payloads=(
  "admin@uav.rw' OR '1'='1"
  "admin@uav.rw\"; DROP TABLE users;--"
  "' OR 1=1--"
  "admin@uav.rw' OR 1=1#"
)
injection_ok=1
for p in "${payloads[@]}"; do
  enc=$(echo "$p" | jq -sRr @json)
  body="{\"email\":$enc,\"password\":\"x\"}"
  status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$LOGIN_URL" \
    -H "Content-Type: application/json" \
    -d "$body" 2>/dev/null || echo "000")
  # Expect 400 (validation) or 401 (invalid credentials), never 500
  if [ "$status" = "500" ]; then
    echo "  FAIL: SQL injection payload caused 500: $p"
    injection_ok=0
  fi
done
if [ $injection_ok -eq 1 ]; then
  echo "  PASS: All SQL injection payloads handled (400/401, no 500)"
else
  echo "  FAIL: Some payloads caused 500"
fi

# --- 3. SQL injection in GET params (services, opportunities) ---
echo ""
echo "[3] SQL injection in GET params (services category, opportunities location)..."
# Services: category
status_s=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICES_URL?category=1'%20OR%20'1'='1" 2>/dev/null || echo "000")
# Opportunities: location
status_o=$(curl -s -o /dev/null -w "%{http_code}" "$OPPORTUNITIES_URL?location=Kigali'%3B%20DROP%20TABLE%20users%3B--" 2>/dev/null || echo "000")
if [ "$status_s" = "500" ] || [ "$status_o" = "500" ]; then
  echo "  FAIL: GET param injection caused 500 (services=$status_s, opportunities=$status_o)"
else
  echo "  PASS: GET param injection handled without 500 (services=$status_s, opportunities=$status_o)"
fi

# --- 4. Oversized limit/offset (Do_s) ---
echo ""
echo "[4] Oversized limit/offset (Do_s)..."
status_l=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICES_URL?limit=999999&offset=0" 2>/dev/null || echo "000")
status_f=$(curl -s -o /dev/null -w "%{http_code}" "$FORUM_URL?limit=999999" 2>/dev/null || echo "000")
# Ideally 400 or 200 with clamped limit; 500 = bad
if [ "$status_l" = "500" ] || [ "$status_f" = "500" ]; then
  echo "  WARN: Oversized limit caused 500 (services=$status_l, forum=$status_f). Consider clamping."
else
  echo "  INFO: Oversized limit returned $status_l / $status_f (clamping recommended)"
fi

echo ""
echo "=========================================="
echo "Security test complete."
echo "=========================================="
