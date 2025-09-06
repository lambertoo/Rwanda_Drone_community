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

    if (!form.isActive || !form.isPublic) {
      return NextResponse.json({ error: 'Form is not available' }, { status: 403 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error fetching public form:', error)
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
  }
}
