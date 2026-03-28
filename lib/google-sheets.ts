import { google } from 'googleapis'

/**
 * Google Sheets integration for form responses.
 *
 * Required env vars:
 *   GOOGLE_SHEETS_CLIENT_EMAIL  – service account email
 *   GOOGLE_SHEETS_PRIVATE_KEY   – service account private key (PEM, with \n)
 *
 * Per-form config (stored in form.settings.googleSheetId):
 *   The Google Sheet must be shared with the service account email (Editor).
 */

function getAuth() {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !key) return null

  return new google.auth.JWT(email, undefined, key, [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ])
}

/**
 * Create a new Google Sheet for a form and return the spreadsheet ID.
 */
export async function createSheetForForm(
  formTitle: string,
  fieldLabels: string[]
): Promise<string | null> {
  const auth = getAuth()
  if (!auth) return null

  try {
    await auth.authorize()
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

    const spreadsheetId = res.data.spreadsheetId
    if (!spreadsheetId) return null

    // Make it accessible via link (anyone with link can view)
    const drive = google.drive({ version: 'v3', auth })
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: 'writer',
        type: 'anyone',
      },
    }).catch(() => {
      // Non-critical — sheet still works, just not publicly shared
    })

    return spreadsheetId
  } catch (err) {
    console.error('[GoogleSheets] Failed to create sheet:', err)
    return null
  }
}

/**
 * Append a form submission as a new row in the linked Google Sheet.
 */
export async function appendSubmissionToSheet(
  spreadsheetId: string,
  rowNumber: number,
  submittedAt: string,
  fields: { label: string; name: string }[],
  values: Record<string, string | null>
): Promise<boolean> {
  const auth = getAuth()
  if (!auth) return false

  try {
    await auth.authorize()
    const sheets = google.sheets({ version: 'v4', auth })

    const row = [
      rowNumber.toString(),
      submittedAt,
      ...fields.map((f) => {
        const val = values[f.name]
        if (!val) return ''
        // Try to parse JSON arrays (checkboxes) into comma-separated
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed)) return parsed.join(', ')
          if (typeof parsed === 'object') {
            // Matrix responses — join as "row: value"
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
  spreadsheetId: string,
  fields: { label: string; name: string }[],
  submissions: { submittedAt: string; values: Record<string, string | null> }[]
): Promise<boolean> {
  const auth = getAuth()
  if (!auth) return false

  try {
    await auth.authorize()
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

/**
 * Check if Google Sheets integration is configured.
 */
export function isGoogleSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
    process.env.GOOGLE_SHEETS_PRIVATE_KEY
  )
}
