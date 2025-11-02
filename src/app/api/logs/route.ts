// src/app/api/logs/route.ts (BUKAN di api/auth/logs/)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.LOGS_READ)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const logs = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    })

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
