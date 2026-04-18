import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { appendSubmissionToSheet, hasGoogleSheetsAuth, UserGoogleTokens } from '@/lib/google-sheets'
import { sanitizeSubmission, MAX_BODY_BYTES } from '@/lib/form-sanitize'
import crypto from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params

    // Reject oversized payloads before parsing — shields us from memory DOS
    // attempts and from outsized file-URL lists.
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Submission is too large' }, { status: 413 })
    }

    const body = await request.json()

    // Check if form exists and is active
    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      select: {
        id: true, isActive: true, isPublic: true, settings: true, userId: true,
        user: { select: { id: true, googleAccessToken: true, googleRefreshToken: true, googleTokenExpiry: true } },
      },
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

    // Flatten fields for sanitisation and build values. sanitizeSubmission
    // strips HTML from every text input, clamps length limits, enforces
    // option-set membership on choice fields, and validates numeric / email
    // / URL / phone types. Anything that fails returns a 400 with a friendly
    // message so the respondent can fix it.
    const flatFields = formWithFields.sections.flatMap((s) => s.fields)
    const sanitisation = sanitizeSubmission(flatFields, body)
    if (sanitisation.error) {
      return NextResponse.json(
        { error: sanitisation.error, field: sanitisation.field },
        { status: 400 },
      )
    }
    const allFieldValues = sanitisation.values!

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Access control: IP allow-list
    if (Array.isArray(formSettings?.allowedIPs) && formSettings.allowedIPs.length > 0) {
      if (!formSettings.allowedIPs.includes(ip)) {
        return NextResponse.json({ error: 'Access denied for your network.' }, { status: 403 })
      }
    }
    // Access control: password gate
    if (formSettings?.passwordProtect) {
      if (body?._password !== formSettings.passwordProtect) {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 403 })
      }
    }
    // CAPTCHA gate (token validation left to integrator; here we just require the flag)
    if (formSettings?.requireCaptcha && !body?._captchaToken) {
      return NextResponse.json({ error: 'CAPTCHA challenge failed.' }, { status: 403 })
    }

    // Quiz scoring: sum points for each field whose submitted value matches its correctAnswer.
    let quizScore: number | undefined
    let quizMax: number | undefined
    if (formSettings?.quizMode) {
      let total = 0
      let max = 0
      for (const section of formWithFields.sections) {
        for (const field of section.fields) {
          const v: any = (field.validation as any) || {}
          const pts = Number(v.points ?? 1)
          const correct = v.correctAnswer
          if (correct === undefined || correct === null || correct === '') continue
          max += pts
          const answer = body[field.name]
          const match =
            Array.isArray(correct)
              ? Array.isArray(answer) && correct.every(c => (answer as any[]).includes(c)) && (answer as any[]).length === correct.length
              : String(answer ?? '') === String(correct)
          if (match) total += pts
        }
      }
      quizScore = total
      quizMax = max
    }

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
          ...(quizScore !== undefined ? { quizScore, quizMax } : {}),
        },
        values: { create: allFieldValues },
      },
    })

    // Sync to Google Sheet (non-blocking) — uses form owner's Google tokens
    if (formSettings?.googleSheetId && form.user && hasGoogleSheetsAuth(form.user)) {
      const ownerTokens: UserGoogleTokens = {
        accessToken: form.user.googleAccessToken!,
        refreshToken: form.user.googleRefreshToken!,
        tokenExpiry: form.user.googleTokenExpiry,
        userId: form.user.id,
      }
      const allFields = formWithFields.sections.flatMap(s => s.fields)
      const valuesMap: Record<string, string | null> = {}
      allFields.forEach((field) => {
        const fv = allFieldValues.find(v => v.fieldId === field.id)
        valuesMap[field.name] = fv?.value ?? null
      })
      const entryCount = await prisma.formEntry.count({ where: { formId } })
      appendSubmissionToSheet(
        ownerTokens,
        formSettings.googleSheetId,
        entryCount,
        new Date().toISOString(),
        allFields.map(f => ({ label: f.label, name: f.name })),
        valuesMap
      ).catch((err) => console.error('[FormSubmit] Google Sheets sync failed:', err))
    }

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

    // Optional summary email to the applicant themselves. Triggered when either
    // the form settings have emailSummaryToApplicant on, or the payload carries
    // the _emailSummary flag from the renderer's opt-in.
    if (formSettings?.emailSummaryToApplicant || body?._emailSummary) {
      // Find the applicant's email: prefer a configured emailField in settings,
      // otherwise the first EMAIL-typed field with a non-empty value.
      const allFields = formWithFields.sections.flatMap(s => s.fields)
      let applicantEmail: string | null = null
      const configuredFieldName = formSettings?.applicantEmailField
      if (configuredFieldName) {
        const v = allFieldValues.find(x => {
          const f = allFields.find(ff => ff.id === x.fieldId)
          return f?.name === configuredFieldName
        })
        if (v?.value) applicantEmail = String(v.value)
      }
      if (!applicantEmail) {
        for (const f of allFields) {
          if (f.type !== 'EMAIL') continue
          const v = allFieldValues.find(x => x.fieldId === f.id)
          if (v?.value) { applicantEmail = String(v.value); break }
        }
      }

      if (applicantEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)) {
        const applicantSummaryHtml = allFieldValues
          .map((v) => {
            const field = allFields.find(f => f.id === v.fieldId)
            return `<tr><td style="padding:4px 8px;font-weight:600;vertical-align:top;background:#f8fafc;border:1px solid #e2e8f0;">${field?.label || ''}</td><td style="padding:4px 8px;border:1px solid #e2e8f0;">${v.value || '—'}</td></tr>`
          })
          .join('')
        const heading = `<h2 style="margin:0 0 8px;font-size:20px;color:#0f172a;">${formWithFields.title}</h2>`
        const body = `
          <p style="color:#475569;font-size:15px;line-height:1.6;">Thank you — here is a copy of the answers you just submitted.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px;">${applicantSummaryHtml}</table>
          <p style="color:#94a3b8;font-size:13px;margin-top:16px;">Keep this email for your records.</p>
        `
        sendEmail({
          to: applicantEmail,
          subject: `Your response: ${formWithFields.title}`,
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:20px;">${heading}${body}</div>`,
        }).catch((err) => console.error('[FormSubmit] Applicant summary email failed:', err))
      }
    }

    // Outbound webhooks (non-blocking). Each URL in settings.webhooks receives
    // the full submission payload so admins can pipe into Zapier, Make, Slack,
    // internal services, etc.
    if (Array.isArray(formSettings?.webhooks) && formSettings.webhooks.length > 0) {
      const payload = {
        event: 'form.submission',
        formId,
        formTitle: formWithFields.title,
        submissionId: submission.id,
        submittedAt: new Date().toISOString(),
        values: Object.fromEntries(
          allFieldValues.map(v => {
            const f = formWithFields.sections.flatMap(s => s.fields).find(ff => ff.id === v.fieldId)
            return [f?.name || v.fieldId, v.value]
          }),
        ),
      }
      for (const url of formSettings.webhooks as string[]) {
        if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) continue
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-UAVRW-Event': 'form.submission' },
          body: JSON.stringify(payload),
        }).catch(err => console.error('[FormSubmit] Webhook failed:', url, err))
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
