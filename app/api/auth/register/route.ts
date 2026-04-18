import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { userRegistrationSchema } from "@/lib/validation"
import { authRateLimit } from "@/lib/rate-limit"
import {
  sendVerificationEmail,
  deleteExpiredUnverifiedUsers,
  VERIFICATION_EXPIRY_HOURS,
} from "@/lib/email-verification"

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = authRateLimit(request)
    if (rateLimitResult) return rateLimitResult

    const body = await request.json()

    const validationResult = userRegistrationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const { fullName, email, password } = validationResult.data

    // Opportunistically sweep any expired unverified accounts first. This lets
    // someone re-register with the same email after their prior unverified
    // account has expired without waiting for the scheduled cron run.
    await deleteExpiredUnverifiedUsers().catch(() => null)

    // Reject duplicate emails — but if the existing account is still
    // unverified (and has not yet expired) we simply re-send the verification
    // email so the user doesn't get stuck.
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 },
        )
      }
      // Unverified: re-issue the verification token and email.
      await sendVerificationEmail({
        id: existingUser.id,
        email: existingUser.email,
        fullName: existingUser.fullName,
      }).catch((err) => console.error("[Register] Re-send verification failed:", err))
      return NextResponse.json({
        message: "Verification email sent again. Please check your inbox.",
        email,
        expiresInHours: VERIFICATION_EXPIRY_HOURS,
        requiresVerification: true,
      })
    }

    const hashedPassword = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        username: `${email.split('@')[0]}_${Math.random().toString(36).substring(2, 8)}`,
        email,
        fullName,
        password: hashedPassword,
        avatar: `/placeholder.svg?height=40&width=40&text=${fullName.split(" ").map(n => n[0]).join("")}`,
        reputation: 0,
        // Unverified until the user clicks the emailed link. OAuth sign-ups
        // hit a separate endpoint and are marked verified there.
        isVerified: false,
        isActive: true,
        postsCount: 0,
        commentsCount: 0,
        projectsCount: 0,
        eventsCount: 0,
        servicesCount: 0,
        opportunitiesCount: 0,
        specializations: JSON.stringify([]),
        certifications: JSON.stringify([]),
      },
    })

    // Send verification email (blocking so we can surface a real error if the
    // transport fails — otherwise the user would just see a confusing flow).
    try {
      await sendVerificationEmail({ id: newUser.id, email: newUser.email, fullName: newUser.fullName })
    } catch (err) {
      console.error("[Register] Could not send verification email:", err)
      // Roll back the unverified row so the user can try again cleanly.
      await prisma.user.delete({ where: { id: newUser.id } }).catch(() => null)
      return NextResponse.json(
        { error: "We couldn't send your verification email. Please try again." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: "Check your email to verify your account.",
      email,
      expiresInHours: VERIFICATION_EXPIRY_HOURS,
      requiresVerification: true,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
