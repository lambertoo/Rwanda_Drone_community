import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const permits = await prisma.permit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ permits })
  } catch (error) {
    console.error('Error fetching permits:', error)
    return NextResponse.json({ error: 'Failed to fetch permits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { type, authority, referenceNumber, issuedDate, expiryDate, documentUrl, notes } = body

    if (!type) {
      return NextResponse.json({ error: 'Permit type is required' }, { status: 400 })
    }

    const permit = await prisma.permit.create({
      data: {
        userId: user.id,
        type,
        authority: authority || 'Rwanda CAA',
        referenceNumber: referenceNumber || null,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        documentUrl: documentUrl || null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ permit }, { status: 201 })
  } catch (error) {
    console.error('Error creating permit:', error)
    return NextResponse.json({ error: 'Failed to create permit' }, { status: 500 })
  }
}
