import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/zoho-mail"

/**
 * Handles the Zoho OAuth 2.0 callback.
 * Zoho redirects here with ?code=xxx after the admin grants access.
 * After exchanging the code we redirect back to the Zoho Mail settings page.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  const settingsUrl = new URL("/admin/settings/zoho-mail", req.url)

  if (error || !code) {
    settingsUrl.searchParams.set("error", error || "no_code")
    return NextResponse.redirect(settingsUrl)
  }

  try {
    await exchangeCodeForTokens(code)
    settingsUrl.searchParams.set("connected", "1")
    return NextResponse.redirect(settingsUrl)
  } catch (err: any) {
    console.error("[Zoho callback]", err)
    settingsUrl.searchParams.set("error", encodeURIComponent(err.message || "token_exchange_failed"))
    return NextResponse.redirect(settingsUrl)
  }
}
