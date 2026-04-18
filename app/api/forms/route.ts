import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'
import { sanitizeFormStructure } from '@/lib/form-sanitize'

export async function POST(request: NextRequest) {
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

    console.log('JWT Payload:', payload)
    console.log('User ID from payload:', payload.userId)

    const rawBody = await request.json()
    const body = sanitizeFormStructure(rawBody)
    const { title, description, settings, sections } = body

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
        userId: payload.userId,
        title,
        slug: finalSlug,
        description: description || null,
        settings: settings || null,
        sections: {
          create: (sections || []).map((section: any, sectionIndex: number) => ({
            title: section.title,
            description: section.description || null,
            order: sectionIndex + 1,
            actions: section.actions || null,
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
                actions: field.actions || null,
                order: fieldIndex + 1,
                // Matrix field properties
                matrixRows: field.matrixRows || null,
                matrixColumns: field.matrixColumns || null,
                matrixType: field.matrixType || null,
                // Linear scale properties
                scaleStart: field.scaleStart || null,
                scaleEnd: field.scaleEnd || null,
                scaleStep: field.scaleStep || null,
                leftLabel: field.leftLabel || null,
                centerLabel: field.centerLabel || null,
                rightLabel: field.rightLabel || null,
              }))
            }
          }))
        }
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

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Include forms the user has accepted collaboration on, not just ones
    // they own. This is what makes invited edits actually discoverable from
    // the "My forms" listing.
    const collabRows = await prisma.contentCollaborator.findMany({
      where: {
        contentType: 'FORM',
        collaboratorUserId: payload.userId,
        status: 'ACCEPTED',
      },
      select: { contentId: true },
    })
    const collabFormIds = collabRows.map(r => r.contentId)

    const forms = await prisma.universalForm.findMany({
      where: {
        OR: [
          { userId: payload.userId },
          ...(collabFormIds.length > 0 ? [{ id: { in: collabFormIds } }] : []),
        ],
      },
      include: {
        sections: {
          include: {
            fields: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        user: { select: { id: true, username: true, fullName: true, avatar: true } },
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Tag each form with whether the caller owns it or is a collaborator,
    // so the UI can distinguish them in the list.
    const withRole = forms.map(f => ({
      ...f,
      _role: f.userId === payload.userId ? 'owner' : 'collaborator',
    }))

    return NextResponse.json(withRole)
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
  }
}