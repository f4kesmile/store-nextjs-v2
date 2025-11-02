// src/app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, notes, customerName, customerPhone } = body

    const transaction = await prisma.transaction.update({
      where: { id: parseInt(params.id) },
      data: {
        status,
        notes,
        customerName,
        customerPhone,
      },
      include: {
        product: true,
        variant: true,
        reseller: true,
      },
    })

    await logActivity(
      parseInt(session.user.id),
      `Updated transaction #${transaction.id} to ${status}`
    )

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.transaction.delete({
      where: { id: parseInt(params.id) },
    })

    await logActivity(
      parseInt(session.user.id),
      `Deleted transaction #${params.id}`
    )

    return NextResponse.json({ message: 'Transaction deleted' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
