import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum 20MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.toLowerCase()
    let html = ''
    let text = ''

    if (fileName.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.convertToHtml({ buffer })
      html = result.value
      // Also get plain text
      const textResult = await mammoth.extractRawText({ buffer })
      text = textResult.value
    } else if (fileName.endsWith('.doc')) {
      // .doc (old Word format) — mammoth doesn't support it well
      // Try mammoth anyway, it sometimes works
      try {
        const mammoth = await import('mammoth')
        const result = await mammoth.convertToHtml({ buffer })
        html = result.value
        const textResult = await mammoth.extractRawText({ buffer })
        text = textResult.value
      } catch {
        return NextResponse.json(
          { error: 'Old .doc format not supported. Please save as .docx and try again.' },
          { status: 400 }
        )
      }
    } else if (fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      text = data.text
      // Convert plain text to basic HTML with paragraphs
      html = text
        .split(/\n{2,}/)
        .filter((p) => p.trim())
        .map((p) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
        .join('\n')
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      text = buffer.toString('utf-8')
      html = text
        .split(/\n{2,}/)
        .filter((p) => p.trim())
        .map((p) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
        .join('\n')
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload .docx, .pdf, .txt, or .md files.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      html,
      text,
      fileName: file.name,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('[ExtractDocument] Error:', error)
    return NextResponse.json({ error: 'Failed to extract document content' }, { status: 500 })
  }
}
