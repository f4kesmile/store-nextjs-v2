// src/app/api/resellers/validate/route.ts
export const dynamic = 'force-dynamic' 

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')

    if (!ref) {
      return NextResponse.json(
        { error: 'Reseller reference not provided' },
        { status: 400 }
      )
    }

    const reseller = await prisma.reseller.findUnique({
      where: { uniqueId: ref },
      select: {
        id: true,
        name: true,
        uniqueId: true,
        whatsappNumber: true,
      },
    })

    if (!reseller) {
      return NextResponse.json(
        { error: 'Reseller not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reseller)
  } catch (error) {
    console.error('Error validating reseller:', error)
    return NextResponse.json(
      { error: 'Failed to validate reseller' },
      { status: 500 }
    )
  }
}
