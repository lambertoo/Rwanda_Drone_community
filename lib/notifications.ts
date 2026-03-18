import { prisma } from '@/lib/prisma'

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
  data,
}: {
  userId: string
  type: string
  title: string
  body: string
  link?: string
  data?: Record<string, any>
}) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, link: link || null, data: data || null }
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}
