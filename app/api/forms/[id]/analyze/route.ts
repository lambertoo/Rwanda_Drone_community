import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt-utils'
import { canEdit } from '@/lib/collaboration'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await params

  // Auth check
  const token = request.cookies.get('accessToken')?.value
  if (!token) return new Response('Unauthorized', { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return new Response('Invalid token', { status: 401 })

  // Verify form ownership
  const form = await prisma.universalForm.findUnique({
    where: { id: formId },
    include: {
      sections: {
        include: { fields: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!form) return new Response('Form not found', { status: 404 })
  const hasAccess = await canEdit(payload.userId, payload.email, 'FORM', formId)
  if (!hasAccess) return new Response('Forbidden', { status: 403 })

  // Load submissions with values
  const submissions = await prisma.formEntry.findMany({
    where: { formId },
    orderBy: { createdAt: 'desc' },
    include: {
      values: { include: { field: { select: { name: true, label: true, type: true } } } },
    },
  })

  // Build a structured summary of the data for the AI
  const formStructure = form.sections.map((s) => ({
    section: s.title,
    fields: s.fields.map((f) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      options: f.options,
    })),
  }))

  // Convert submissions to readable rows
  const rows = submissions.map((sub, i) => {
    const row: Record<string, string | null> = { _index: String(i + 1), _date: sub.createdAt.toISOString().slice(0, 10) }
    sub.values.forEach((v) => {
      if (v.field) row[v.field.label] = v.value
    })
    return row
  })

  const { prompt } = await request.json()
  if (!prompt || typeof prompt !== 'string') {
    return new Response('Prompt is required', { status: 400 })
  }

  const systemPrompt = `You are an expert data analyst. You are analyzing responses to a form/survey titled "${form.title}"${form.description ? ` — ${form.description}` : ''}.

FORM STRUCTURE:
${JSON.stringify(formStructure, null, 2)}

SUBMISSION DATA (${submissions.length} responses):
${JSON.stringify(rows, null, 2)}

Instructions:
- Provide clear, actionable analysis based on the actual data
- Use specific numbers, percentages, and comparisons
- Highlight key trends, patterns, and outliers
- For matrix/rating fields, calculate averages and identify highest/lowest rated items
- Format your response with clear headings and bullet points using Markdown
- Be concise but thorough
- If the data is insufficient to answer the question, say so honestly`

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  return result.toTextStreamResponse()
}
