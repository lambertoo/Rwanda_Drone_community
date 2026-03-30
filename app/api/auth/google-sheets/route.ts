import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { extractTokenFromRequest, verifyToken } from "@/lib/jwt-utils"

/**
 * GET /api/auth/google-sheets — Redirect user to Google OAuth consent for Sheets access.
 * Requires the user to be logged in (JWT). Asks for spreadsheets + drive.file scopes
 * so the app can create and write sheets in the user's own Google Drive.
 *
 * Query params:
 *   ?formId=xxx  — optional, redirects back to form editor after auth
 */
export async function GET(request: NextRequest) {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return NextResponse.json({ error: "Auth required" }, { status: 401 })
  }
  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const redirectUri = `${appUrl}/api/auth/google-sheets/callback`

  // Encode formId + userId into the state so the callback can redirect back
  const formId = request.nextUrl.searchParams.get("formId") || ""
  const statePayload = JSON.stringify({
    csrf: crypto.randomBytes(16).toString("hex"),
    userId: payload.userId,
    formId,
  })
  const state = Buffer.from(statePayload).toString("base64url")

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file",
    access_type: "offline",   // Need refresh_token
    prompt: "consent",        // Force consent to always get refresh_token
    state,
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  const response = NextResponse.redirect(url)
  response.cookies.set("google_sheets_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  return response
}
