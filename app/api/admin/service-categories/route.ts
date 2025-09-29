import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const categories = await prisma.serviceCategory.findMany({
      include: {
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Service categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 })
    }

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Service category created successfully',
      category 
    })

  } catch (error) {
    console.error('Create service category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
