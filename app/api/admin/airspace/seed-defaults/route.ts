import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const DEFAULT_ZONES = [
  // Airports — full ban
  { name: "Kigali International Airport (HRYR) — Ban Zone", description: "5km full ban around Kigali International Airport. CAA written authorization required for any drone operations within this radius.", type: "airport", lat: -1.9686, lon: 30.1395, radius: 5, severity: "red", province: "Kigali" },
  { name: "Kigali International Airport (HRYR) — Advisory Zone", description: "10km advisory zone. Prior notification to Rwanda CAA required before any drone operations.", type: "advisory", lat: -1.9686, lon: 30.1395, radius: 10, severity: "orange", province: "Kigali" },
  { name: "Kamembe Airport (HRZA) — Ban Zone", description: "3km full ban around Kamembe Airport. No drone operations without CAA authorization.", type: "airport", lat: -2.4620, lon: 28.9077, radius: 3, severity: "red", province: "Western" },
  { name: "Kamembe Airport (HRZA) — Advisory Zone", description: "5km advisory zone around Kamembe Airport. Prior notification required.", type: "advisory", lat: -2.4620, lon: 28.9077, radius: 5, severity: "orange", province: "Western" },
  { name: "Huye Airport — Ban Zone", description: "3km full ban around Huye Airport. No drone operations without CAA authorization.", type: "airport", lat: -2.6008, lon: 29.7279, radius: 3, severity: "red", province: "Southern" },
  // Protected areas
  { name: "Volcanoes National Park", description: "No-fly zone. Wildlife and tourism protection. No drone operations permitted without Rwanda Development Board (RDB) and CAA authorization.", type: "protected", lat: -1.4680, lon: 29.5080, radius: 18, severity: "orange", province: "Northern" },
  { name: "Nyungwe Forest National Park", description: "No-fly zone. Critical biodiversity area. Drone operations strictly prohibited without RDB and CAA authorization.", type: "protected", lat: -2.5200, lon: 29.1800, radius: 25, severity: "orange", province: "Western" },
  { name: "Akagera National Park", description: "No drone operations without RDB permit and CAA authorization. Wildlife and tourism protection zone.", type: "protected", lat: -1.8900, lon: 30.6200, radius: 22, severity: "yellow", province: "Eastern" },
  // Security zones
  { name: "Presidential Palace Area", description: "Full restriction — no drone operations permitted under any circumstances. Maximum security zone.", type: "restricted", lat: -1.9528, lon: 30.0616, radius: 1.5, severity: "red", province: "Kigali" },
  { name: "Kigali CBD", description: "Category A only, below 120m AMSL. Higher category operations require prior CAA authorization and coordination with local authorities.", type: "restricted", lat: -1.9441, lon: 30.0619, radius: 2, severity: "yellow", province: "Kigali" },
  // Permitted zones
  { name: "Musanze Drone Corridor", description: "Rwanda's official drone testing and innovation corridor. Category B & C operations permitted with prior CAA notification. Ideal for BVLOS testing and advanced flight operations.", type: "permitted", lat: -1.4985, lon: 29.6346, radius: 8, severity: "green", province: "Northern" },
  { name: "Bugesera Industrial Zone", description: "Drone operations permitted with prior notification to Rwanda CAA. Suitable for commercial operations and deliveries. Coordinate with Zone Authority.", type: "permitted", lat: -2.2137, lon: 30.2554, radius: 5, severity: "green", province: "Eastern" },
]

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    // Check how many already exist to avoid duplicates
    const existing = await prisma.airspaceZone.count()
    if (existing > 0) {
      return NextResponse.json({
        message: `Skipped — ${existing} zone(s) already exist in the database. Delete them first if you want to re-seed.`,
        seeded: 0,
        existing,
      })
    }

    const zones = await prisma.airspaceZone.createMany({
      data: DEFAULT_ZONES.map(z => ({
        ...z,
        createdById: user.id,
      })),
    })

    return NextResponse.json({ message: `Seeded ${zones.count} default airspace zones`, seeded: zones.count })
  } catch (error) {
    console.error('Seed defaults error:', error)
    return NextResponse.json({ error: 'Failed to seed zones' }, { status: 500 })
  }
}
