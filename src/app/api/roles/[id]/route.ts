// src/app/api/roles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

// PUT - Update role
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.ROLES_MANAGE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, permissions } = body

    // Check if role is DEVELOPER
    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (existingRole?.name === 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Cannot edit DEVELOPER role' },
        { status: 400 }
      )
    }

    const role = await prisma.role.update({
      where: { id: parseInt(params.id) },
      data: {
        name: name.toUpperCase(),
        permissions,
      },
    })

    await logActivity(
      parseInt(session.user.id),
      `Updated role: ${role.name}`
    )

    return NextResponse.json(role)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

// DELETE - Delete role
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.ROLES_MANAGE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if role is DEVELOPER
    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(params.id) },
    })

    if (existingRole?.name === 'DEVELOPER') {
      return NextResponse.json(
        { error: 'Cannot delete DEVELOPER role' },
        { status: 400 }
      )
    }

    const role = await prisma.role.delete({
      where: { id: parseInt(params.id) },
    })

    await logActivity(
      parseInt(session.user.id),
      `Deleted role: ${role.name}`
    )

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}
