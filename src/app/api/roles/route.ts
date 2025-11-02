// src/app/api/roles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

// GET - Fetch all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(roles)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

// POST - Create new role
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.ROLES_MANAGE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, permissions } = body

    // Prevent creating DEVELOPER role
    if (name === 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Cannot create DEVELOPER role' },
        { status: 400 }
      )
    }

    const role = await prisma.role.create({
      data: {
        name: name.toUpperCase(),
        permissions,
      },
    })

    await logActivity(
      parseInt(session.user.id),
      `Created role: ${role.name} with ${permissions.length} permissions`
    )

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}
