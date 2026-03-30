import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'
import {
  createSheetForForm,
  syncAllSubmissionsToSheet,
  isGoogleSheetsConfigured,
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

    const form = await prisma.universalForm.findFirst({
      where: { id: formId, userId: payload.userId },
      select: { settings: true },
    })
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })

    const settings = form.settings as any
    return NextResponse.json({
      configured: isGoogleSheetsConfigured(),
      connected: !!settings?.googleSheetId,
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

    if (!isGoogleSheetsConfigured()) {
      return NextResponse.json(
        { error: 'Google Sheets not configured. Add GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY.' },
        { status: 400 }
      )
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
      spreadsheetId = await createSheetForForm(form.title, fieldLabels) ?? undefined
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
    console.error('[GoogleSheets] POST stack:', error?.stack)
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
