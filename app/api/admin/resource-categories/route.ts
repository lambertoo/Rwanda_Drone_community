import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const categories = await prisma.resourceCategory.findMany({
      include: {
        _count: {
          select: {
            resources: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Resource categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    let body: { name?: unknown; description?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const name = body.name
    const description = body.description

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const descriptionValue = description != null ? String(description).trim() || null : null

    try {
      const category = await prisma.resourceCategory.create({
        data: {
          name: name.trim(),
          description: descriptionValue
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Resource category created successfully',
        category 
      })
    } catch (createError: unknown) {
      const err = createError as { code?: string; message?: string }
      console.error('Create resource category error:', err)
      // Prisma unique constraint (name already exists)
      if (err?.code === 'P2002') {
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 })
      }
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { error: 'Internal server error', detail: err?.message ?? String(createError) },
          { status: 500 }
        )
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  } catch (error) {
    const err = error as Error
    console.error('Create resource category error:', err)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: 'Internal server error', detail: err?.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
