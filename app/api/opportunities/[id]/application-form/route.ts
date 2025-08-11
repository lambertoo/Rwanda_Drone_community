import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth"

// GET - Get application form for an opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunityId = params.id

    const form = await prisma.applicationForm.findUnique({
      where: { opportunityId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
          include: {
            conditions: true
          }
        }
      }
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Application form not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error fetching application form:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application form' },
      { status: 500 }
    )
  }
}

// POST - Create or update application form for an opportunity
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(cookies())
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const opportunityId = params.id
    const body = await request.json()
    const { title, description, fields } = body

    // Check if user is the creator of the opportunity
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { posterId: true }
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (opportunity.posterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the opportunity creator can manage the application form' },
        { status: 403 }
      )
    }

    // Check if form already exists
    const existingForm = await prisma.applicationForm.findUnique({
      where: { opportunityId }
    })

    if (existingForm) {
      // Update existing form
      const updatedForm = await prisma.applicationForm.update({
        where: { id: existingForm.id },
        data: {
          title: title || existingForm.title,
          description: description || existingForm.description,
          fields: {
            deleteMany: {},
            create: fields.map((field: any, index: number) => ({
              label: field.label,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required || false,
              options: field.options || null,
              validation: field.validation || null,
              order: index,
              conditions: {
                create: (field.conditions || []).map((condition: any) => ({
                  targetFieldId: condition.targetFieldId,
                  operator: condition.operator,
                  value: condition.value,
                  action: condition.action
                }))
              }
            }))
          }
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
            include: {
              conditions: true
            }
          }
        }
      })

      return NextResponse.json(updatedForm)
    } else {
      // Create new form
      const newForm = await prisma.applicationForm.create({
        data: {
          opportunityId,
          creatorId: session.user.id,
          title: title || 'Application Form',
          description: description || null,
          fields: {
            create: fields.map((field: any, index: number) => ({
              label: field.label,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required || false,
              options: field.options || null,
              validation: field.validation || null,
              order: index,
              conditions: {
                create: (field.conditions || []).map((condition: any) => ({
                  targetFieldId: condition.targetFieldId,
                  operator: condition.operator,
                  value: condition.value,
                  action: condition.action
                }))
              }
            }))
          }
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
            include: {
              conditions: true
            }
          }
        }
      })

      return NextResponse.json(newForm)
    }
  } catch (error) {
    console.error('Error managing application form:', error)
    return NextResponse.json(
      { error: 'Failed to manage application form' },
      { status: 500 }
    )
  }
} 