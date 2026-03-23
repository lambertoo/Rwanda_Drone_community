import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy for open-meteo — avoids CSP connect-src issues on Vercel
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const upstreamUrl = `https://api.open-meteo.com/v1/forecast?${searchParams.toString()}`

  try {
    const res = await fetch(upstreamUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 600 }, // cache 10 min on server
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream weather API error' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120' },
    })
  } catch {
    return NextResponse.json({ error: 'Weather data temporarily unavailable' }, { status: 503 })
  }
}
