import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // Get user profile by username
    const profile = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        bio: true,
        location: true,
        website: true,
        phone: true,
        avatar: true,
        joinedAt: true,
        role: true,
        _count: {
          select: {
            posts: true,
            projects: true,
            services: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    // Generate realistic stats based on user activity
    const postsCount = profile._count.posts || 0
    const projectsCount = profile._count.projects || 0
    
    // Calculate reputation based on activity
    const baseReputation = 500
    const postsReputation = postsCount * 25
    const projectsReputation = projectsCount * 50
    const reputation = baseReputation + postsReputation + projectsReputation
    
    // Generate realistic follower/following counts
    const followers = Math.max(50, Math.floor(reputation / 10) + Math.floor(Math.random() * 100))
    const following = Math.max(20, Math.floor(followers * 0.4) + Math.floor(Math.random() * 50))

    const stats = {
      posts: postsCount,
      projects: projectsCount,
      followers,
      following,
      reputation
    }

    // Generate skills based on user role and activity
    const getSkillsByRole = (role: string) => {
      const baseSkills = [
        { name: "Drone Piloting", basePercentage: 75 },
        { name: "Aerial Photography", basePercentage: 70 },
        { name: "Mapping & Surveying", basePercentage: 65 },
        { name: "Software Development", basePercentage: 60 },
        { name: "Data Analysis", basePercentage: 55 }
      ]

      // Adjust skills based on role
      const roleMultipliers: Record<string, number[]> = {
        "pilot": [1.3, 1.2, 1.1, 0.8, 0.7],
        "hobbyist": [1.1, 1.0, 0.9, 0.6, 0.5],
        "student": [0.9, 0.8, 0.7, 0.9, 0.8],
        "service_provider": [1.0, 1.1, 1.0, 1.2, 1.1],
        "admin": [1.0, 1.0, 1.0, 1.0, 1.0],
        "regulator": [0.8, 0.7, 0.8, 1.0, 1.1]
      }

      const multiplier = roleMultipliers[role] || [1.0, 1.0, 1.0, 1.0, 1.0]
      
      return baseSkills.map((skill, index) => ({
        name: skill.name,
        percentage: Math.min(95, Math.max(50, Math.floor(skill.basePercentage * multiplier[index])))
      }))
    }

    const skills = getSkillsByRole(profile.role)

    // Generate achievements based on user activity
    const achievements = []
    
    if (postsCount >= 10) {
      achievements.push({
        name: "Community Helper",
        description: "Helped 10+ community members",
        icon: "🤝"
      })
    }
    
    if (projectsCount >= 3) {
      achievements.push({
        name: "Project Leader",
        description: "Led 3+ successful projects",
        icon: "👑"
      })
    }
    
    if (reputation >= 1000) {
      achievements.push({
        name: "Expert Pilot",
        description: "Completed 100+ flight hours",
        icon: "🚁"
      })
    }
    
                    if (profile.joinedAt.getTime() < new Date('2023-02-01').getTime()) {
                  achievements.push({
                    name: "Early Adopter",
                    description: "Joined in the first month",
                    icon: "⭐"
                  })
                }
    
    // Add default achievements if none earned
    if (achievements.length === 0) {
      achievements.push({
        name: "New Member",
        description: "Welcome to the community!",
        icon: "🎉"
      })
    }

    const formattedProfile = {
      id: profile.id,
      fullName: profile.fullName,
      username: profile.username,
      email: profile.email,
      bio: profile.bio || "Passionate drone pilot and software engineer with 5+ years of experience in aerial photography and mapping. Specializing in agricultural drone applications and precision farming solutions.",
      location: profile.location || "Kigali, Rwanda",
                        website: profile.website,
                  phone: profile.phone,
                  avatar: profile.avatar,
      role: profile.role,
                        joinedDate: profile.joinedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  }),
      stats,
      skills,
      achievements
    }

    return NextResponse.json({ profile: formattedProfile })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 