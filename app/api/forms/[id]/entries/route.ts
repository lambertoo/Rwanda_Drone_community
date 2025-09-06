import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function GET(
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

    // Check if form exists and belongs to user
    const form = await prisma.universalForm.findFirst({
      where: { id: formId, userId: user.id }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found or access denied' }, { status: 404 })
    }

    const entries = await prisma.formEntry.findMany({
      where: { formId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        values: {
          include: {
            field: {
              select: {
                id: true,
                label: true,
                name: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching form entries:', error)
    return NextResponse.json({ error: 'Failed to fetch form entries' }, { status: 500 })
  }
}
