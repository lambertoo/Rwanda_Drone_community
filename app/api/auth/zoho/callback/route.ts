import { NextRequest, NextResponse } from "next/server"

/**
 * Zoho OAuth callback — no longer needed since credentials are env-based.
 * Kept as a redirect stub in case old links still point here.
 */
export async function GET(req: NextRequest) {
  const settingsUrl = new URL("/admin/settings/zoho-mail", req.url)
  settingsUrl.searchParams.set("info", "oauth_configured_via_env")
  return NextResponse.redirect(settingsUrl)
}
