import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Testing database connection in Next.js...')
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Basic connection test:', result)
    
    // Test services table
    const servicesCount = await prisma.service.count()
    console.log('Services count:', servicesCount)
    
    // Test users table
    const usersCount = await prisma.user.count()
    console.log('Users count:', usersCount)
    
    return NextResponse.json({ 
      success: true, 
      servicesCount, 
      usersCount,
      message: 'Database connection successful!' 
    })
  } catch (error) {
    console.error('Database connection failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 