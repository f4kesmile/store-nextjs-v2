// src/app/api/transactions/route.ts
export const dynamic = 'force-dynamic' 

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const resellerId = searchParams.get('resellerId')

    const where: any = {}
    if (status) where.status = status
    if (resellerId) where.resellerId = parseInt(resellerId)

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        product: true,
        variant: true,
        reseller: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
