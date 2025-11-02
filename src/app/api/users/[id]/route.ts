// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.USERS_UPDATE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { username, email, password, roleId } = body

    const updateData: any = {
      username,
      email,
      roleId: parseInt(roleId),
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    const user = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      include: {
        role: true,
      },
    })

    await logActivity(
      parseInt(session.user.id),
      `Updated user: ${user.username}`
    )

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.USERS_DELETE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.delete({
      where: { id: parseInt(params.id) },
    })

    await logActivity(
      parseInt(session.user.id),
      `Deleted user: ${user.username}`
    )

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
