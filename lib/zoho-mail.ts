/**
 * Zoho Mail API client — OAuth 2.0 (env-based config)
 *
 * Uses ZOHO_* env vars for credentials. Auto-refreshes the access token.
 */

const ZOHO_DC: Record<string, { auth: string; api: string }> = {
  com: { auth: "https://accounts.zoho.com", api: "https://mail.zoho.com" },
  eu: { auth: "https://accounts.zoho.eu", api: "https://mail.zoho.eu" },
  in: { auth: "https://accounts.zoho.in", api: "https://mail.zoho.in" },
  au: { auth: "https://accounts.zoho.com.au", api: "https://mail.zoho.com.au" },
}

// ── In-memory token cache ──────────────────────────────────────
let cachedAccessToken: string | null = null
let tokenExpiresAt = 0

function getConfig() {
  const clientId = process.env.ZOHO_CLIENT_ID
  const clientSecret = process.env.ZOHO_CLIENT_SECRET
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN
  const accountId = process.env.ZOHO_ACCOUNT_ID
  const fromEmail = process.env.ZOHO_FROM_EMAIL || "noreply@uav.rw"
  const fromName = process.env.ZOHO_FROM_NAME || "Rwanda UAS Community"
  const dc = process.env.ZOHO_DC || "com"

  if (!clientId || !clientSecret || !refreshToken || !accountId) {
    return null
  }

  return { clientId, clientSecret, refreshToken, accountId, fromEmail, fromName, dc }
}

async function getValidAccessToken(): Promise<string | null> {
  const config = getConfig()
  if (!config) return null

  // Return cached token if still valid (60s buffer)
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken
  }

  const dcConfig = ZOHO_DC[config.dc] || ZOHO_DC.com

  const res = await fetch(`${dcConfig.auth}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  })

  const data = await res.json()
  if (!data.access_token) {
    console.error("[ZohoMail] Token refresh failed:", data)
    return null
  }

  cachedAccessToken = data.access_token
  tokenExpiresAt = Date.now() + (data.expires_in ?? 3600) * 1000

  return cachedAccessToken
}

// ── Public API ────────────────────────────────────────────────
export interface ZohoSendOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendZohoEmail(options: ZohoSendOptions) {
  const config = getConfig()
  if (!config) {
    console.warn("[ZohoMail] Not configured — email not sent")
    return
  }

  const token = await getValidAccessToken()
  if (!token) {
    throw new Error("Failed to obtain Zoho access token")
  }

  const dcConfig = ZOHO_DC[config.dc] || ZOHO_DC.com

  const body = {
    fromAddress: config.fromEmail,
    toAddress: options.to,
    subject: options.subject,
    content: options.html,
    mailFormat: "html",
  }

  const res = await fetch(
    `${dcConfig.api}/api/accounts/${config.accountId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Zoho Mail API error ${res.status}: ${err}`)
  }

  return res.json()
}
