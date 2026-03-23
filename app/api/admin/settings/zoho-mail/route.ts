import { NextRequest, NextResponse } from "next/server"
import {
  getZohoStatus,
  saveZohoCredentials,
  revokeZohoConnection,
  buildZohoAuthUrl,
  sendZohoEmail,
} from "@/lib/zoho-mail"
import { prisma } from "@/lib/prisma"

// ── GET — return current status ───────────────────────────────
export async function GET() {
  try {
    const [status, authUrl] = await Promise.all([
      getZohoStatus(),
      buildZohoAuthUrl(),
    ])
    return NextResponse.json({ ...status, authUrl })
  } catch (err) {
    console.error("zoho-mail GET:", err)
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 })
  }
}

// ── POST — handle actions ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    // Save credentials
    if (action === "save_credentials") {
      const { clientId, clientSecret, dc, fromName } = body
      if (!clientId || !clientSecret || !dc) {
        return NextResponse.json({ error: "clientId, clientSecret and dc are required" }, { status: 400 })
      }
      await saveZohoCredentials({ clientId, clientSecret, dc, fromName: fromName || "Rwanda Drone Community" })
      const [status, authUrl] = await Promise.all([getZohoStatus(), buildZohoAuthUrl()])
      return NextResponse.json({ success: true, ...status, authUrl })
    }

    // Disconnect / revoke
    if (action === "disconnect") {
      await revokeZohoConnection()
      return NextResponse.json({ success: true, isConnected: false })
    }

    // Update from-name after connection
    if (action === "update_from_name") {
      const { fromName } = body
      if (!fromName) return NextResponse.json({ error: "fromName required" }, { status: 400 })
      await prisma.systemSetting.upsert({
        where: { key: "zoho_from_name" },
        create: { key: "zoho_from_name", value: fromName },
        update: { value: fromName },
      })
      return NextResponse.json({ success: true })
    }

    // Send test email
    if (action === "test_email") {
      const { to } = body
      if (!to) return NextResponse.json({ error: "to address required" }, { status: 400 })
      await sendZohoEmail({
        to,
        subject: "✅ Zoho Mail test — Rwanda Drone Community",
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
