import type { User, ForumCategory, ForumPost, ForumComment, Project, Event, Job, Service, Resource } from "./types"

// Mock data storage (replace with actual database)
const users: User[] = [
  {
    id: "1",
    email: "john@example.com",
    username: "johndoe",
    fullName: "John Doe",
    avatar: "/placeholder-user.jpg",
    bio: "Drone enthusiast and software developer",
    location: "Kigali, Rwanda",
    website: "https://johndoe.dev",
    joinedAt: new Date("2023-01-15"),
    reputation: 1250,
    isVerified: true,
    role: "member",
    lastActive: new Date(),
    postsCount: 15,
    commentsCount: 45,
    projectsCount: 3,
  },
  {
    id: "2",
    email: "admin@dronecommunity.rw",
    username: "admin",
    fullName: "Community Admin",
    avatar: "/placeholder-user.jpg",
    bio: "Rwanda Drone Community Administrator",
    location: "Kigali, Rwanda",
    joinedAt: new Date("2022-01-01"),
    reputation: 5000,
    isVerified: true,
    role: "admin",
    lastActive: new Date(),
    postsCount: 50,
    commentsCount: 200,
    projectsCount: 10,
  },
]

const forumCategories: ForumCategory[] = [
  {
    id: "1",
    name: "General Discussion",
    description: "General topics about drones and community",
    icon: "MessageSquare",
    slug: "general",
    postsCount: 45,
    lastPostAt: new Date(),
    lastPostBy: "John Doe",
    color: "blue",
    isActive: true,
    order: 1,
  },
  {
    id: "2",
    name: "Technical Support",
    description: "Get help with technical issues and troubleshooting",
    icon: "Wrench",
    slug: "technical",
    postsCount: 32,
    lastPostAt: new Date(),
    lastPostBy: "Jane Smith",
    color: "green",
    isActive: true,
    order: 2,
  },
  {
    id: "3",
    name: "Regulations & Legal",
    description: "Discuss drone regulations and legal requirements",
    icon: "Scale",
    slug: "regulations",
    postsCount: 18,
    lastPostAt: new Date(),
    lastPostBy: "Mike Johnson",
    color: "red",
    isActive: true,
    order: 3,
  },
  {
    id: "4",
    name: "Project Showcase",
    description: "Share your drone projects and innovations",
    icon: "Rocket",
    slug: "showcase",
    postsCount: 25,
    lastPostAt: new Date(),
    lastPostBy: "Sarah Wilson",
    color: "purple",
    isActive: true,
    order: 4,
  },
  {
    id: "5",
    name: "Events & Meetups",
    description: "Community events, workshops, and meetups",
    icon: "Calendar",
    slug: "events",
    postsCount: 12,
    lastPostAt: new Date(),
    lastPostBy: "David Brown",
    color: "orange",
    isActive: true,
    order: 5,
  },
]

const forumPosts: ForumPost[] = []
const forumComments: ForumComment[] = []
const projects: Project[] = []
const events: Event[] = []
const jobs: Job[] = []
const services: Service[] = []
const resources: Resource[] = []

