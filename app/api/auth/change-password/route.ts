import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-middleware"
import { verifyPassword, hashPassword, validatePassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
    const body = await request.json()
    const { currentPassword, newPassword, confirmNewPassword } = body

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json(
        { error: "Current password, new password and confirmation are required" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match" },
        { status: 400 }
      )
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with upper, lower, and a number" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { id: user.userId } })
    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const isValid = await verifyPassword(currentPassword, existing.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: existing.id }, data: { password: hashed } })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}


