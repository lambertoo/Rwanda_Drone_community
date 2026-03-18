import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const condition = searchParams.get('condition')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const myListings = searchParams.get('my') === 'true'

    const user = myListings ? await getCurrentUser() : null

    const listings = await prisma.marketplaceListing.findMany({
      where: {
        status: myListings ? undefined : 'active',
        ...(myListings && user ? { sellerId: user.id } : {}),
        ...(category ? { category } : {}),
        ...(condition ? { condition } : {}),
        ...(minPrice ? { price: { gte: parseFloat(minPrice) } } : {}),
        ...(maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, description, category, condition, price, currency, negotiable, location, images } = body

    if (!title || !description || !category || !condition || !price) {
      return NextResponse.json(
        { error: 'Title, description, category, condition, price required' },
        { status: 400 }
      )
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const listing = await prisma.marketplaceListing.create({
      data: {
        sellerId: user.id,
        title,
        description,
        category,
        condition,
        price: parseFloat(price),
        currency: currency || 'RWF',
        negotiable: negotiable || false,
        location: location || undefined,
        images: images || [],
        expiresAt,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