// Database operations
export const db = {
  // Users
  users: {
    findById: async (id: string): Promise<User | null> => {
      return users.find((user) => user.id === id) || null
    },
    findByEmail: async (email: string): Promise<User | null> => {
      return users.find((user) => user.email === email) || null
    },
    findByUsername: async (username: string): Promise<User | null> => {
      return users.find((user) => user.username === username) || null
    },
    create: async (userData: Omit<User, "id" | "joinedAt">): Promise<User> => {
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        joinedAt: new Date(),
        reputation: 0,
        postsCount: 0,
        commentsCount: 0,
        projectsCount: 0,
        lastActive: new Date(),
      }
      users.push(newUser)
      return newUser
    },
    update: async (id: string, updates: Partial<User>): Promise<User | null> => {
      const index = users.findIndex((user) => user.id === id)
      if (index === -1) return null
      users[index] = { ...users[index], ...updates }
      return users[index]
    },
    findAll: async (limit?: number, offset?: number): Promise<User[]> => {
      let result = users
      if (offset) result = result.slice(offset)
      if (limit) result = result.slice(0, limit)
      return result
    },
  },

  // Forum Categories
  forumCategories: {
    findAll: async (): Promise<ForumCategory[]> => {
      return forumCategories.sort((a, b) => a.order - b.order)
    },
    findBySlug: async (slug: string): Promise<ForumCategory | null> => {
      return forumCategories.find((cat) => cat.slug === slug) || null
    },
    findById: async (id: string): Promise<ForumCategory | null> => {
      return forumCategories.find((cat) => cat.id === id) || null
    },
  },

  // Forum Posts
  forumPosts: {
    findAll: async (limit?: number, offset?: number): Promise<ForumPost[]> => {
      let result = forumPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (offset) result = result.slice(offset)
      if (limit) result = result.slice(0, limit)
      return result
    },
    findByCategory: async (categoryId: string, limit?: number, offset?: number): Promise<ForumPost[]> => {
      let result = forumPosts
        .filter((post) => post.categoryId === categoryId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (offset) result = result.slice(offset)
      if (limit) result = result.slice(0, limit)
      return result
    },
    findById: async (id: string): Promise<ForumPost | null> => {
      return forumPosts.find((post) => post.id === id) || null
    },
    create: async (postData: Omit<ForumPost, "id" | "createdAt" | "updatedAt">): Promise<ForumPost> => {
      const newPost: ForumPost = {
        ...postData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        viewsCount: 0,
        likesCount: 0,
        repliesCount: 0,
      }
      forumPosts.push(newPost)
      return newPost
    },
    update: async (id: string, updates: Partial<ForumPost>): Promise<ForumPost | null> => {
      const index = forumPosts.findIndex((post) => post.id === id)
      if (index === -1) return null
      forumPosts[index] = { ...forumPosts[index], ...updates, updatedAt: new Date() }
      return forumPosts[index]
    },
    delete: async (id: string): Promise<boolean> => {
      const index = forumPosts.findIndex((post) => post.id === id)
      if (index === -1) return false
      forumPosts.splice(index, 1)
      return true
    },
  },

  // Forum Comments
  forumComments: {
    findByPostId: async (postId: string): Promise<ForumComment[]> => {
      return forumComments
        .filter((comment) => comment.postId === postId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    },
    create: async (commentData: Omit<ForumComment, "id" | "createdAt" | "updatedAt">): Promise<ForumComment> => {
      const newComment: ForumComment = {
        ...commentData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        isEdited: false,
      }
      forumComments.push(newComment)
      return newComment
    },
    update: async (id: string, updates: Partial<ForumComment>): Promise<ForumComment | null> => {
      const index = forumComments.findIndex((comment) => comment.id === id)
      if (index === -1) return null
      forumComments[index] = {
        ...forumComments[index],
        ...updates,
        updatedAt: new Date(),
        isEdited: true,
      }
      return forumComments[index]
    },
    delete: async (id: string): Promise<boolean> => {
      const index = forumComments.findIndex((comment) => comment.id === id)
      if (index === -1) return false
      forumComments.splice(index, 1)
      return true
    },
  },

  // Projects
  projects: {
    findAll: async (limit?: number, offset?: number): Promise<Project[]> => {
      let result = projects
        .filter((project) => project.isPublished)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (offset) result = result.slice(offset)
      if (limit) result = result.slice(0, limit)
      return result
    },
    findFeatured: async (limit?: number): Promise<Project[]> => {
      let result = projects
        .filter((project) => project.isPublished && project.isFeatured)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (limit) result = result.slice(0, limit)
      return result
    },
    findById: async (id: string): Promise<Project | null> => {
      return projects.find((project) => project.id === id) || null
    },
    create: async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> => {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        viewsCount: 0,
        likesCount: 0,
      }
      projects.push(newProject)
      return newProject
    },
    update: async (id: string, updates: Partial<Project>): Promise<Project | null> => {
      const index = projects.findIndex((project) => project.id === id)
      if (index === -1) return null
      projects[index] = { ...projects[index], ...updates, updatedAt: new Date() }
      return projects[index]
    },
    delete: async (id: string): Promise<boolean> => {
      const index = projects.findIndex((project) => project.id === id)
      if (index === -1) return false
      projects.splice(index, 1)
      return true
    },
  },

  // Events
  events: {
    findAll: async (limit?: number, offset?: number): Promise<Event[]> => {
      let result = events
        .filter((event) => event.isPublished)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      if (offset) result = result.slice(offset)
      if (limit) result = result.slice(0, limit)
      return result
    },
    findUpcoming: async (limit?: number): Promise<Event[]> => {
      const now = new Date()
      let result = events
        .filter((event) => event.isPublished && event.startDate > now)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      if (limit) result = result.slice(0, limit)
      return result
    },
    findById: async (id: string): Promise<Event | null> => {
      return events.find((event) => event.id === id) || null
    },
    create: async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> => {
      const newEvent: Event = {
        ...eventData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        viewsCount: 0,
        registeredCount: 0,
      }
      events.push(newEvent)
      return newEvent
    },
    update: async (id: string, updates: Partial<Event>): Promise<Event | null> => {
      const index = events.findIndex((event) => event.id === id)
      if (index === -1) return null
      events[index] = { ...events[index], ...updates, updatedAt: new Date() }
      return events[index]
    },
    delete: async (id: string): Promise<boolean> => {
      const index = events.findIndex((event) => event.id === id)
      if (index === -1) return false
      events.splice(index, 1)
      return true
    },
  },
}

