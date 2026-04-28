import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt-utils'
import { canEdit } from '@/lib/collaboration'
import { sendEmail } from '@/lib/email'

const MAX_RECIPIENTS = 50

function buildEmailHtml(params: {
  formTitle: string
  senderName: string
  message: string
  formUrl: string
}) {
  const { formTitle, senderName, message, formUrl } = params
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);max-width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#003366;padding:24px 32px;">
            <p style="margin:0;color:#009FDA;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Rwanda UAS Community</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;">${formTitle}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
              <strong>${senderName}</strong> has invited you to fill out a form.
            </p>
            ${message ? `<p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:1.7;background:#f9fafb;border-left:3px solid #009FDA;padding:12px 16px;border-radius:4px;">${message}</p>` : ''}
            <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
              <tr>
                <td style="background:#009FDA;border-radius:8px;">
                  <a href="${formUrl}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.2px;">
                    Open Form →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              Or copy this link: <a href="${formUrl}" style="color:#009FDA;word-break:break-all;">${formUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              Rwanda UAS Community Platform · You received this because someone shared a form with you.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await params

  const token = request.cookies.get('accessToken')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const allowed = await canEdit(payload.userId, payload.email, 'FORM', formId)
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await prisma.universalForm.findUnique({
    where: { id: formId },
    select: { id: true, title: true, slug: true },
  })
  if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

  const sender = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { fullName: true, email: true },
  })

  const body = await request.json()
  const rawEmails: string[] = body.emails ?? []
  const message: string = (body.message ?? '').slice(0, 500).trim()

  const emails = rawEmails
    .flatMap((e: string) => e.split(/[\s,;]+/))
    .map((e: string) => e.trim().toLowerCase())
    .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

  const uniqueEmails = [...new Set(emails)].slice(0, MAX_RECIPIENTS)

  if (uniqueEmails.length === 0) {
    return NextResponse.json({ error: 'No valid email addresses provided' }, { status: 400 })
  }

  const formUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://uascommunity.rw'}/forms/public/${form.id}`
  const senderName = sender?.fullName ?? payload.email

  const results = await Promise.allSettled(
    uniqueEmails.map((email) =>
      sendEmail({
        to: email,
        subject: `You've been invited to fill out: ${form.title}`,
        html: buildEmailHtml({ formTitle: form.title, senderName, message, formUrl }),
        text: `${senderName} has invited you to fill out "${form.title}".\n\n${message ? message + '\n\n' : ''}Open the form here: ${formUrl}`,
      })
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({ sent, failed, total: uniqueEmails.length })
}
