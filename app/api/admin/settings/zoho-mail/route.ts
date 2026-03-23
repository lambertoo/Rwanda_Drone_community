import { NextRequest, NextResponse } from "next/server"
import { sendZohoEmail } from "@/lib/zoho-mail"

// ── GET — return current status ───────────────────────────────
export async function GET() {
  try {
    const isConnected = !!(
      process.env.ZOHO_CLIENT_ID &&
      process.env.ZOHO_REFRESH_TOKEN &&
      process.env.ZOHO_ACCOUNT_ID
    )
    return NextResponse.json({
      isConnected,
      fromEmail: process.env.ZOHO_FROM_EMAIL || null,
      fromName: process.env.ZOHO_FROM_NAME || "Rwanda Drone Community",
      dc: process.env.ZOHO_DC || "com",
    })
  } catch (err) {
    console.error("zoho-mail GET:", err)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}

// ── POST — send test email ────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === "test_email") {
      const { to } = body
      if (!to) return NextResponse.json({ error: "to address required" }, { status: 400 })
      await sendZohoEmail({
        to,
        subject: "Zoho Mail test — Rwanda Drone Community",
        html: `
          <p>This is a test email from your Rwanda Drone Community platform.</p>
          <p>Zoho Mail OAuth 2.0 is configured correctly.</p>
          <p style="color:#888;font-size:12px">Sent at ${new Date().toISOString()}</p>
        `,
      })
      return NextResponse.json({ success: true, message: `Test email sent to ${to}` })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err: any) {
    console.error("zoho-mail POST:", err)
    return NextResponse.json({ error: err.message || "Action failed" }, { status: 500 })
  }
}
