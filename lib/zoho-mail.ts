/**
 * Zoho Mail API client — OAuth 2.0
 *
 * Flow:
 *  1. Admin saves Client ID + Secret + data center in admin settings
 *  2. Admin clicks "Connect" → redirected to Zoho OAuth consent screen
 *  3. Zoho redirects back to /api/auth/zoho/callback?code=xxx
 *  4. Callback exchanges code for access_token + refresh_token, fetches accountId
 *  5. sendZohoEmail() auto-refreshes the token before each call
 *
 * Zoho data centers:
 *   com → accounts.zoho.com  / mail.zoho.com
 *   eu  → accounts.zoho.eu   / mail.zoho.eu
 *   in  → accounts.zoho.in   / mail.zoho.in
 *   au  → accounts.zoho.com.au / mail.zoho.com.au
 */

import { prisma } from "@/lib/prisma"

export const ZOHO_DC: Record<string, { label: string; auth: string; api: string }> = {
  com: { label: "Global (US)",  auth: "https://accounts.zoho.com",    api: "https://mail.zoho.com"    },
  eu:  { label: "Europe",       auth: "https://accounts.zoho.eu",     api: "https://mail.zoho.eu"     },
  in:  { label: "India",        auth: "https://accounts.zoho.in",     api: "https://mail.zoho.in"     },
  au:  { label: "Australia",    auth: "https://accounts.zoho.com.au", api: "https://mail.zoho.com.au" },
}

export const ZOHO_SCOPES = "ZohoMail.messages.CREATE,ZohoMail.accounts.READ"

// ── DB helpers ────────────────────────────────────────────────
async function get(key: string): Promise<string | null> {
  const row = await prisma.systemSetting.findUnique({ where: { key } })
  return row?.value ?? null
}

async function set(key: string, value: string) {
  await prisma.systemSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })
}

async function del(key: string) {
  await prisma.systemSetting.deleteMany({ where: { key } })
}

