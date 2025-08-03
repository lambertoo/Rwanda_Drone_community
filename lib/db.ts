// Mock database implementation for development
interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  joinedAt: Date
  reputation: number
  isVerified: boolean
  role: "admin" | "hobbyist" | "pilot" | "regulator" | "student" | "service-provider"
  lastActive: Date
  postsCount: number
  commentsCount: number
  projectsCount: number
  // Role-specific fields
  pilotLicense?: string
  organization?: string
  experience?: string
  specializations?: string[]
  certifications?: string[]
}

interface ForumCategory {
  id: string
  name: string
  description: string
  slug: string
  color: string
  postCount: number
  lastPostAt?: Date
}

interface ForumPost {
  id: string
  title: string
  content: string
  categoryId: string
  category: ForumCategory
  authorId: string
  author: User
  tags: string[]
  createdAt: Date
  updatedAt: Date
  viewsCount: number
  repliesCount: number
  lastReplyAt?: Date
  isPinned: boolean
  isLocked: boolean
}

interface ForumComment {
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

interface Project {
  id: string
  title: string
  description: string
  fullDescription?: string
  category: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  authorId: string
  author: User
  location?: string
  duration?: string
  startDate?: string
  endDate?: string
  funding?: string
  technologies: string[]
  objectives: string[]
  challenges: string[]
  outcomes: string[]
  teamMembers: Array<{
    name: string
    role: string
    avatar?: string
    bio?: string
  }>
  gallery: string[]
  createdAt: Date
  updatedAt: Date
  viewsCount: number
  likesCount: number
  isFeatured: boolean
}

interface Event {
  id: string
  title: string
  description: string
  fullDescription?: string
  category: string
  startDate: Date
  endDate: Date
  location: string
  venue?: string
  capacity?: number
  price: number
  currency: string
  registrationDeadline?: Date
  requirements: string[]
  tags: string[]
  speakers: Array<{
    id: string
    name: string
    title: string
    bio: string
    company: string
    avatar: string
  }>
  agenda: Array<{
    id: string
    title: string
    description: string
    startTime: string
    endTime: string
    speaker: string
    type: "presentation" | "workshop" | "panel" | "break" | "networking"
  }>
  gallery: string[]
  organizerId: string
  organizer: User
  isPublic: boolean
  allowRegistration: boolean
  createdAt: Date
  updatedAt: Date
  viewsCount: number
  registeredCount: number
  isPublished: boolean
  isFeatured: boolean
}

// Mock data storage with enhanced user roles
const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@rwandadrone.com",
    fullName: "System Administrator",
    avatar: "/placeholder.svg?height=40&width=40&text=Admin",
    bio: "Platform administrator and system manager",
    location: "Kigali, Rwanda",
    joinedAt: new Date("2024-01-01"),
    reputation: 1000,
    isVerified: true,
    role: "admin",
    lastActive: new Date(),
    postsCount: 50,
    commentsCount: 200,
    projectsCount: 10,
    organization: "Rwanda Drone Community Platform",
  },
  {
    id: "2",
    username: "hobbyist_john",
    email: "john.hobbyist@email.com",
    fullName: "John Hobbyist",
    avatar: "/placeholder.svg?height=40&width=40&text=JH",
    bio: "Drone photography enthusiast and hobby pilot",
    location: "Kigali, Rwanda",
    joinedAt: new Date("2024-02-15"),
    reputation: 450,
    isVerified: true,
    role: "hobbyist",
    lastActive: new Date(),
    postsCount: 25,
    commentsCount: 80,
    projectsCount: 3,
    experience: "2 years",
    specializations: ["Aerial Photography", "FPV Racing"],
  },
  {
    id: "3",
    username: "pilot_sarah",
    email: "sarah.pilot@email.com",
    fullName: "Sarah Uwimana",
    avatar: "/placeholder.svg?height=40&width=40&text=SU",
    bio: "Commercial drone pilot with extensive experience in agricultural monitoring",
    location: "Musanze, Rwanda",
    joinedAt: new Date("2024-01-20"),
    reputation: 850,
    isVerified: true,
    role: "pilot",
    lastActive: new Date(),
    postsCount: 40,
    commentsCount: 120,
    projectsCount: 8,
    pilotLicense: "RWA-PILOT-2024-001",
    organization: "AgriDrone Solutions",
    experience: "5 years",
    specializations: ["Agricultural Monitoring", "Surveying", "Mapping"],
    certifications: ["DJI Certified Pilot", "Agricultural Drone Specialist"],
  },
  {
    id: "4",
    username: "regulator_mike",
    email: "mike.regulator@rcaa.gov.rw",
    fullName: "Mike Regulator",
    avatar: "/placeholder.svg?height=40&width=40&text=MR",
    bio: "Regulatory officer at Rwanda Civil Aviation Authority",
    location: "Kigali, Rwanda",
    joinedAt: new Date("2024-01-10"),
    reputation: 1200,
    isVerified: true,
    role: "regulator",
    lastActive: new Date(),
    postsCount: 30,
    commentsCount: 150,
    projectsCount: 2,
    organization: "Rwanda Civil Aviation Authority (RCAA)",
    experience: "8 years",
    specializations: ["Regulatory Compliance", "Safety Standards", "Policy Development"],
    certifications: ["Aviation Safety Inspector", "Drone Regulation Expert"],
  },
  {
    id: "5",
    username: "student_emma",
    email: "emma.student@ur.ac.rw",
    fullName: "Emma Student",
    avatar: "/placeholder.svg?height=40&width=40&text=ES",
    bio: "Computer Science student specializing in drone technology and AI",
    location: "Kigali, Rwanda",
    joinedAt: new Date("2024-03-01"),
    reputation: 200,
    isVerified: true,
    role: "student",
    lastActive: new Date(),
    postsCount: 15,
    commentsCount: 45,
    projectsCount: 1,
    organization: "University of Rwanda",
    experience: "1 year",
    specializations: ["AI Integration", "Programming", "Research"],
    certifications: ["Python Programming", "Machine Learning Basics"],
  },
  {
    id: "6",
    username: "service_david",
    email: "david.service@dronefix.rw",
    fullName: "David Service",
    avatar: "/placeholder.svg?height=40&width=40&text=DS",
    bio: "Professional drone repair and maintenance service provider",
    location: "Kigali, Rwanda",
    joinedAt: new Date("2024-02-01"),
    reputation: 650,
    isVerified: true,
    role: "service-provider",
    lastActive: new Date(),
    postsCount: 35,
    commentsCount: 90,
    projectsCount: 5,
    organization: "DroneFix Rwanda",
    experience: "4 years",
    specializations: ["Drone Repair", "Maintenance", "Technical Support"],
    certifications: ["DJI Certified Technician", "Electronics Repair"],
  },
]

