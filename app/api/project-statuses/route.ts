import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Define project statuses that are available in the system
    const statuses = [
      { value: "planning", label: "Planning", color: "bg-blue-100 text-blue-800" },
      { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
      { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
      { value: "on_hold", label: "On Hold", color: "bg-gray-100 text-gray-800" },
      { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
    ]

    return NextResponse.json({ statuses })
  } catch (error) {
    console.error('Error fetching project statuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project statuses' },
      { status: 500 }
    )
  }
} 