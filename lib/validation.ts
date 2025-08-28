import { z } from "zod"

// User registration validation - simplified to only essential fields
export const userRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"),
})

// User login validation
export const userLoginSchema = z.object({
  email: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
})

// Event creation/update validation
export const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  fullDescription: z.string().max(5000).optional(),
  categoryId: z.string().optional(),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date").optional(),
  location: z.string().min(2, "Location must be at least 2 characters").max(100),
  venue: z.string().max(200).optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  registrationDeadline: z.string().datetime("Invalid registration deadline").optional(),
  allowRegistration: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  speakers: z.array(z.string()).max(20).optional(),
  agenda: z.array(z.string()).max(50).optional(),
  requirements: z.array(z.string()).max(20).optional(),
  gallery: z.array(z.string()).max(20).optional(),
  userId: z.string().min(1, "User ID is required"),
})

// Forum post validation
export const forumPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  content: z.string().min(10, "Content must be at least 10 characters").max(10000),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).max(10).optional(),
})

// Comment validation
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(),
})

// Project validation
export const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["planning", "in_progress", "completed", "on_hold"]).optional(),
  tags: z.array(z.string()).max(15).optional(),
  userId: z.string().min(1, "User ID is required"),
})

// Service validation
export const serviceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  category: z.string().min(1, "Category is required"),
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  location: z.string().max(100).optional(),
  isRemote: z.boolean().optional(),
  userId: z.string().min(1, "User ID is required"),
})

// Opportunity validation
export const opportunitySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  company: z.string().min(2, "Company name must be at least 2 characters").max(100),
  opportunityType: z.enum(["full_time", "part_time", "contract", "internship", "volunteer"]),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(2, "Location must be at least 2 characters").max(100),
  salary: z.number().positive().optional(),
  requirements: z.array(z.string()).max(20).optional(),
  isUrgent: z.boolean().optional(),
  isRemote: z.boolean().optional(),
  isActive: z.boolean().optional(),
  userId: z.string().min(1, "User ID is required"),
})

// Generic ID validation
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
})

// Pagination validation
export const paginationSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
})

// Search validation
export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required").max(100),
  category: z.string().optional(),
  location: z.string().optional(),
  ...paginationSchema.shape,
}) 