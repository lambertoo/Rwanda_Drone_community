import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt-utils'
import { sendEmail } from '@/lib/email'

// PATCH — update submission status (approve/reject/request revision)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const { id: formId, entryId } = await params
    const token = request.cookies.get('accessToken')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    const body = await request.json()
    const { status, comment } = body

    const validStatuses = ['approved', 'rejected', 'revision_requested', 'pending_review']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Verify form ownership
    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      select: { id: true, userId: true, title: true },
    })

    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    if (form.userId !== payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    // Update entry status
    const entry = await prisma.formEntry.update({
      where: { id: entryId, formId },
      data: {
        status,
        reviewerId: payload.userId,
        reviewComment: comment || null,
        reviewedAt: new Date(),
      },
    })

    // Send notification email to submitter if they provided email
    const emailValue = await prisma.formValue.findFirst({
      where: {
        entryId,
        field: { type: 'EMAIL' },
      },
    })

    if (emailValue?.value) {
      const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'needs revision'
      sendEmail({
        to: emailValue.value,
        subject: `Your submission to "${form.title}" has been ${statusText}`,
        html: `
          <p>Your submission to <strong>${form.title}</strong> has been <strong>${statusText}</strong>.</p>
          ${comment ? `<p><strong>Reviewer comment:</strong> ${comment}</p>` : ''}
          ${entry.editToken && status === 'revision_requested'
            ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/forms/edit/${entry.editToken}">Click here to edit your submission</a></p>`
            : ''
          }
        `,
      }).catch((err) => console.error('[Approval] Email failed:', err))
    }

    return NextResponse.json({ success: true, status: entry.status })
  } catch (error) {
    console.error('Error updating submission status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
