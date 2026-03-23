import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

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

    const formSettings = form.settings as any

    if (!form.isActive || !form.isPublic) {
      return NextResponse.json({
        error: formSettings?.closedMessage || 'This form is no longer accepting responses.',
      }, { status: 403 })
    }

    // Enforce close date
    if (formSettings?.closeDate) {
      const closeDate = new Date(formSettings.closeDate)
      if (Date.now() > closeDate.getTime()) {
        return NextResponse.json({
          error: formSettings?.closedMessage || 'This form has been closed.',
        }, { status: 403 })
      }
    }

    // Enforce max responses
    if (formSettings?.maxResponses) {
      const count = await prisma.formEntry.count({ where: { formId } })
      if (count >= formSettings.maxResponses) {
        return NextResponse.json({
          error: formSettings?.closedMessage || 'This form has reached its maximum number of responses.',
        }, { status: 403 })
      }
    }
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

    const editToken = crypto.randomBytes(24).toString('hex')

    // Determine initial status: if form has approval workflow, set to pending_review
    const needsApproval = formSettings?.requireApproval === true

    const submission = await prisma.formEntry.create({
      data: {
        formId,
        editToken,
        status: needsApproval ? 'pending_review' : 'submitted',
        meta: {
          ip,
          submittedAt: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || null,
          referrer: request.headers.get('referer') || null,
        },
        values: { create: allFieldValues },
      },
    })

    // Send notification emails (non-blocking)
    if (formSettings?.notifyEmails) {
      const emails = formSettings.notifyEmails.split(',').map((e: string) => e.trim()).filter(Boolean)
      const summaryHtml = allFieldValues
        .map((v) => {
          const field = formWithFields.sections.flatMap(s => s.fields).find(f => f.id === v.fieldId)
          return `<tr><td style="padding:4px 8px;font-weight:600;vertical-align:top;">${field?.label || ''}</td><td style="padding:4px 8px;">${v.value || '—'}</td></tr>`
        })
        .join('')

      for (const email of emails) {
        sendEmail({
          to: email,
          subject: `New response: ${formWithFields.title}`,
          html: `<p>A new response was submitted to <strong>${formWithFields.title}</strong>.</p><table style="border-collapse:collapse;margin-top:12px;">${summaryHtml}</table>`,
        }).catch((err) => console.error('[FormSubmit] Notification email failed:', err))
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      editToken,
      message: 'Form submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}
