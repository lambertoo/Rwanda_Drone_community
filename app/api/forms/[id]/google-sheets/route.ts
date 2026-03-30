import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'
import {
  createSheetForForm,
  syncAllSubmissionsToSheet,
  hasGoogleSheetsAuth,
  UserGoogleTokens,
} from '@/lib/google-sheets'

// GET — check integration status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params
    const token = extractTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { googleAccessToken: true, googleRefreshToken: true },
    })

    const form = await prisma.universalForm.findFirst({
      where: { id: formId, userId: payload.userId },
      select: { settings: true },
    })
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

    const settings = form.settings as any
    const googleConnected = hasGoogleSheetsAuth(user || {})

    return NextResponse.json({
      googleConnected,
      sheetLinked: !!settings?.googleSheetId,
      spreadsheetId: settings?.googleSheetId || null,
      spreadsheetUrl: settings?.googleSheetId
        ? `https://docs.google.com/spreadsheets/d/${settings.googleSheetId}`
        : null,
    })
  } catch (error) {
    console.error('[GoogleSheets] GET error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST — create & connect a new sheet, or connect an existing one
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params
    const token = extractTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    // Get user's Google tokens
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, googleAccessToken: true, googleRefreshToken: true, googleTokenExpiry: true },
    })

    if (!user || !hasGoogleSheetsAuth(user)) {
      return NextResponse.json(
        { error: 'Google account not connected. Please connect your Google account first.' },
        { status: 400 }
      )
    }

    const userTokens: UserGoogleTokens = {
      accessToken: user.googleAccessToken!,
      refreshToken: user.googleRefreshToken!,
      tokenExpiry: user.googleTokenExpiry,
      userId: user.id,
    }

    const form = await prisma.universalForm.findFirst({
      where: { id: formId, userId: payload.userId },
      include: {
        sections: { include: { fields: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
        entries: { include: { values: { include: { field: true } } }, orderBy: { createdAt: 'asc' } },
      },
    })
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

    const body = await request.json().catch(() => ({}))
    let spreadsheetId = body.spreadsheetId as string | undefined

    // Get all fields for column headers
    const allFields = form.sections.flatMap((s) => s.fields)
    const fieldLabels = allFields.map((f) => f.label)

    // Create a new sheet if no existing ID provided
    if (!spreadsheetId) {
      spreadsheetId = await createSheetForForm(userTokens, form.title, fieldLabels) ?? undefined
      if (!spreadsheetId) {
        return NextResponse.json({ error: 'Failed to create Google Sheet' }, { status: 500 })
      }
    }

    // Save sheet ID to form settings
    const currentSettings = (form.settings as any) || {}
    await prisma.universalForm.update({
      where: { id: formId },
      data: {
        settings: { ...currentSettings, googleSheetId: spreadsheetId },
      },
    })

    // Backfill existing submissions
    if (form.entries.length > 0) {
      const submissions = form.entries.map((entry) => {
        const valuesMap: Record<string, string | null> = {}
        entry.values.forEach((v) => {
          valuesMap[v.field.name] = v.value
        })
        return {
          submittedAt: (entry.meta as any)?.submittedAt || entry.createdAt.toISOString(),
          values: valuesMap,
        }
      })

      await syncAllSubmissionsToSheet(
        userTokens,
        spreadsheetId,
        allFields.map((f) => ({ label: f.label, name: f.name })),
        submissions
      )
    }

    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      syncedRows: form.entries.length,
    })
  } catch (error: any) {
    console.error('[GoogleSheets] POST error:', error?.message || error)
    return NextResponse.json(
      { error: 'Failed to connect sheet', detail: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE — disconnect Google Sheet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params
    const token = extractTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Auth required' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const form = await prisma.universalForm.findFirst({
      where: { id: formId, userId: payload.userId },
    })
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

    const currentSettings = (form.settings as any) || {}
    const { googleSheetId, ...rest } = currentSettings

    await prisma.universalForm.update({
      where: { id: formId },
      data: { settings: rest },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[GoogleSheets] DELETE error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
