// src/app/api/settings/route.ts - GANTI SELURUH ISI
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst()
    
    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.siteSettings.create({
        data: {
          storeName: 'Devlog Store',
          storeDescription: 'Platform digital terpercaya Anda untuk semua kebutuhan produk premium dan layanan sosial media.',
          supportWhatsApp: '6285185031023',
          supportEmail: 'support@devlog.my.id',
          storeLocation: 'Tegal, Jawa Tengah, Indonesia',
          aboutTitle: 'Tentang Devlog Store',
          aboutDescription: 'Devlog Store adalah platform digital terpercaya Anda untuk semua kebutuhan produk premium dan layanan sosial media. Kami berkomitmen untuk menyediakan solusi digital berkualitas tinggi dengan akses yang mudah dan transaksi yang aman.',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      storeName,
      storeDescription,
      supportWhatsApp,
      supportEmail,
      storeLocation,
      aboutTitle,
      aboutDescription,
    } = body

    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          storeName,
          storeDescription,
          supportWhatsApp,
          supportEmail,
          storeLocation,
          aboutTitle,
          aboutDescription,
        },
      })
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          storeName,
          storeDescription,
          supportWhatsApp,
          supportEmail,
          storeLocation,
          aboutTitle,
          aboutDescription,
        },
      })
    }

    await logActivity(
      parseInt(session.user.id),
      'Updated site settings'
    )

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
