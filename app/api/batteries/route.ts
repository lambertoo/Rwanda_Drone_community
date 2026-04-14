import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const batteries = await prisma.battery.findMany({
      where: { drone: { userId: user.id } },
      include: { drone: { select: { id: true, name: true, brand: true, model: true } } },
      orderBy: [{ health: "asc" }, { cycleCount: "desc" }],
    })

    return NextResponse.json({ batteries })
  } catch (error) {
    console.error("Error fetching batteries:", error)
    return NextResponse.json({ error: "Failed to fetch batteries" }, { status: 500 })
  }
}
