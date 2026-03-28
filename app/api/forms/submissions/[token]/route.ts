import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — load submission by edit token (for editing)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const entry = await prisma.formEntry.findUnique({
      where: { editToken: token },
      include: {
        form: {
          include: {
            sections: {
              where: { isActive: true },
              include: { fields: { where: { isActive: true }, orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' },
            },
          },
        },
        values: { include: { field: true } },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Build existing values map
    const existingValues: Record<string, string> = {}
    entry.values.forEach((v) => {
      if (v.value) existingValues[v.field.name] = v.value
    })

    return NextResponse.json({
      form: entry.form,
      values: existingValues,
      submissionId: entry.id,
      status: entry.status,
    })
  } catch (error) {
    console.error('Error loading submission:', error)
    return NextResponse.json({ error: 'Failed to load submission' }, { status: 500 })
  }
}

// PUT — update submission by edit token
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    const entry = await prisma.formEntry.findUnique({
      where: { editToken: token },
      include: {
        form: { include: { sections: { include: { fields: true } } } },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Delete old values and create new ones
    await prisma.formValue.deleteMany({ where: { entryId: entry.id } })

    const allFieldValues: { fieldId: string; value: string | null }[] = []
    entry.form.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const val = body[field.name]
        let stored: string | null = null
        if (val !== undefined && val !== null && val !== '') {
          stored = typeof val === 'string' ? val : JSON.stringify(val)
        }
        allFieldValues.push({ fieldId: field.id, value: stored })
      })
    })

    await prisma.formEntry.update({
      where: { id: entry.id },
      data: {
        values: { create: allFieldValues },
        meta: {
          ...(entry.meta as any),
          lastEditedAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({ success: true, message: 'Submission updated' })
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}
