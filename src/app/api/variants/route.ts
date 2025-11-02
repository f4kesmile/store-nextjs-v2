// src/app/api/variants/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      )
    }

    const variants = await prisma.variant.findMany({
      where: { productId: parseInt(productId) },
      orderBy: { id: 'asc' },
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.PRODUCTS_CREATE)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { productId, name, value, stock } = body

    const variant = await prisma.variant.create({
      data: {
        productId: parseInt(productId),
        name,
        value,
        stock: parseInt(stock),
      },
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 }
    )
  }
}
