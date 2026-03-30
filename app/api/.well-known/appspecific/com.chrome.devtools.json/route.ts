import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    name: "Rwanda UAS Community Platform",
    description: "Connect with drone enthusiasts, professionals, and businesses across Rwanda",
    version: "1.0.0"
  })
} 