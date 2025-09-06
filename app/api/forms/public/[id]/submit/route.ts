import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id
    
    // Check content type to determine how to parse the body
    const contentType = request.headers.get('content-type') || ''
    let body: any

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (file uploads)
      const formData = await request.formData()
      body = {}
      
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Handle file uploads - store file info
          body[key] = {
            name: value.name,
            size: value.size,
            type: value.type,
            uploaded: true
          }
        } else {
          // Handle other form data
          try {
            // Try to parse as JSON (for arrays)
            body[key] = JSON.parse(value as string)
          } catch {
            // If not JSON, store as string
            body[key] = value as string
          }
        }
      }
    } else {
      // Handle JSON data
      body = await request.json()
    }

    // Check if form exists and is public
    const form = await prisma.universalForm.findUnique({
      where: { id: formId },
      select: { id: true, isActive: true, isPublic: true }
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (!form.isActive || !form.isPublic) {
      return NextResponse.json({ error: 'Form is not available for submissions' }, { status: 403 })
    }

    // Get form fields to map field names to field IDs
    const formWithFields = await prisma.universalForm.findUnique({
      where: { id: formId },
      include: {
        sections: {
          include: {
            fields: true
          }
        }
      }
    })

    if (!formWithFields) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Create a map of field names to field IDs
    const fieldMap = new Map()
    formWithFields.sections.forEach(section => {
      section.fields.forEach(field => {
        fieldMap.set(field.name, field.id)
      })
    })

    // Create form submission
    const submission = await prisma.formEntry.create({
      data: {
        formId: formId,
        meta: {
          submittedAt: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || null,
          referrer: request.headers.get('referer') || null
        },
        values: {
          create: Object.entries(body)
            .filter(([key, value]) => fieldMap.has(key))
            .map(([key, value]) => ({
              fieldId: fieldMap.get(key),
              value: typeof value === 'string' ? value : JSON.stringify(value)
            }))
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id,
      message: 'Form submitted successfully' 
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}
