import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, description, settings } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50)

    // Ensure slug is unique
    let finalSlug = slug
    let counter = 1
    while (await prisma.universalForm.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    const form = await prisma.universalForm.create({
      data: {
        userId: user.id,
        title,
        slug: finalSlug,
        description: description || null,
        settings: settings || null,
      },
      include: {
        sections: {
          include: {
            fields: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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

    const forms = await prisma.universalForm.findMany({
      where: { userId: user.id },
      include: {
        sections: {
          include: {
            fields: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}