import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const body = await request.json()
    const { values, userId } = body

    if (!values || typeof values !== 'object') {
      return NextResponse.json({ error: 'Values are required' }, { status: 400 })
    }

    // Find the form by slug
    const form = await prisma.universalForm.findUnique({
      where: { slug },
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

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (!form.isActive || !form.isPublic) {
      return NextResponse.json({ error: 'Form is not available' }, { status: 403 })
    }

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || null

    // Validate required fields
    const allFields = form.sections.flatMap(section => section.fields)
    const requiredFields = allFields.filter(field => 
      field.isActive && 
      field.validation && 
      typeof field.validation === 'object' && 
      'required' in field.validation && 
      field.validation.required
    )

    for (const field of requiredFields) {
      if (!values[field.name] || values[field.name].toString().trim() === '') {
        return NextResponse.json({ 
          error: `${field.label} is required` 
        }, { status: 400 })
      }
    }

    // Create form entry
    const entry = await prisma.formEntry.create({
      data: {
        formId: form.id,
        userId: userId || null,
        ip,
        meta: {
          userAgent,
          referrer,
          submittedAt: new Date().toISOString()
        }
      }
    })

    // Create form values
    const formValues = []
    for (const [fieldName, value] of Object.entries(values)) {
      const field = allFields.find(f => f.name === fieldName && f.isActive)
      if (field) {
        formValues.push({
          entryId: entry.id,
          fieldId: field.id,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value)
        })
      }
    }

    if (formValues.length > 0) {
      await prisma.formValue.createMany({
        data: formValues
      })
    }

    return NextResponse.json({ 
      message: 'Form submitted successfully',
      entryId: entry.id 
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 })
  }
}
