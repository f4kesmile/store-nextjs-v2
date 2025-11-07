// src/app/api/checkout/route.ts - FULL CODE
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Pastikan Anda menerima semua data yang dibutuhkan, termasuk customerInfo
    const { productId, variantId, quantity, resellerId, customerInfo, notes } = body 

    // Destrukturisasi data pelanggan dari customerInfo
    const { name: customerName, phone: customerPhone } = customerInfo || {};

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check stock
    let availableStock = product.stock
    let variantInfo = 'Standard'
    let selectedVariant = null

    if (variantId) {
      selectedVariant = product.variants.find((v) => v.id === variantId)
      if (selectedVariant) {
        availableStock = selectedVariant.stock
        variantInfo = `${selectedVariant.name}: ${selectedVariant.value}`
      }
    }

    // Validate stock
    if (availableStock < quantity) {
      return NextResponse.json(
        { error: 'Stok tidak mencukupi' },
        { status: 400 }
      )
    }

    // GET SUPPORT WHATSAPP & RESELLER INFO FROM DB/SETTINGS
    const settings = await prisma.siteSettings.findFirst()

    let whatsappNumber = settings?.supportWhatsApp || '6285185031023'
    let resellerName = settings?.storeName || 'Official Store'
    let resellerRecord = null
    let finalResellerDbId = null // ID database Reseller

    // Check if reseller ID (uniqueId) is provided and valid
    if (resellerId) {
      resellerRecord = await prisma.reseller.findUnique({
        where: { uniqueId: resellerId }, // Cari berdasarkan uniqueId (ref)
      })

      if (resellerRecord) {
        whatsappNumber = resellerRecord.whatsappNumber
        resellerName = resellerRecord.name
        finalResellerDbId = resellerRecord.id // Ambil ID database
      }
    }

    // Calculate total
    const totalPrice = parseFloat(product.price.toString()) * quantity

    // CREATE TRANSACTION RECORD
    const transaction = await prisma.transaction.create({
      data: {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        resellerId: finalResellerDbId, // <-- GUNAKAN ID DARI DATABASE
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        quantity,
        totalPrice,
        status: 'PENDING',
        notes: notes || null,
      },
    })
    
    // UPDATE STOCK (Logika pengurangan stok yang sudah ada, ini sudah benar)
    if (variantId && selectedVariant) {
      await prisma.variant.update({
        where: { id: selectedVariant.id },
        data: { stock: selectedVariant.stock - quantity },
      })
    } else {
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - quantity },
      })
    }
    
    // ... (Logika pembuatan pesan WhatsApp tetap sama) ...
    const now = new Date()
    const orderDate = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const orderTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    let message = `Halo ${resellerName}! 👋\n\n`
    message += `Pesanan Baru:\n`
    message += `━━━━━━━━━━━━━━━━━━━━━\n`
    message += `🆔 Order ID: #${transaction.id}\n`
    message += `📅 Tanggal: ${orderDate}\n`
    message += `⏰ Waktu: ${orderTime} WIB\n`
    message += `👤 Nama Customer: ${customerName || '-'}\n` // Tambah Customer Info
    message += `📞 Telepon Customer: ${customerPhone || '-'}\n` // Tambah Customer Info
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`
    message += `Detail Pesanan:\n`
    message += `📦 Produk: ${product.name}\n`
    message += `🎨 Varian: ${variantInfo}\n`
    message += `🔢 Jumlah: ${quantity}\n`
    
    if (notes) {
      message += `📝 Catatan: ${notes}\n`
    }
    
    message += `\n💰 Total Pembayaran: Rp ${totalPrice.toLocaleString('id-ID')}\n`
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`
    message += `Mohon diproses ya. Terima kasih! 🙏`

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
      whatsappUrl,
      transactionId: transaction.id,
      resellerName,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}