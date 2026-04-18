import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

/**
 * POST /api/forms/ai-draft
 *
 * Body: { brief: string }
 *
 * Uses Google Gemini to propose a fully-structured form (sections + fields
 * with labels, types, options). The admin can then import the draft into
 * the form editor as a starting point.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI features are not configured. Set GOOGLE_GENERATIVE_AI_API_KEY to enable.' },
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
      "name": string,
      "type": "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "PHONE" | "URL" | "NUMBER" | "MULTIPLE_CHOICE" | "CHECKBOXES" | "DROPDOWN" | "DATE" | "LINEAR_SCALE" | "RATING" | "FILE_UPLOAD" | "HEADING" | "PARAGRAPH",
      "placeholder"?: string,
      "options"?: string[],
      "required"?: boolean
    }>
  }>
}

Rules:
- Group related questions into sections with clear titles.
- Keep questions concise and respondent-friendly, in first-person voice.
- Use MULTIPLE_CHOICE for single-pick, CHECKBOXES for multi-pick, DROPDOWN for long single-pick lists.
- Always include a sensible "Other" option on open-ended choice questions.
- Give every field a unique snake_case machine name.
- Do not emit markdown fences or commentary. JSON only.`

  try {
    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    })
    const result = await model.generateContent(`Draft a form for: ${brief}\n\nReturn JSON only.`)
    const text = result.response.text()
    // responseMimeType=application/json should return pure JSON, but trim any fence just in case
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end < 0) return NextResponse.json({ error: 'AI returned no JSON' }, { status: 502 })
    const parsed = JSON.parse(cleaned.slice(start, end + 1))
    return NextResponse.json({ draft: parsed })
  } catch (err: any) {
    console.error('[AI draft] error:', err)
    return NextResponse.json({ error: err.message || 'AI draft failed' }, { status: 500 })
  }
}
