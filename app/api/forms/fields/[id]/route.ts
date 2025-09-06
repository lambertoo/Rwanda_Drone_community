import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function PUT(
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

    const fieldId = params.id
    const body = await request.json()
    const { 
      type, 
      label, 
      name, 
      placeholder, 
      options, 
      validation, 
      order, 
      conditional, 
      isActive 
    } = body

    // Check if field exists and belongs to user's form
    const existingField = await prisma.formField.findFirst({
      where: { 
        id: fieldId,
        section: { form: { userId: user.id } }
      }
    })

    if (!existingField) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 })
    }

    // If name is being changed, check if new name is unique within the form
    if (name && name !== existingField.name) {
      const duplicateField = await prisma.formField.findFirst({
        where: {
          name,
          section: { formId: existingField.section.formId },
          id: { not: fieldId }
        }
      })

      if (duplicateField) {
        return NextResponse.json({ 
          error: 'Field name must be unique within the form' 
        }, { status: 400 })
      }
    }

    const field = await prisma.formField.update({
      where: { id: fieldId },
      data: {
        type: type || existingField.type,
        label: label || existingField.label,
        name: name || existingField.name,
        placeholder: placeholder !== undefined ? placeholder : existingField.placeholder,
        options: options !== undefined ? options : existingField.options,
        validation: validation !== undefined ? validation : existingField.validation,
        order: order !== undefined ? order : existingField.order,
        conditional: conditional !== undefined ? conditional : existingField.conditional,
        isActive: isActive !== undefined ? isActive : existingField.isActive,
      }
    })

    return NextResponse.json(field)
  } catch (error) {
    console.error('Error updating field:', error)
    return NextResponse.json({ error: 'Failed to update field' }, { status: 500 })
  }
}

export async function DELETE(
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

    const fieldId = params.id

    // Check if field exists and belongs to user's form
    const existingField = await prisma.formField.findFirst({
      where: { 
        id: fieldId,
        section: { form: { userId: user.id } }
      }
    })

    if (!existingField) {
      return NextResponse.json({ error: 'Field not found or access denied' }, { status: 404 })
    }

    await prisma.formField.delete({
      where: { id: fieldId }
    })

    return NextResponse.json({ message: 'Field deleted successfully' })
  } catch (error) {
    console.error('Error deleting field:', error)
    return NextResponse.json({ error: 'Failed to delete field' }, { status: 500 })
  }
}
