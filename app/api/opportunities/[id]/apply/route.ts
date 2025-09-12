import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { getSession } from "@/lib/auth"

// POST - Submit an application for an opportunity
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
    const { formId, fieldSubmissions } = body

    // Check if opportunity exists and has an application form
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        registrationForm: {
          include: {
            sections: {
              include: {
                fields: true
              }
            }
          }
        }
      }
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    if (!opportunity.registrationForm) {
      return NextResponse.json(
        { error: 'This opportunity does not have an application form' },
        { status: 400 }
      )
    }

    // Check if user has already applied
    const existingApplication = await prisma.applicationSubmission.findFirst({
      where: {
        formId: opportunity.registrationForm.id,
        applicantId: session.user.id
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this opportunity' },
        { status: 400 }
      )
    }

    // Create the application submission
    const submission = await prisma.applicationSubmission.create({
      data: {
        formId: opportunity.registrationForm.id,
        applicantId: session.user.id,
        fieldSubmissions: {
          create: fieldSubmissions.map((fieldSub: any) => ({
            fieldId: fieldSub.fieldId,
            value: fieldSub.value
          }))
        }
      },
      include: {
        fieldSubmissions: {
          include: {
            field: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      submission,
      message: 'Application submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

// GET - Get user's application for an opportunity
export async function GET(
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

    // Check if opportunity exists and has an application form
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        registrationForm: {
          include: {
            sections: {
              include: {
                fields: true
              }
            }
          }
        }
      }
    })

    if (!opportunity || !opportunity.registrationForm) {
      return NextResponse.json(
        { error: 'Application form not found' },
        { status: 404 }
      )
    }

    // Get user's application if it exists
    const application = await prisma.applicationSubmission.findFirst({
      where: {
        formId: opportunity.registrationForm.id,
        applicantId: session.user.id
      },
      include: {
        fieldSubmissions: {
          include: {
            field: true
          }
        }
      }
    })

    return NextResponse.json({
      hasApplied: !!application,
      application: application || null,
      form: opportunity.registrationForm
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
} 