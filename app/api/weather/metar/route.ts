import { NextResponse } from "next/server"

// Rwanda airport ICAO codes
const AIRPORT_ICAOS = ["HRYR", "HRZA", "HRHU"]
const CACHE_MS = 30 * 60 * 1000 // 30 minutes

// Module-level cache (persists across requests within the same server instance)
let cache: { data: MetarResponse; ts: number } | null = null

interface MetarResponse {
  metar: any[]
  taf: any[]
  fetchedAt: string
  stale?: boolean
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json({ ...cache.data, cached: true })
  }

  try {
    const ids = AIRPORT_ICAOS.join(",")
    const headers = { "User-Agent": "RwandaDroneCommunity/1.0" }
    const timeout = AbortSignal.timeout(10000)

    const [metarRes, tafRes] = await Promise.allSettled([
      fetch(`https://aviationweather.gov/api/data/metar?ids=${ids}&format=json&hours=2`, { headers }),
      fetch(`https://aviationweather.gov/api/data/taf?ids=HRYR&format=json`, { headers }),
    ])

    const metar =
      metarRes.status === "fulfilled" && metarRes.value.ok
        ? await metarRes.value.json()
        : []
    const taf =
      tafRes.status === "fulfilled" && tafRes.value.ok
        ? await tafRes.value.json()
        : []

    const data: MetarResponse = {
      metar: Array.isArray(metar) ? metar : [],
      taf: Array.isArray(taf) ? taf : [],
      fetchedAt: new Date().toISOString(),
    }

    cache = { data, ts: Date.now() }
    return NextResponse.json(data)
  } catch {
    if (cache) {
      return NextResponse.json({ ...cache.data, stale: true })
    }
    return NextResponse.json(
      { metar: [], taf: [], error: "Aviation weather temporarily unavailable" },
      { status: 503 }
    )
  }
}
