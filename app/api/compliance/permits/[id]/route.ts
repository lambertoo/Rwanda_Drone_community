import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const permit = await prisma.permit.findUnique({ where: { id } })
    if (!permit) return NextResponse.json({ error: 'Permit not found' }, { status: 404 })
    if (permit.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ permit })
  } catch (error) {
    console.error('Error fetching permit:', error)
    return NextResponse.json({ error: 'Failed to fetch permit' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await prisma.permit.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Permit not found' }, { status: 404 })
    if (existing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, authority, referenceNumber, issuedDate, expiryDate, documentUrl, notes, status } =
      body

    const permit = await prisma.permit.update({
      where: { id },
      data: {
        type: type || existing.type,
        authority: authority !== undefined ? authority : existing.authority,
        referenceNumber:
          referenceNumber !== undefined ? referenceNumber : existing.referenceNumber,
        issuedDate: issuedDate ? new Date(issuedDate) : existing.issuedDate,
        expiryDate: expiryDate ? new Date(expiryDate) : existing.expiryDate,
        documentUrl: documentUrl !== undefined ? documentUrl : existing.documentUrl,
        notes: notes !== undefined ? notes : existing.notes,
        status: status || existing.status,
      },
    })

    return NextResponse.json({ permit })
  } catch (error) {
    console.error('Error updating permit:', error)
    return NextResponse.json({ error: 'Failed to update permit' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await prisma.permit.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Permit not found' }, { status: 404 })
    if (existing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.permit.delete({ where: { id } })

    return NextResponse.json({ message: 'Permit deleted successfully' })
  } catch (error) {
    console.error('Error deleting permit:', error)
    return NextResponse.json({ error: 'Failed to delete permit' }, { status: 500 })
  }
}
