export interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatar: string
  bio?: string
  location?: string
  website?: string
  joinedAt: Date
  reputation: number
  isVerified: boolean
  role: "admin" | "moderator" | "member"
  lastActive: Date
  postsCount: number
  commentsCount: number
  projectsCount: number
}

export interface ForumCategory {
  id: string
  name: string
  description: string
  icon: string
  slug: string
  postsCount: number
  lastPostAt: Date
  lastPostBy: string
  color: string
  isActive: boolean
  order: number
}

export interface ForumPost {
  id: string
  title: string
  content: string
  excerpt: string
  categoryId: string
  category: ForumCategory
  authorId: string
  author: User
  createdAt: Date
  updatedAt: Date
  viewsCount: number
  likesCount: number
  repliesCount: number
  isPinned: boolean
  isLocked: boolean
  tags: string[]
  status: "draft" | "published" | "archived"
}

export interface ForumComment {
  id: string
  content: string
  postId: string
  authorId: string
  author: User
  parentId?: string
  createdAt: Date
  updatedAt: Date
  likesCount: number
  isEdited: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  fullDescription: string
  category: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  startDate: Date
  endDate?: Date
  duration: string
  fundingSource: string
  location: string
  authorId: string
  author: User
  teamMembers: TeamMember[]
  technologies: string[]
  gallery: string[]
  impactMetrics: {
    beneficiaries?: number
    areasCovered?: string
    costSavings?: string
    timeReduction?: string
  }
  githubUrl?: string
  demoUrl?: string
  createdAt: Date
  updatedAt: Date
  viewsCount: number
  likesCount: number
  isPublished: boolean
  isFeatured: boolean
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  bio?: string
}

export interface Event {
  id: string
  title: string
  description: string
  fullDescription: string
  category: string
  startDate: Date
  endDate: Date
  location: string
  venue: string
  capacity?: number
  price?: number
  currency?: string
  organizerId: string
  organizer: User
  speakers: Speaker[]
  agenda: AgendaItem[]
  requirements: string[]
  gallery: string[]
  registrationDeadline?: Date
  createdAt: Date
  updatedAt: Date
  viewsCount: number
  registeredCount: number
  isPublished: boolean
  isFeatured: boolean
}

export interface Speaker {
  id: string
  name: string
  title: string
  bio: string
  avatar: string
  company?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    website?: string
  }
}

export interface AgendaItem {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  speaker?: string
  type: "presentation" | "workshop" | "panel" | "break" | "networking"
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "full-time" | "part-time" | "contract" | "internship"
  category: string
  description: string
  requirements: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  postedBy: string
  postedAt: Date
  expiresAt: Date
  isActive: boolean
}

export interface Service {
  id: string
  title: string
  provider: string
  category: string
  description: string
  price: {
    amount: number
    currency: string
    type: "fixed" | "hourly" | "project"
  }
  location: string
  contact: {
    email: string
    phone?: string
    website?: string
  }
  gallery: string[]
  rating: number
  reviewsCount: number
  isActive: boolean
  createdAt: Date
}

export interface Resource {
  id: string
  title: string
  description: string
  category: string
  type: "guide" | "tutorial" | "documentation" | "tool" | "regulation"
  content?: string
  fileUrl?: string
  externalUrl?: string
  author: string
  createdAt: Date
  updatedAt: Date
  downloadCount: number
  isPublished: boolean
}
