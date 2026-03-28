import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const existing = await prisma.listingSave.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: id,
        },
      },
    })

    if (existing) {
      await prisma.listingSave.delete({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: id,
          },
        },
      })

      await prisma.marketplaceListing.update({
        where: { id },
        data: { saves: { decrement: 1 } },
      })

      return NextResponse.json({ saved: false, message: 'Listing unsaved' })
    } else {
      await prisma.listingSave.create({
        data: {
          userId: user.id,
          listingId: id,
        },
      })

      await prisma.marketplaceListing.update({
        where: { id },
        data: { saves: { increment: 1 } },
      })

      return NextResponse.json({ saved: true, message: 'Listing saved' })
    }
  } catch (error) {
    console.error('Error saving/unsaving listing:', error)
    return NextResponse.json({ error: 'Failed to toggle save' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ saved: false })

    const existing = await prisma.listingSave.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: id,
        },
      },
    })

    return NextResponse.json({ saved: !!existing })
  } catch (error) {
    console.error('Error checking save status:', error)
    return NextResponse.json({ error: 'Failed to check save status' }, { status: 500 })
  }
}
