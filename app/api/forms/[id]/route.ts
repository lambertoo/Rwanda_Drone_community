import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id

    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      include: {
        sections: {
          include: {
            fields: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        },
        _count: {
          select: { entries: true }
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error fetching form:', error)
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 })
  }
}

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

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formId = params.id
    const body = await request.json()
    const { title, description, settings, allowSubmissions, sections, isActive, isPublic } = body

    // Check if form exists and belongs to user
    const existingForm = await prisma.universalForm.findFirst({
      where: { id: formId, userId: payload.userId }
    })

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found or access denied' }, { status: 404 })
    }

    // Merge allowSubmissions into settings
    const currentSettings = existingForm.settings as any || {}
    const updatedSettings = {
      ...currentSettings,
      ...(settings || {}),
      ...(allowSubmissions !== undefined ? { allowSubmissions } : {})
    }

    // If sections are provided, delete existing sections and create new ones
    if (sections) {
      // Delete existing sections and fields
      await prisma.formField.deleteMany({
        where: {
          section: {
            formId: formId
          }
        }
      })
      await prisma.formSection.deleteMany({
        where: { formId: formId }
      })
    }

    const form = await prisma.universalForm.update({
      where: { id: formId },
      data: {
        title: title || existingForm.title,
        description: description !== undefined ? description : existingForm.description,
        settings: updatedSettings,
        isActive: isActive !== undefined ? isActive : existingForm.isActive,
        isPublic: isPublic !== undefined ? isPublic : existingForm.isPublic,
        ...(sections && {
          sections: {
            create: sections.map((section: any, sectionIndex: number) => ({
              title: section.title,
              description: section.description || null,
              order: sectionIndex + 1,
              fields: {
                create: (section.fields || []).map((field: any, fieldIndex: number) => ({
                  label: field.label,
                  name: field.name || `field_${Date.now()}_${fieldIndex}`,
                  type: field.type,
                  placeholder: field.placeholder || null,
                  options: field.options || null,
                  validation: {
                    required: field.required || false,
                    ...(field.validation || {})
                  },
                  conditional: field.conditional || null,
                  order: fieldIndex + 1,
                }))
              }
            }))
          }
        })
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
    console.error('Error updating form:', error)
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
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

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formId = params.id

    // Check if form exists and belongs to user
    const existingForm = await prisma.universalForm.findFirst({
      where: { id: formId, userId: payload.userId }
    })

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found or access denied' }, { status: 404 })
    }

    await prisma.universalForm.delete({
      where: { id: formId }
    })

    return NextResponse.json({ message: 'Form deleted successfully' })
  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }
}
