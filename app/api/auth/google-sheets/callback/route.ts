import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/auth/google-sheets/callback — Handle Google OAuth callback for Sheets.
 * Exchanges the authorization code for tokens and stores them on the user record.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  if (error || !code || !state) {
    console.error("[GoogleSheets OAuth] Error or missing params:", { error, hasCode: !!code, hasState: !!state })
    return NextResponse.redirect(`${appUrl}/forms?error=google_sheets_auth_failed`)
  }

  // Verify state matches cookie
  const cookieState = req.cookies.get("google_sheets_oauth_state")?.value
  if (!cookieState || cookieState !== state) {
    console.error("[GoogleSheets OAuth] State mismatch")
    return NextResponse.redirect(`${appUrl}/forms?error=invalid_state`)
  }

  // Decode state to get userId and formId
  let userId: string
  let formId: string
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString())
    userId = parsed.userId
    formId = parsed.formId || ""
  } catch {
    console.error("[GoogleSheets OAuth] Failed to decode state")
    return NextResponse.redirect(`${appUrl}/forms?error=invalid_state`)
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri = `${appUrl}/api/auth/google-sheets/callback`

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) {
      console.error("[GoogleSheets OAuth] Token exchange failed:", tokens)
      return NextResponse.redirect(`${appUrl}/forms?error=token_exchange_failed`)
    }

    // Store tokens on user
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || undefined,
        googleTokenExpiry: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : undefined,
      },
    })

    console.log("[GoogleSheets OAuth] Tokens saved for user:", userId)

    // Clear state cookie and redirect back
    const redirectTo = formId ? `/forms/${formId}/edit` : "/forms"
    const response = NextResponse.redirect(`${appUrl}${redirectTo}?sheets_connected=true`)
    response.cookies.set("google_sheets_oauth_state", "", { maxAge: 0, path: "/" })

    return response
  } catch (err) {
    console.error("[GoogleSheets OAuth] Error:", err)
    return NextResponse.redirect(`${appUrl}/forms?error=server_error`)
  }
}
