// src/app/api/products/route.ts - GANTI SELURUH ISI
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const admin = searchParams.get('admin')

    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (admin !== 'true') {
      return NextResponse.json(
        products.filter((p) => p.status === 'ACTIVE')
      )
    }

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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
    const { name, description, iconUrl, price, stock, status, enableNotes, variants } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        iconUrl,
        price: parseFloat(price),
        stock: parseInt(stock),
        status,
        enableNotes: enableNotes !== undefined ? enableNotes : true,
      },
    })

    if (variants && variants.length > 0) {
      await prisma.variant.createMany({
        data: variants.map((v: any) => ({
          productId: product.id,
          name: v.name,
          value: v.value,
          stock: v.stock,
        })),
      })
    }

    await logActivity(
      parseInt(session.user.id),
      `Created product: ${product.name}`
    )

    const productWithVariants = await prisma.product.findUnique({
      where: { id: product.id },
      include: { variants: true },
    })

    return NextResponse.json(productWithVariants, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
