// src/app/api/resellers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.RESELLERS_UPDATE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, whatsappNumber, uniqueId } = body

    const reseller = await prisma.reseller.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        whatsappNumber,
        uniqueId,
      },
    })

    await logActivity(
      parseInt(session.user.id),
      `Updated reseller: ${reseller.name}`
    )

    return NextResponse.json(reseller)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update reseller' },
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

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.RESELLERS_DELETE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reseller = await prisma.reseller.delete({
      where: { id: parseInt(params.id) },
    })

    await logActivity(
      parseInt(session.user.id),
      `Deleted reseller: ${reseller.name}`
    )

    return NextResponse.json({ message: 'Reseller deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete reseller' },
      { status: 500 }
    )
  }
}