const mockCategories: ForumCategory[] = [
  {
    id: "1",
    name: "General Discussion",
    description: "General drone-related discussions",
    slug: "general",
    color: "blue",
    postCount: 45,
    lastPostAt: new Date(),
  },
  {
    id: "2",
    name: "Technical Support",
    description: "Get help with technical issues",
    slug: "technical",
    color: "green",
    postCount: 23,
    lastPostAt: new Date(),
  },
  {
    id: "3",
    name: "Showcase",
    description: "Show off your drone projects and achievements",
    slug: "showcase",
    color: "purple",
    postCount: 67,
    lastPostAt: new Date(),
  },
]

const mockPosts: ForumPost[] = []
const mockComments: ForumComment[] = []
const mockProjects: Project[] = []
const mockEvents: Event[] = []

// Database interface
export const db = {
  // User operations
  users: {
    findById: async (id: string): Promise<User | null> => {
      return mockUsers.find((user) => user.id === id) || null
    },
    findByEmail: async (email: string): Promise<User | null> => {
      return mockUsers.find((user) => user.email === email) || null
    },
    create: async (userData: Omit<User, "id" | "joinedAt" | "isActive">): Promise<User> => {
      const user: User = {
        ...userData,
        id: Date.now().toString(),
        joinedAt: new Date(),
        isActive: true,
      }
      mockUsers.push(user)
      return user
    },
    update: async (id: string, updates: Partial<User>): Promise<User | null> => {
      const index = mockUsers.findIndex((user) => user.id === id)
      if (index === -1) return null
      mockUsers[index] = { ...mockUsers[index], ...updates }
      return mockUsers[index]
    },
  },

  // Forum operations
  forumCategories: {
    findAll: async (): Promise<ForumCategory[]> => {
      return mockCategories
    },
    findBySlug: async (slug: string): Promise<ForumCategory | null> => {
      return mockCategories.find((cat) => cat.slug === slug) || null
    },
  },

  forumPosts: {
    findAll: async (limit?: number, offset?: number): Promise<ForumPost[]> => {
      let posts = [...mockPosts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (offset) posts = posts.slice(offset)
      if (limit) posts = posts.slice(0, limit)
      return posts
    },
    findById: async (id: string): Promise<ForumPost | null> => {
      return mockPosts.find((post) => post.id === id) || null
    },
    findByCategory: async (categoryId: string, limit?: number): Promise<ForumPost[]> => {
      let posts = mockPosts.filter((post) => post.categoryId === categoryId)
      posts = posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (limit) posts = posts.slice(0, limit)
      return posts
    },
    create: async (
      postData: Omit<
        ForumPost,
        "id" | "createdAt" | "updatedAt" | "viewsCount" | "repliesCount" | "isPinned" | "isLocked"
      >,
    ): Promise<ForumPost> => {
      const post: ForumPost = {
        ...postData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        viewsCount: 0,
        repliesCount: 0,
        isPinned: false,
        isLocked: false,
      }
      mockPosts.push(post)
      return post
    },
  },

  forumComments: {
    findByPostId: async (postId: string): Promise<ForumComment[]> => {
      return mockComments
        .filter((comment) => comment.postId === postId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    },
    create: async (
      commentData: Omit<ForumComment, "id" | "createdAt" | "updatedAt" | "likesCount" | "isEdited">,
    ): Promise<ForumComment> => {
      const comment: ForumComment = {
        ...commentData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        isEdited: false,
      }
      mockComments.push(comment)
      return comment
    },
  },

  // Project operations
  projects: {
    findAll: async (limit?: number, offset?: number): Promise<Project[]> => {
      let projects = [...mockProjects].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (offset) projects = projects.slice(offset)
      if (limit) projects = projects.slice(0, limit)
      return projects
    },
    findById: async (id: string): Promise<Project | null> => {
      return mockProjects.find((project) => project.id === id) || null
    },
    create: async (
      projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "viewsCount" | "likesCount" | "isFeatured">,
    ): Promise<Project> => {
      const project: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        viewsCount: 0,
        likesCount: 0,
        isFeatured: false,
      }
      mockProjects.push(project)
      return project
    },
  },

  // Event operations
  events: {
    findAll: async (limit?: number, offset?: number): Promise<Event[]> => {
      let events = [...mockEvents].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      if (offset) events = events.slice(offset)
      if (limit) events = events.slice(0, limit)
      return events
    },
    findUpcoming: async (limit?: number): Promise<Event[]> => {
      const now = new Date()
      let events = mockEvents
        .filter((event) => event.startDate > now && event.isPublished)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      if (limit) events = events.slice(0, limit)
      return events
    },
    findById: async (id: string): Promise<Event | null> => {
      return mockEvents.find((event) => event.id === id) || null
    },
    create: async (
      eventData: Omit<Event, "id" | "createdAt" | "updatedAt" | "viewsCount" | "registeredCount">,
    ): Promise<Event> => {
      const event: Event = {
        ...eventData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        viewsCount: 0,
        registeredCount: 0,
      }
      mockEvents.push(event)
      return event
    },
  },

  // Search operations
  search: async (query: string, type = "all") => {
    const results = {
      posts: [] as ForumPost[],
      projects: [] as Project[],
      events: [] as Event[],
    }

    if (type === "all" || type === "posts") {
      results.posts = mockPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (type === "all" || type === "projects") {
      results.projects = mockProjects.filter(
        (project) =>
          project.title.toLowerCase().includes(query.toLowerCase()) ||
          project.description.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (type === "all" || type === "events") {
      results.events = mockEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.description.toLowerCase().includes(query.toLowerCase()),
      )
    }

    return results
  },
}

// Initialize database
export const initializeDatabase = () => {
  console.log("Database initialized with mock data")
}
