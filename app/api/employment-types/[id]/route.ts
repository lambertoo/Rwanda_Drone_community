import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description, category, icon, color, order, isActive } = body

    const employmentType = await prisma.employmentType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(employmentType)
  } catch (error) {
    console.error("Error updating employment type:", error)
    return NextResponse.json(
      { error: "Failed to update employment type" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if employment type is being used by any opportunities
    const opportunitiesCount = await prisma.opportunity.count({
      where: { employmentTypeId: id }
    })

    if (opportunitiesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete employment type. It is being used by ${opportunitiesCount} opportunities.` },
        { status: 400 }
      )
    }

    await prisma.employmentType.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting employment type:", error)
    return NextResponse.json(
      { error: "Failed to delete employment type" },
      { status: 500 }
    )
  }
}
