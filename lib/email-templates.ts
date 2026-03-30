/**
 * Branded HTML email templates for noreply@uav.rw
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://uav.rw"
const APP_NAME = "Rwanda UAS Community"

function layout(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:24px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
              ${APP_NAME}
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
              ${APP_NAME} &middot; Kigali, Rwanda<br>
              <a href="${APP_URL}" style="color:#64748b;text-decoration:none;">${APP_URL.replace("https://", "")}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function button(text: string, url: string) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr><td style="background:#2563eb;border-radius:8px;padding:12px 28px;text-align:center;">
        <a href="${url}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">${text}</a>
      </td></tr>
    </table>`
}

// ── Templates ────────────────────────────────────────────────

export function welcomeEmail(name: string) {
  return {
    subject: `Welcome to ${APP_NAME}!`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;">Welcome, ${name}!</h2>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 8px;">
        Your account has been created successfully. You're now part of Rwanda's growing drone community.
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 8px;">
        Here's what you can do next:
      </p>
      <ul style="color:#475569;font-size:15px;line-height:1.8;padding-left:20px;margin:0 0 8px;">
        <li>Complete your profile with your skills and certifications</li>
        <li>Browse upcoming events and training sessions</li>
        <li>Explore job opportunities and projects</li>
        <li>Join forum discussions with fellow pilots</li>
      </ul>
      ${button("Complete Your Profile", `${APP_URL}/complete-profile`)}
      <p style="color:#94a3b8;font-size:13px;margin:0;">
        If you didn't create this account, please ignore this email.
      </p>
    `),
  }
}

export function passwordResetEmail(name: string, resetUrl: string) {
  return {
    subject: "Reset your password",
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;">Password Reset</h2>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 8px;">
        Hi ${name}, we received a request to reset your password.
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 8px;">
        Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
      </p>
      ${button("Reset Password", resetUrl)}
      <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">
        If you didn't request this, you can safely ignore this email. Your password won't change.
      </p>
      <p style="color:#94a3b8;font-size:13px;margin:0;">
        Or copy this link: <a href="${resetUrl}" style="color:#64748b;word-break:break-all;">${resetUrl}</a>
      </p>
    `),
  }
}

export function subscriptionConfirmEmail(name: string | null, topics: string[], unsubscribeToken: string) {
  const topicList = topics.length > 0
    ? topics.map(t => `<li>${t.charAt(0).toUpperCase() + t.slice(1)}</li>`).join("")
    : "<li>All updates</li>"

  const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}`

  return {
    subject: `You're subscribed to ${APP_NAME}`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;">Subscription Confirmed</h2>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 8px;">
        ${name ? `Hi ${name}, you` : "You"}'ve successfully subscribed to updates from ${APP_NAME}.
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 4px;">
        You'll receive updates about:
      </p>
      <ul style="color:#475569;font-size:15px;line-height:1.8;padding-left:20px;margin:0 0 8px;">
        ${topicList}
      </ul>
      ${button("Visit Platform", APP_URL)}
      <p style="color:#94a3b8;font-size:13px;margin:0;">
        <a href="${unsubscribeUrl}" style="color:#64748b;">Unsubscribe</a> at any time.
      </p>
    `),
  }
}
