// src/lib/logger.ts
import { prisma } from './prisma'

export async function logActivity(userId: number, action: string) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
      },
    })
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}
