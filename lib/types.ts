export type UserRole = "admin" | "hobbyist" | "pilot" | "regulator" | "student" | "service_provider"

export type Region = 
  | "KIGALI_NYARUGENGE" | "KIGALI_KICUKIRO" | "KIGALI_GASABO"
  | "SOUTH_HUYE" | "SOUTH_NYAMAGABE" | "SOUTH_NYARUGURU" | "SOUTH_MUHANGA" | "SOUTH_KAMONYI" | "SOUTH_GISAGARA" | "SOUTH_NYANZA" | "SOUTH_RUHANGO"
  | "NORTH_MUSANZE" | "NORTH_GICUMBI" | "NORTH_RULINDO" | "NORTH_BURERA" | "NORTH_GAKENKE"
  | "EAST_KAYONZA" | "EAST_NGOMA" | "EAST_KIREHE" | "EAST_NYAGATARE" | "EAST_BUGESERA" | "EAST_RWAMAGANA" | "EAST_GATSIBO"
  | "WEST_RUBAVU" | "WEST_RUSIZI" | "WEST_NYAMASHEKE" | "WEST_RUTSIRO" | "WEST_KARONGI" | "WEST_NGORORERO" | "WEST_NYABIHU"
  | "UNKNOWN"

export type ProjectStatus = "planning" | "in_progress" | "completed" | "on_hold"

export interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatar?: string
  bio?: string
  location?: Region
  website?: string
  joinedAt: Date
  reputation: number
  isVerified: boolean
  role: UserRole
  lastActive: Date
  postsCount: number
  commentsCount: number
  projectsCount: number
  pilotLicense?: string
  organization?: string
  experience?: string
  specializations?: string
  certifications?: string
}

export interface ForumCategory {
  id: string
  name: string
  description: string
  slug: string
  color: string
  postCount: number
  lastPostAt?: Date
}

export interface ForumPost {
  id: string
  title: string
  content: string
  categoryId: string
  category: ForumCategory
  authorId: string
  author: User
  tags?: string
  createdAt: Date
  updatedAt: Date
  viewsCount: number
  repliesCount: number
  lastReplyAt?: Date
  isPinned: boolean
  isLocked: boolean
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
  fullDescription?: string
  category: string
  status: ProjectStatus
  authorId: string
  author: User
  location?: string
  duration?: string
  startDate?: string
  endDate?: string
  funding?: string
  technologies?: string
  objectives?: string
  challenges?: string
  outcomes?: string
  teamMembers?: string
  gallery?: string
  createdAt: Date
  updatedAt: Date
  viewsCount: number
  likesCount: number
  isFeatured: boolean
}

export interface Event {
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
  requirements?: string
  tags?: string
  speakers?: string
  agenda?: string
  gallery?: string
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

export interface Service {
  id: string
  title: string
  description: string
  region: Region
  contact: string
  approved: boolean
  createdAt: Date
  providerId: string
  provider: User
}

export interface Resource {
  id: string
  title: string
  description?: string
  fileUrl: string
  uploadedAt: Date
  userId: string
  uploadedBy: User
}

export interface Job {
  id: string
  title: string
  description: string
  location: string
  createdAt: Date
  posterId: string
  poster: User
}

export interface JobApplication {
  id: string
  jobId: string
  job: Job
  applicantId: string
  applicant: User
  message?: string
  createdAt: Date
}

export interface RSVP {
  id: string
  userId: string
  user: User
  eventId: string
  event: Event
  createdAt: Date
}
