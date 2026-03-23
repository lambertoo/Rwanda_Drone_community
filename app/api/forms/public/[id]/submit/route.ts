import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id
    const body = await request.json()

    // Check if form exists and is active
    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      select: { id: true, isActive: true, isPublic: true, settings: true },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (!form.isActive || !form.isPublic) {
      return NextResponse.json({ error: 'Form is not available for submissions' }, { status: 403 })
    }

    // Enforce allowMultipleSubmissions setting
    const formSettings = form.settings as any
    if (formSettings?.allowMultipleSubmissions === false) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'

      const existingEntry = await prisma.formEntry.findFirst({
        where: {
          formId,
          meta: { path: ['ip'], equals: ip },
        },
      })

      if (existingEntry) {
        return NextResponse.json(
          { error: 'You have already submitted this form. Multiple submissions are not allowed.' },
          { status: 409 }
        )
      }
    }

    // Get form fields to map field names to field IDs
    const formWithFields = await prisma.universalForm.findUnique({
      where: { id: formId },
      include: { sections: { include: { fields: true } } },
    })

    if (!formWithFields) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Build field values — store null for unanswered fields
    const allFieldValues: { fieldId: string; value: string | null }[] = []

    formWithFields.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const submittedValue = body[field.name]
        let stored: string | null = null

        if (submittedValue !== undefined && submittedValue !== null && submittedValue !== '') {
          stored = typeof submittedValue === 'string' ? submittedValue : JSON.stringify(submittedValue)
        }

        allFieldValues.push({ fieldId: field.id, value: stored })
      })
    })

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const submission = await prisma.formEntry.create({
      data: {
        formId,
        meta: {
          ip,
          submittedAt: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || null,
          referrer: request.headers.get('referer') || null,
        },
        values: { create: allFieldValues },
      },
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Form submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}
