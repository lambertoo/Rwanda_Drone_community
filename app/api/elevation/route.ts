import { NextRequest, NextResponse } from "next/server"

interface ElevationPoint {
  latitude: number
  longitude: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const points: ElevationPoint[] = body?.points
    if (!Array.isArray(points) || points.length === 0) {
      return NextResponse.json({ error: "points required" }, { status: 400 })
    }
    if (points.length > 100) {
      return NextResponse.json({ error: "max 100 points per request" }, { status: 400 })
    }
    for (const p of points) {
      if (typeof p?.latitude !== "number" || typeof p?.longitude !== "number") {
        return NextResponse.json({ error: "invalid point shape" }, { status: 400 })
      }
    }

    const locations = points.map((p) => `${p.latitude},${p.longitude}`).join("|")
    const url = `https://api.opentopodata.org/v1/srtm30m?locations=${encodeURIComponent(locations)}`
    const res = await fetch(url, { headers: { Accept: "application/json" } })

    if (!res.ok) {
      const fallback = await fetch("https://api.open-elevation.com/api/v1/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: points }),
      })
      if (!fallback.ok) {
        return NextResponse.json({ error: "elevation services unavailable" }, { status: 502 })
      }
      const fdata = await fallback.json()
      return NextResponse.json({
        elevations: (fdata.results || []).map((r: any) => ({
          lat: r.latitude,
          lon: r.longitude,
          elevation: r.elevation,
        })),
      })
    }

    const data = await res.json()
    return NextResponse.json({
      elevations: (data.results || []).map((r: any) => ({
        lat: r.location?.lat,
        lon: r.location?.lng,
        elevation: r.elevation,
      })),
    })
  } catch (error) {
    console.error("Elevation lookup failed:", error)
    return NextResponse.json({ error: "elevation lookup failed" }, { status: 500 })
  }
}
