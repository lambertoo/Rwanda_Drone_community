import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

/**
 * Google Sheets integration using the user's own OAuth tokens.
 * Sheets are created in the user's Google Drive, owned by them.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID      – OAuth client ID
 *   GOOGLE_CLIENT_SECRET   – OAuth client secret
 */

export interface UserGoogleTokens {
  accessToken: string
  refreshToken: string | null
  tokenExpiry: Date | null
  userId: string
}

/**
 * Build an OAuth2 client from user tokens, refreshing if expired.
 */
async function getAuthForUser(tokens: UserGoogleTokens) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  )

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.tokenExpiry?.getTime(),
  })

  // If token is expired or about to expire (within 5 min), refresh it
  const isExpired = tokens.tokenExpiry && tokens.tokenExpiry.getTime() < Date.now() + 5 * 60 * 1000
  if (isExpired && tokens.refreshToken) {
    const { credentials } = await oauth2Client.refreshAccessToken()
    oauth2Client.setCredentials(credentials)

    // Persist refreshed tokens
    await prisma.user.update({
      where: { id: tokens.userId },
      data: {
        googleAccessToken: credentials.access_token,
        googleRefreshToken: credentials.refresh_token || tokens.refreshToken,
        googleTokenExpiry: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : undefined,
      },
    })
  }

  return oauth2Client
}

/**
 * Check if a user has connected their Google account for Sheets.
 */
export function hasGoogleSheetsAuth(user: { googleAccessToken?: string | null; googleRefreshToken?: string | null }): boolean {
  return !!(user.googleAccessToken && user.googleRefreshToken)
}

/**
 * Create a new Google Sheet for a form in the user's Drive.
 */
export async function createSheetForForm(
  tokens: UserGoogleTokens,
  formTitle: string,
  fieldLabels: string[]
): Promise<string | null> {
  try {
    const auth = await getAuthForUser(tokens)
    const sheets = google.sheets({ version: 'v4', auth })

    const res = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: `${formTitle} — Responses` },
        sheets: [
          {
            properties: { title: 'Responses', index: 0 },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: ['#', 'Submitted At', ...fieldLabels].map((label) => ({
                      userEnteredValue: { stringValue: label },
                      userEnteredFormat: { textFormat: { bold: true } },
                    })),
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    return res.data.spreadsheetId || null
  } catch (err) {
    console.error('[GoogleSheets] Failed to create sheet:', err)
    return null
  }
}

/**
 * Append a form submission as a new row in the linked Google Sheet.
 */
export async function appendSubmissionToSheet(
  tokens: UserGoogleTokens,
  spreadsheetId: string,
  rowNumber: number,
  submittedAt: string,
  fields: { label: string; name: string }[],
  values: Record<string, string | null>
): Promise<boolean> {
  try {
    const auth = await getAuthForUser(tokens)
    const sheets = google.sheets({ version: 'v4', auth })

    const row = [
      rowNumber.toString(),
      submittedAt,
      ...fields.map((f) => {
        const val = values[f.name]
        if (!val) return ''
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed.join(', ')
          if (typeof parsed === 'object') {
            return Object.entries(parsed)
              .map(([k, v]) => `${k}: ${v}`)
              .join('; ')
          }
        } catch {}
        return val
      }),
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Responses!A:A',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    })

    return true
  } catch (err) {
    console.error('[GoogleSheets] Failed to append row:', err)
    return false
  }
}

/**
 * Sync all existing submissions to a Google Sheet (backfill).
 */
export async function syncAllSubmissionsToSheet(
  tokens: UserGoogleTokens,
  spreadsheetId: string,
  fields: { label: string; name: string }[],
  submissions: { submittedAt: string; values: Record<string, string | null> }[]
): Promise<boolean> {
  try {
    const auth = await getAuthForUser(tokens)
    const sheets = google.sheets({ version: 'v4', auth })

    // Clear existing data (keep header)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Responses!A2:ZZ',
    })

    if (submissions.length === 0) return true

    const rows = submissions.map((sub, i) => [
      (i + 1).toString(),
      sub.submittedAt,
      ...fields.map((f) => {
        const val = sub.values[f.name]
        if (!val) return ''
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed.join(', ')
          if (typeof parsed === 'object') {
            return Object.entries(parsed)
              .map(([k, v]) => `${k}: ${v}`)
              .join('; ')
          }
        } catch {}
        return val
      }),
    ])

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Responses!A2:A',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows },
    })

    return true
  } catch (err) {
    console.error('[GoogleSheets] Failed to sync submissions:', err)
    return false
  }
}