// ── Token management ──────────────────────────────────────────
async function getValidAccessToken(): Promise<{ token: string; accountId: string; apiBase: string } | null> {
  const [clientId, clientSecret, refreshToken, accountId, dc] = await Promise.all([
    get("zoho_client_id"),
    get("zoho_client_secret"),
    get("zoho_refresh_token"),
    get("zoho_account_id"),
    get("zoho_dc"),
  ])

  if (!clientId || !clientSecret || !refreshToken || !accountId) return null

  const dcConfig = ZOHO_DC[dc || "com"]

  // Return cached token if still valid (with 60s buffer)
  const [cachedToken, expiryStr] = await Promise.all([
    get("zoho_access_token"),
    get("zoho_token_expiry"),
  ])
  if (cachedToken && expiryStr && Date.now() < parseInt(expiryStr) - 60_000) {
    return { token: cachedToken, accountId, apiBase: dcConfig.api }
  }

  // Refresh
  const res = await fetch(`${dcConfig.auth}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  const data = await res.json()
  if (!data.access_token) {
    console.error("[ZohoMail] Token refresh failed:", data)
    return null
  }

  const expiry = Date.now() + (data.expires_in ?? 3600) * 1000
  await Promise.all([
    set("zoho_access_token", data.access_token),
    set("zoho_token_expiry", expiry.toString()),
  ])

  return { token: data.access_token, accountId, apiBase: dcConfig.api }
}

// ── Public API ────────────────────────────────────────────────
export interface ZohoSendOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendZohoEmail(options: ZohoSendOptions) {
  const auth = await getValidAccessToken()
  if (!auth) {
    console.warn("[ZohoMail] Not configured or token unavailable — email not sent")
    return
  }

  const [fromEmail, fromName] = await Promise.all([
    get("zoho_from_email"),
    get("zoho_from_name"),
  ])

  const body = {
    fromAddress: fromEmail,
    toAddress: options.to,
    subject: options.subject,
    content: options.html,
    mailFormat: "html",
  }

  const res = await fetch(`${auth.apiBase}/api/accounts/${auth.accountId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${auth.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Zoho Mail API error ${res.status}: ${err}`)
  }

  return res.json()
}

/** Exchange authorization code for tokens and persist everything. */
export async function exchangeCodeForTokens(code: string) {
  const [clientId, clientSecret, dc] = await Promise.all([
    get("zoho_client_id"),
    get("zoho_client_secret"),
    get("zoho_dc"),
  ])

  if (!clientId || !clientSecret) throw new Error("Zoho client credentials not set")

  const dcConfig = ZOHO_DC[dc || "com"]
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoho/callback`

  // Exchange code for tokens
  const tokenRes = await fetch(`${dcConfig.auth}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  })

  const tokens = await tokenRes.json()
  if (!tokens.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`)

  const expiry = Date.now() + (tokens.expires_in ?? 3600) * 1000

  // Fetch account ID + default email
  const accountsRes = await fetch(`${dcConfig.api}/api/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${tokens.access_token}` },
  })
  const accountsData = await accountsRes.json()
  const account = accountsData?.data?.[0]
  if (!account) throw new Error("Could not retrieve Zoho account details")

  const accountId = String(account.accountId)
  const defaultEmail =
    account.emailAddress?.find((e: any) => e.isDefaultAddress)?.mailId ??
    account.emailAddress?.[0]?.mailId

  // Persist all tokens
  await Promise.all([
    set("zoho_access_token", tokens.access_token),
    tokens.refresh_token ? set("zoho_refresh_token", tokens.refresh_token) : Promise.resolve(),
    set("zoho_token_expiry", expiry.toString()),
    set("zoho_account_id", accountId),
    defaultEmail ? set("zoho_from_email", defaultEmail) : Promise.resolve(),
  ])

  return { accountId, fromEmail: defaultEmail }
}

/** Returns the current Zoho configuration status (no secrets exposed). */
export async function getZohoStatus() {
  const [clientId, clientSecret, refreshToken, accountId, fromEmail, dc, fromName] =
    await Promise.all([
      get("zoho_client_id"),
      get("zoho_client_secret"),
      get("zoho_refresh_token"),
      get("zoho_account_id"),
      get("zoho_from_email"),
      get("zoho_dc"),
      get("zoho_from_name"),
    ])

  return {
    isConnected: !!(refreshToken && accountId),
    hasCredentials: !!(clientId && clientSecret),
    fromEmail: fromEmail ?? null,
    fromName: fromName ?? "Rwanda Drone Community",
    dc: dc ?? "com",
    accountId: accountId ?? null,
    // Safe previews — never expose full values
    clientIdPreview: clientId ? `${clientId.slice(0, 8)}…` : null,
  }
}

/** Saves Client ID, Client Secret, data center and from-name (not tokens). */
export async function saveZohoCredentials(opts: {
  clientId: string
  clientSecret: string
  dc: string
  fromName: string
}) {
  await Promise.all([
    set("zoho_client_id", opts.clientId),
    set("zoho_client_secret", opts.clientSecret),
    set("zoho_dc", opts.dc),
    set("zoho_from_name", opts.fromName),
    // Clear old tokens when credentials change
    del("zoho_access_token"),
    del("zoho_refresh_token"),
    del("zoho_token_expiry"),
    del("zoho_account_id"),
    del("zoho_from_email"),
  ])
}

/** Revoke tokens (disconnect). */
export async function revokeZohoConnection() {
  await Promise.all([
    del("zoho_access_token"),
    del("zoho_refresh_token"),
    del("zoho_token_expiry"),
    del("zoho_account_id"),
    del("zoho_from_email"),
  ])
}

/** Build the Zoho OAuth authorization URL. */
export async function buildZohoAuthUrl(): Promise<string | null> {
  const [clientId, dc] = await Promise.all([get("zoho_client_id"), get("zoho_dc")])
  if (!clientId) return null

  const dcConfig = ZOHO_DC[dc || "com"]
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/zoho/callback`

  const url = new URL(`${dcConfig.auth}/oauth/v2/auth`)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("scope", ZOHO_SCOPES)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("access_type", "offline")
  url.searchParams.set("prompt", "consent")

  return url.toString()
}