// Initialize with some sample data
export const initializeDatabase = async () => {
  // Add sample forum posts
  const samplePosts: Omit<
    ForumPost,
    "id" | "createdAt" | "updatedAt" | "viewsCount" | "likesCount" | "repliesCount"
  >[] = [
    {
      title: "Welcome to Rwanda Drone Community!",
      content:
        "Welcome everyone to our new community platform. This is a place where drone enthusiasts, professionals, and beginners can come together to share knowledge, collaborate on projects, and grow the drone ecosystem in Rwanda.",
      excerpt: "Welcome everyone to our new community platform for drone enthusiasts in Rwanda.",
      categoryId: "1",
      category: forumCategories[0],
      authorId: "2",
      author: users[1],
      isPinned: true,
      isLocked: false,
      tags: ["welcome", "community", "introduction"],
      status: "published",
    },
    {
      title: "Best practices for drone photography in Rwanda",
      content:
        "I've been doing drone photography for 2 years now and wanted to share some tips specific to our beautiful country. Rwanda's landscape offers incredible opportunities for aerial photography...",
      excerpt: "Tips and best practices for capturing stunning aerial photography in Rwanda.",
      categoryId: "4",
      category: forumCategories[3],
      authorId: "1",
      author: users[0],
      isPinned: false,
      isLocked: false,
      tags: ["photography", "tips", "landscape"],
      status: "published",
    },
  ]

  for (const postData of samplePosts) {
    await db.forumPosts.create(postData)
  }

  // Add sample projects
  const sampleProjects: Omit<Project, "id" | "createdAt" | "updatedAt" | "viewsCount" | "likesCount">[] = [
    {
      title: "Agricultural Monitoring System",
      description: "Drone-based crop monitoring and analysis system for smallholder farmers",
      fullDescription:
        "This project develops an affordable drone-based monitoring system specifically designed for smallholder farmers in Rwanda. The system uses computer vision and machine learning to analyze crop health, detect diseases early, and optimize irrigation patterns.",
      category: "Agriculture",
      status: "completed",
      startDate: new Date("2023-03-01"),
      endDate: new Date("2023-11-30"),
      duration: "9 months",
      fundingSource: "Rwanda Development Board",
      location: "Eastern Province, Rwanda",
      authorId: "1",
      author: users[0],
      teamMembers: [],
      technologies: ["Computer Vision", "Machine Learning", "IoT Sensors", "Mobile App"],
      gallery: ["/placeholder.jpg"],
      impactMetrics: {
        beneficiaries: 500,
        areasCovered: "1,200 hectares",
        costSavings: "30% reduction in crop losses",
        timeReduction: "50% faster disease detection",
      },
      githubUrl: "https://github.com/example/agri-monitor",
      demoUrl: "https://agri-monitor.demo.com",
      isPublished: true,
      isFeatured: true,
    },
  ]

  for (const projectData of sampleProjects) {
    await db.projects.create(projectData)
  }

  // Add sample events
  const sampleEvents: Omit<Event, "id" | "createdAt" | "updatedAt" | "viewsCount" | "registeredCount">[] = [
    {
      title: "Rwanda Drone Summit 2024",
      description: "Annual gathering of drone enthusiasts, professionals, and innovators",
      fullDescription:
        "Join us for the biggest drone event in Rwanda! This summit brings together industry leaders, innovators, and enthusiasts to discuss the latest trends, showcase innovations, and network with like-minded individuals.",
      category: "Conference",
      startDate: new Date("2024-06-15"),
      endDate: new Date("2024-06-16"),
      location: "Kigali",
      venue: "Kigali Convention Centre",
      capacity: 500,
      price: 50000,
      currency: "RWF",
      organizerId: "2",
      organizer: users[1],
      speakers: [
        {
          id: "1",
          name: "Dr. Jean Baptiste Nsengimana",
          title: "CEO, Rwanda ICT Chamber",
          bio: "Leading expert in ICT and innovation in Rwanda",
          avatar: "/placeholder-user.jpg",
          company: "Rwanda ICT Chamber",
          socialLinks: {
            linkedin: "https://linkedin.com/in/jbnsengimana",
            twitter: "https://twitter.com/jbnsengimana",
          },
        },
      ],
      agenda: [
        {
          id: "1",
          title: "Opening Keynote: The Future of Drones in Rwanda",
          description: "Vision for drone technology adoption in Rwanda",
          startTime: "09:00",
          endTime: "10:00",
          speaker: "Dr. Jean Baptiste Nsengimana",
          type: "presentation",
        },
      ],
      requirements: ["Valid ID", "Laptop (optional)", "Business cards"],
      gallery: ["/placeholder.jpg"],
      registrationDeadline: new Date("2024-06-10"),
      isPublished: true,
      isFeatured: true,
    },
  ]

  for (const eventData of sampleEvents) {
    await db.events.create(eventData)
  }
}
