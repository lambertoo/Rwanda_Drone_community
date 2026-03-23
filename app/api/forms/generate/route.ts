import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/forms/generate — AI form generation from prompt
 * Uses pattern matching + smart defaults to generate forms.
 * If ANTHROPIC_API_KEY is set, uses Claude for generation.
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (apiKey) {
      // Use Claude API for intelligent generation
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `Generate a form structure as JSON based on this description: "${prompt}"

Return ONLY valid JSON with this structure:
{
  "title": "Form Title",
  "description": "Form description",
  "sections": [
    {
      "title": "Section Title",
      "fields": [
        {
          "type": "SHORT_TEXT|LONG_TEXT|EMAIL|NUMBER|PHONE|URL|DATE|TIME|MULTIPLE_CHOICE|CHECKBOXES|DROPDOWN|MULTI_SELECT|FILE_UPLOAD|RATING|LINEAR_SCALE|GPS_COORDINATES|NATIONAL_ID",
          "label": "Field Label",
          "name": "field_name_snake_case",
          "placeholder": "optional placeholder",
          "required": true/false,
          "options": ["only for choice fields"],
          "order": 1
        }
      ]
    }
  ],
  "settings": {
    "submitButtonText": "Submit",
    "confirmationMessage": "Thank you!"
  }
}

Make field names unique snake_case. Use appropriate field types. Include 5-15 relevant fields across 1-3 sections. Be specific to the use case described.`,
            },
          ],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data.content?.[0]?.text || ''
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const formData = JSON.parse(jsonMatch[0])
            return NextResponse.json(formData)
          } catch {}
        }
      }
    }

    // Fallback: smart pattern matching
    const formData = generateFromPattern(prompt)
    return NextResponse.json(formData)
  } catch (error) {
    console.error('Error generating form:', error)
    return NextResponse.json({ error: 'Failed to generate form' }, { status: 500 })
  }
}

function generateFromPattern(prompt: string) {
  const p = prompt.toLowerCase()

  // Detect common form patterns
  const isRegistration = /register|registration|sign.?up|enroll/i.test(p)
  const isSurvey = /survey|feedback|poll|questionnaire/i.test(p)
  const isApplication = /applic|apply|job|hiring|recruit/i.test(p)
  const isEvent = /event|workshop|seminar|conference|meetup/i.test(p)
  const isContact = /contact|inquiry|reach|message/i.test(p)
  const isDrone = /drone|flight|pilot|uav|rpas/i.test(p)
  const isInspection = /inspect|checklist|audit|review/i.test(p)
  const isOrder = /order|purchase|buy|booking|reserv/i.test(p)

  const title = prompt.length > 60 ? prompt.slice(0, 57) + '...' : prompt
  const fields: any[] = []
  let sectionTitle = 'Information'

  // Always start with basic contact
  if (isRegistration || isApplication || isEvent || isOrder) {
    fields.push(
      { type: 'SHORT_TEXT', label: 'Full Name', name: 'full_name', required: true, order: 1 },
      { type: 'EMAIL', label: 'Email Address', name: 'email', required: true, order: 2 },
      { type: 'PHONE', label: 'Phone Number', name: 'phone', required: true, order: 3 },
    )
  }

  if (isApplication) {
    sectionTitle = 'Application Details'
    fields.push(
      { type: 'SHORT_TEXT', label: 'Organization', name: 'organization', required: false, order: 4 },
      { type: 'DROPDOWN', label: 'Experience Level', name: 'experience', required: true, options: ['Entry Level', '1-3 years', '3-5 years', '5+ years'], order: 5 },
      { type: 'LONG_TEXT', label: 'Cover Letter', name: 'cover_letter', placeholder: 'Tell us about yourself...', required: true, order: 6 },
      { type: 'FILE_UPLOAD', label: 'Upload CV/Resume', name: 'resume', required: true, order: 7 },
      { type: 'URL', label: 'LinkedIn Profile', name: 'linkedin', required: false, order: 8 },
    )
  } else if (isSurvey) {
    sectionTitle = 'Your Feedback'
    fields.push(
      { type: 'RATING', label: 'Overall Rating', name: 'overall_rating', required: true, order: 1 },
      { type: 'LINEAR_SCALE', label: 'How likely are you to recommend?', name: 'nps_score', required: true, order: 2 },
      { type: 'MULTIPLE_CHOICE', label: 'How did you find us?', name: 'source', required: false, options: ['Social Media', 'Search Engine', 'Friend', 'Advertisement', 'Other'], order: 3 },
      { type: 'LONG_TEXT', label: 'What can we improve?', name: 'improvement', required: false, order: 4 },
      { type: 'LONG_TEXT', label: 'Additional Comments', name: 'comments', required: false, order: 5 },
    )
  } else if (isDrone) {
    sectionTitle = 'Flight Details'
    fields.push(
      { type: 'SHORT_TEXT', label: 'Pilot License Number', name: 'license', required: true, order: 4 },
      { type: 'DATE', label: 'Flight Date', name: 'flight_date', required: true, order: 5 },
      { type: 'TIME', label: 'Start Time', name: 'start_time', required: true, order: 6 },
      { type: 'GPS_COORDINATES', label: 'Flight Location', name: 'location', required: true, order: 7 },
      { type: 'DROPDOWN', label: 'Purpose', name: 'purpose', required: true, options: ['Photography', 'Mapping', 'Inspection', 'Delivery', 'Training', 'Other'], order: 8 },
      { type: 'SHORT_TEXT', label: 'Drone Model', name: 'drone_model', required: true, order: 9 },
    )
  } else if (isContact) {
    sectionTitle = 'Your Message'
    fields.push(
      { type: 'SHORT_TEXT', label: 'Name', name: 'name', required: true, order: 1 },
      { type: 'EMAIL', label: 'Email', name: 'email', required: true, order: 2 },
      { type: 'DROPDOWN', label: 'Subject', name: 'subject', required: true, options: ['General', 'Support', 'Partnership', 'Feedback', 'Other'], order: 3 },
      { type: 'LONG_TEXT', label: 'Message', name: 'message', placeholder: 'How can we help?', required: true, order: 4 },
    )
  } else if (isEvent) {
    sectionTitle = 'Registration'
    fields.push(
      { type: 'SHORT_TEXT', label: 'Organization', name: 'organization', required: false, order: 4 },
      { type: 'DROPDOWN', label: 'How did you hear about this?', name: 'source', options: ['Social Media', 'Email', 'Website', 'Friend', 'Other'], required: false, order: 5 },
      { type: 'LONG_TEXT', label: 'Questions or Requirements', name: 'questions', required: false, order: 6 },
    )
  } else {
    // Generic form
    sectionTitle = 'Details'
    fields.push(
      { type: 'SHORT_TEXT', label: 'Name', name: 'name', required: true, order: 1 },
      { type: 'EMAIL', label: 'Email', name: 'email', required: true, order: 2 },
      { type: 'LONG_TEXT', label: 'Details', name: 'details', required: true, order: 3 },
    )
  }

  return {
    title,
    description: `Generated form: ${prompt}`,
    sections: [{ title: sectionTitle, fields }],
    settings: {
      submitButtonText: isApplication ? 'Submit Application' : isSurvey ? 'Submit Feedback' : 'Submit',
      confirmationMessage: 'Thank you for your submission!',
    },
  }
}
