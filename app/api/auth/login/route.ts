import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTokens, setSecureCookies } from "@/lib/jwt-utils"
import { verifyPassword } from "@/lib/auth"
import { userLoginSchema } from "@/lib/validation"
import { authRateLimit } from "@/lib/rate-limit"

/** Constant delay (ms) on invalid credentials to slow brute force and reduce timing leaks. */
const INVALID_CREDENTIALS_DELAY_MS = 500

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = authRateLimit(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const body = await request.json()

    // Validate input using Zod schema
    const validationResult = userLoginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      }
    })
    if (!user) {
      await sleep(INVALID_CREDENTIALS_DELAY_MS)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password against hashed password
    let isValidPassword = false
    try {
      isValidPassword = await verifyPassword(password, user.password)
    } catch (verifyErr) {
      console.error("Password verification error (invalid hash?):", (verifyErr as Error)?.message)
      await sleep(INVALID_CREDENTIALS_DELAY_MS)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!isValidPassword) {
      await sleep(INVALID_CREDENTIALS_DELAY_MS)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is blocked
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is blocked. Please contact an administrator." }, { status: 403 })
    }

    // Generate JWT tokens (role must be string for JWT; use empty string if null)
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role ?? '',
    })

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    })

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        organization: user.organization,
        pilotLicense: user.pilotLicense,
        experience: user.experience,
        specializations: user.specializations,
        certifications: user.certifications,
      },
      // Include redirect information based on user role
      redirectTo: user.role === null ? "/complete-profile" : "/"
    })

    // Set secure HTTP-only cookies with JWT tokens
    return setSecureCookies(response, tokens)
  } catch (error) {
    const err = error as Error
    console.error("Login error:", err?.message ?? error)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: "Internal server error", detail: err?.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
