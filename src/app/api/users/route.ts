// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.USERS_READ)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.USERS_CREATE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { username, email, password, roleId } = body

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        roleId: parseInt(roleId),
      },
      include: {
        role: true,
      },
    })

    await logActivity(
      parseInt(session.user.id),
      `Created user: ${user.username} (${user.email})`
    )

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
