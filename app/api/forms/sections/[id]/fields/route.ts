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

    const sectionId = params.id
    const body = await request.json()
    const { 
      type, 
      label, 
      name, 
      placeholder, 
      options, 
      validation, 
      conditional 
    } = body

    if (!type || !label || !name) {
      return NextResponse.json({ 
        error: 'Type, label, and name are required' 
      }, { status: 400 })
    }

    // Check if section exists and belongs to user's form
    const section = await prisma.formSection.findFirst({
      where: { 
        id: sectionId,
        form: { userId: user.id }
      }
    })

    if (!section) {
      return NextResponse.json({ error: 'Section not found or access denied' }, { status: 404 })
    }

    // Check if field name is unique within the form
    const existingField = await prisma.formField.findFirst({
      where: {
        name,
        section: { formId: section.formId }
      }
    })

    if (existingField) {
      return NextResponse.json({ 
        error: 'Field name must be unique within the form' 
      }, { status: 400 })
    }

    // Get the next order number
    const lastField = await prisma.formField.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' }
    })

    const order = lastField ? lastField.order + 1 : 1

    const field = await prisma.formField.create({
      data: {
        sectionId,
        type,
        label,
        name,
        placeholder: placeholder || null,
        options: options || null,
        validation: validation || null,
        order,
        conditional: conditional || null,
      }
    })

    return NextResponse.json(field)
  } catch (error) {
    console.error('Error creating field:', error)
    return NextResponse.json({ error: 'Failed to create field' }, { status: 500 })
  }
}
