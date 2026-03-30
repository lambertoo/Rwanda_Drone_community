import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateTokens, extractTokenFromRequest, verifyToken } from "@/lib/jwt-utils"
import { sendEmail } from "@/lib/email"
import { welcomeEmail } from "@/lib/email-templates"

interface GoogleUserInfo {
  sub: string        // Google user ID
  email: string
  email_verified: boolean
  name: string
  picture?: string
  given_name?: string
  family_name?: string
}

/**
 * GET /api/auth/google/callback — Handle Google OAuth callback
 *
 * Two modes:
 * 1. Login/Register — no JWT cookie, find or create user by Google ID/email
 * 2. Link account — JWT cookie present, link Google to the logged-in user
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=${error || "google_auth_failed"}`)
  }

  // Verify CSRF state
  const cookieState = req.cookies.get("google_oauth_state")?.value
  if (!cookieState || cookieState !== state) {
    console.error("[Google Auth] CSRF state mismatch")
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`)
  }

  // Check if user is already logged in (linking mode)
  let loggedInUserId: string | null = null
  const jwt = extractTokenFromRequest(req)
  if (jwt) {
    const payload = await verifyToken(jwt)
    if (payload) loggedInUserId = payload.userId
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const redirectUri = `${appUrl}/api/auth/google/callback`

    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) {
      console.error("[Google Auth] Token exchange failed:", tokens)
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`)
    }

    // 2. Get user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const googleUser: GoogleUserInfo = await userInfoRes.json()
    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}/login?error=no_email`)
    }

    // ── Mode A: Link Google to existing logged-in user ──
    if (loggedInUserId) {
      // Check if this Google ID is already linked to another account
      const existingGoogle = await prisma.user.findFirst({
        where: { googleId: googleUser.sub, NOT: { id: loggedInUserId } },
      })
      if (existingGoogle) {
        return NextResponse.redirect(`${appUrl}/profile/edit?error=google_already_linked`)
      }

      await prisma.user.update({
        where: { id: loggedInUserId },
        data: {
          googleId: googleUser.sub,
          avatar: (await prisma.user.findUnique({ where: { id: loggedInUserId }, select: { avatar: true } }))?.avatar || googleUser.picture,
        },
      })

      const response = NextResponse.redirect(`${appUrl}/profile/edit?google_linked=true`)
      response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" })
      return response
    }

    // ── Mode B: Login or Register ──
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: googleUser.email },
        ],
      },
    })

    let isNewUser = false

    if (user) {
      // Link Google ID if not already linked
      if (!user.googleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.sub, avatar: googleUser.picture || user.avatar },
        })
      }
    } else {
      // Create new user
      isNewUser = true
      const username = `${googleUser.email.split("@")[0]}_${Math.random().toString(36).substring(2, 8)}`

      user = await prisma.user.create({
        data: {
          username,
          email: googleUser.email,
          fullName: googleUser.name || googleUser.email.split("@")[0],
          googleId: googleUser.sub,
          avatar: googleUser.picture || `/placeholder.svg?height=40&width=40&text=${(googleUser.name || "U").charAt(0)}`,
          password: null,
          isVerified: true,
          isActive: true,
          reputation: 0,
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

      // Send welcome email (non-blocking)
      const welcome = welcomeEmail(user.fullName)
      sendEmail({ to: user.email, subject: welcome.subject, html: welcome.html }).catch((err) =>
        console.error("[Google Auth] Welcome email failed:", err)
      )
    }

    // 4. Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role || "",
    })

    // 5. Redirect with cookies set
    const redirectTo = isNewUser || !user.role ? "/complete-profile" : "/"
    const response = NextResponse.redirect(`${appUrl}${redirectTo}`)

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    // Clear the OAuth state cookie
    response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" })

    return response
  } catch (err) {
    console.error("[Google Auth] Error:", err)
    return NextResponse.redirect(`${appUrl}/login?error=server_error`)
  }
}
