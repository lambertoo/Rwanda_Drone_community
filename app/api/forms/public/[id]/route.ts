import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id

    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      include: {
        sections: {
          where: { isActive: true },
          include: {
            fields: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const formSettings = form.settings as any
    let isClosed = !form.isActive || !form.isPublic
    let closedReason = formSettings?.closedMessage || 'This form is no longer accepting responses.'

    // Check close date
    if (!isClosed && formSettings?.closeDate) {
      if (Date.now() > new Date(formSettings.closeDate).getTime()) {
        isClosed = true
        closedReason = formSettings?.closedMessage || 'This form has been closed.'
      }
    }

    // Check max responses
    if (!isClosed && formSettings?.maxResponses) {
      const count = await prisma.formEntry.count({ where: { formId } })
      if (count >= formSettings.maxResponses) {
        isClosed = true
        closedReason = formSettings?.closedMessage || 'This form has reached its maximum number of responses.'
      }
    }

    return NextResponse.json({ ...form, isClosed, closedReason })
  } catch (error) {
    console.error('Error fetching public form:', error)
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
  }
}
