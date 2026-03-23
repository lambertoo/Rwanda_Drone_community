/**
 * Unified email sender — uses Zoho Mail OAuth API.
 * Falls back to a console log in development when not configured.
 */
import { sendZohoEmail } from "@/lib/zoho-mail"

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    await sendZohoEmail(options)
  } catch (err) {
    console.error("[Email] Failed to send:", err)
    if (process.env.NODE_ENV === "development") {
      console.log(`[Email DEV] To: ${options.to} | Subject: ${options.subject}`)
    }
    throw err
  }
}
