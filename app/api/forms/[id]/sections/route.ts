import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = extractTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formId = params.id
    const body = await request.json()
    const { title, description, conditional } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Check if form exists and belongs to user
    const form = await prisma.universalForm.findFirst({
      where: { id: formId, userId: user.id }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found or access denied' }, { status: 404 })
    }

    // Get the next order number
    const lastSection = await prisma.formSection.findFirst({
      where: { formId },
      orderBy: { order: 'desc' }
    })

    const order = lastSection ? lastSection.order + 1 : 1

    const section = await prisma.formSection.create({
      data: {
        formId,
        title,
        description: description || null,
        order,
        conditional: conditional || null,
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating section:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}
