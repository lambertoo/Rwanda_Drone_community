import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import Anthropic from '@anthropic-ai/sdk'

const anthropicApiKey = process.env.ANTHROPIC_API_KEY

/**
 * POST /api/forms/ai-draft
 *
 * Body: { brief: string; existingFormTitle?: string }
 *
 * Uses Claude to propose a fully-structured form (sections + fields with
 * labels, types, options). The admin can then import the draft into the
 * form editor as a starting point.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  if (!anthropicApiKey) {
    return NextResponse.json(
      { error: 'AI features are not configured. Set ANTHROPIC_API_KEY to enable.' },
      { status: 503 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const brief = String(body.brief || '').trim()
  if (brief.length < 10) {
    return NextResponse.json({ error: 'Provide a brief of at least 10 characters' }, { status: 400 })
  }

  const systemPrompt = `You are a helpful assistant that drafts web forms from short descriptions. Return JSON only, matching this TypeScript shape:

{
  "title": string,
  "description": string,
  "sections": Array<{
    "title": string,
    "description"?: string,
    "fields": Array<{
      "label": string,
      "name": string,  // snake_case machine key unique across the form
      "type": "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "PHONE" | "URL" | "NUMBER" | "MULTIPLE_CHOICE" | "CHECKBOXES" | "DROPDOWN" | "DATE" | "LINEAR_SCALE" | "RATING" | "FILE_UPLOAD" | "HEADING" | "PARAGRAPH",
      "placeholder"?: string,
      "options"?: string[],  // required for MULTIPLE_CHOICE/CHECKBOXES/DROPDOWN
      "required"?: boolean
    }>
  }>
}

Rules:
- Group related questions into sections with clear titles.
- Keep questions concise and respondent-friendly, in first-person voice.
- Use MULTIPLE_CHOICE for single-pick, CHECKBOXES for multi-pick, DROPDOWN for long single-pick lists.
- Always include 1 sensible "Other" option on open-ended choice questions.
- Give every field a unique snake_case name.
- Do not emit markdown or commentary — JSON only.`

  const client = new Anthropic({ apiKey: anthropicApiKey })

  try {
    const resp = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Draft a form for: ${brief}\n\nReturn JSON only.`,
        },
      ],
    })
    // Concatenate text blocks
    const text = resp.content
      .filter(b => b.type === 'text')
      .map(b => (b as any).text)
      .join('')
    // Extract JSON object from response
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start < 0 || end < 0) return NextResponse.json({ error: 'AI returned no JSON' }, { status: 502 })
    const json = text.slice(start, end + 1)
    const parsed = JSON.parse(json)
    return NextResponse.json({ draft: parsed })
  } catch (err: any) {
    console.error('[AI draft] error:', err)
    return NextResponse.json({ error: err.message || 'AI draft failed' }, { status: 500 })
  }
}
