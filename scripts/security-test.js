#!/usr/bin/env node
/**
 * Security penetration test: brute force + SQL injection simulation.
 * Run: node scripts/security-test.js
 * Or:  BASE_URL=https://uav.rw node scripts/security-test.js
 * Or:  BASE_URL=https://uav.rw node scripts/security-test.js 2>&1 | tee security-test.log
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/api/auth/login`;
const REGISTER_URL = `${BASE_URL}/api/auth/register`;
const SERVICES_URL = `${BASE_URL}/api/services`;
const OPPORTUNITIES_URL = `${BASE_URL}/api/opportunities`;
const FORUM_URL = `${BASE_URL}/api/forum/posts`;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { ...options, redirect: 'manual' });
  return { status: res.status, ok: res.ok };
}

async function runTests() {
  console.log('==========================================');
  console.log('Security Test: Brute Force + SQL Injection');
  console.log('Target:', BASE_URL);
  console.log('==========================================\n');

  let pass = 0;
  let fail = 0;

  // --- 1. Brute force: rapid login attempts ---
  console.log('[1] Brute force: 35 rapid login attempts (expect 429 after limit)...');
  let rateLimited = 0;
  for (let i = 0; i < 35; i++) {
    const { status } = await fetchJson(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'attacker@test.com', password: 'wrongpassword' }),
    });
    if (status === 429) rateLimited++;
  }
  if (rateLimited > 0) {
    console.log('  PASS: Rate limiting triggered (received', rateLimited, 'x 429)\n');
    pass++;
  } else {
    console.log('  FAIL: No 429 responses; rate limiting may be too loose or not applied\n');
    fail++;
  }

  // --- 2. SQL injection in login (JSON body) ---
  console.log('[2] SQL injection in login (email field)...');
  const sqlPayloads = [
    "admin@uav.rw' OR '1'='1",
    'admin@uav.rw"; DROP TABLE users;--',
    "' OR 1=1--",
    "admin@uav.rw' OR 1=1#",
  ];
  let injectionOk = true;
  for (const p of sqlPayloads) {
    const { status } = await fetchJson(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: p, password: 'x' }),
    });
    if (status === 500) {
      console.log('  FAIL: Payload caused 500:', p);
      injectionOk = false;
    }
  }
  if (injectionOk) {
    console.log('  PASS: All SQL injection payloads handled (400/401, no 500)\n');
    pass++;
  } else {
    fail++;
  }

  // --- 3. SQL injection in GET params ---
  console.log('[3] SQL injection in GET params (services, opportunities)...');
  const sRes = await fetchJson(`${SERVICES_URL}?category=1' OR '1'='1`);
  const oRes = await fetchJson(`${OPPORTUNITIES_URL}?location=Kigali'; DROP TABLE users;--`);
  if (sRes.status === 500 || oRes.status === 500) {
    console.log('  FAIL: GET param injection caused 500 (services=' + sRes.status + ', opportunities=' + oRes.status + ')\n');
    fail++;
  } else {
    console.log('  PASS: GET param injection handled (services=' + sRes.status + ', opportunities=' + oRes.status + ')\n');
    pass++;
  }

  // --- 4. Oversized limit/offset (DoS) ---
  console.log('[4] Oversized limit/offset (DoS)...');
  const lRes = await fetchJson(`${SERVICES_URL}?limit=999999&offset=0`);
  const fRes = await fetchJson(`${FORUM_URL}?limit=999999`);
  if (lRes.status === 500 || fRes.status === 500) {
    console.log('  FAIL: Oversized limit caused 500\n');
    fail++;
  } else {
    console.log('  PASS: Oversized limit did not cause 500 (clamping recommended for robustness)\n');
    pass++;
  }

  console.log('==========================================');
  console.log('Result:', pass, 'passed,', fail, 'failed');
  console.log('==========================================');
  process.exit(fail > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
