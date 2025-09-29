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
        organization: true,
        pilotLicense: true,
        experience: true,
        specializations: true,
        certifications: true,
        reputation: true,
        postsCount: true,
        projectsCount: true,
        eventsCount: true,
        servicesCount: true,
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

    // Use real database stats
    const stats = {
      posts: profile.postsCount || 0,
      projects: profile.projectsCount || 0,
      followers: Math.max(0, Math.floor((profile.reputation || 0) / 10)), // Simple calculation based on reputation
      following: Math.max(0, Math.floor((profile.reputation || 0) / 20)), // Simple calculation based on reputation
      reputation: profile.reputation || 0
    }

    // Generate skills based on user's actual specializations and experience
    const getSkillsFromData = (specializations: any, experience: string | null, role: string | null) => {
      const defaultSkills = [
        { name: "Drone Piloting", percentage: 50 },
        { name: "Aerial Photography", percentage: 45 },
        { name: "Mapping & Surveying", percentage: 40 },
        { name: "Data Analysis", percentage: 35 }
      ]

      let skills = [...defaultSkills]

      // Add skills based on specializations
      if (specializations && Array.isArray(specializations)) {
        specializations.forEach((spec: string) => {
          const existingSkill = skills.find(s => s.name.toLowerCase().includes(spec.toLowerCase()))
          if (existingSkill) {
            existingSkill.percentage = Math.min(95, existingSkill.percentage + 20)
          } else {
            skills.push({ name: spec, percentage: 60 })
          }
        })
      }

      // Adjust based on experience
      if (experience) {
        const experienceLevel = experience.includes('5+') ? 20 : 
                               experience.includes('3+') ? 15 : 
                               experience.includes('1+') ? 10 : 5
        skills.forEach(skill => {
          skill.percentage = Math.min(95, skill.percentage + experienceLevel)
        })
      }

      // Admin gets higher skills
      if (role === 'admin') {
        skills.forEach(skill => {
          skill.percentage = Math.min(95, skill.percentage + 15)
        })
      }

      return skills.slice(0, 5) // Limit to 5 skills
    }

    const skills = getSkillsFromData(profile.specializations, profile.experience, profile.role)

    // Generate achievements based on user activity
    const achievements = []
    
    if (stats.posts >= 10) {
      achievements.push({
        name: "Community Helper",
        description: `Helped ${stats.posts} community members`,
        icon: "🤝"
      })
    }
    
    if (stats.projects >= 3) {
      achievements.push({
        name: "Project Leader",
        description: `Led ${stats.projects} successful projects`,
        icon: "👑"
      })
    }
    
    if (stats.reputation >= 1000) {
      achievements.push({
        name: "Expert Pilot",
        description: `Reputation: ${stats.reputation}`,
        icon: "🚁"
      })
    }
    
    if (profile.role === 'admin') {
      achievements.push({
        name: "Administrator",
        description: "Platform administrator",
        icon: "👑"
      })
    }
    
    if (profile.isVerified) {
      achievements.push({
        name: "Verified Member",
        description: "Identity verified",
        icon: "✅"
      })
    }
    
    if (profile.pilotLicense) {
      achievements.push({
        name: "Licensed Pilot",
        description: `License: ${profile.pilotLicense}`,
        icon: "✈️"
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
      bio: profile.bio || "No bio available",
      location: profile.location || "Location not specified",
      website: profile.website,
      phone: profile.phone,
      avatar: profile.avatar,
      role: profile.role,
      organization: profile.organization,
      pilotLicense: profile.pilotLicense,
      experience: profile.experience,
      specializations: profile.specializations,
      certifications: profile.certifications,
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