import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Verify authentication
    const token = request.cookies.get('accessToken')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formId = id

    // Check if form exists and user owns it
    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      select: { id: true, userId: true }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (form.userId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if includeValues query parameter is present
    const url = new URL(request.url)
    const includeValues = url.searchParams.get('includeValues') === 'true'

    // Fetch form submissions
    const submissions = await prisma.formEntry.findMany({
      where: { formId: formId },
      orderBy: { createdAt: 'desc' },
      include: includeValues ? {
        values: {
          include: {
            field: {
              select: {
                id: true,
                label: true,
                type: true,
                name: true,
                options: true,
                matrixRows: true,
                matrixColumns: true,
                matrixType: true,
                scaleStart: true,
                scaleEnd: true,
                scaleStep: true,
                leftLabel: true,
                centerLabel: true,
                rightLabel: true
              }
            }
          }
        }
      } : undefined
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching form submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

// DELETE /api/forms/[id]/submissions — delete one or more submissions
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.cookies.get('accessToken')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const formId = id
    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      select: { id: true, userId: true },
    })

    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    if (form.userId !== payload.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const body = await request.json()
    const { submissionIds } = body

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json({ error: 'submissionIds array is required' }, { status: 400 })
    }

    // Delete values first (cascade should handle but be safe)
    await prisma.formValue.deleteMany({
      where: { entryId: { in: submissionIds }, entry: { formId } },
    })

    const result = await prisma.formEntry.deleteMany({
      where: { id: { in: submissionIds }, formId },
    })

    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error) {
    console.error('Error deleting submissions:', error)
    return NextResponse.json({ error: 'Failed to delete submissions' }, { status: 500 })
  }
}
