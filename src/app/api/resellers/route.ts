// src/app/api/resellers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

// GET - Fetch all resellers
export async function GET() {
  try {
    const resellers = await prisma.reseller.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(resellers)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch resellers' },
      { status: 500 }
    )
  }
}

// POST - Create new reseller
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.RESELLERS_CREATE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, whatsappNumber, uniqueId } = body

    const reseller = await prisma.reseller.create({
      data: {
        name,
        whatsappNumber,
        uniqueId,
      },
    })

    await logActivity(
      parseInt(session.user.id),
      `Created reseller: ${reseller.name} (${reseller.uniqueId})`
    )

    return NextResponse.json(reseller, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create reseller' },
      { status: 500 }
    )
  }
}
