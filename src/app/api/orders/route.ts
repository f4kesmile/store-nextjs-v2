import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CartItem {
  productId: number;
  productName: string;
  productPrice: string | number;
  productImage?: string;
  variantId?: number;
  variantName?: string;
  variantValue?: string;
  quantity: number;
  notes?: string;
  maxStock: number;
  enableNotes?: boolean;
}

interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  notes?: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  resellerId?: number;
  resellerRef?: string;
}

export async function POST(req: NextRequest) {
  try {
    const orderData: OrderData = await req.json();
    
    // Validate required fields
    const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'customerAddress'];
    for (const field of requiredFields) {
      if (!orderData[field as keyof OrderData]) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.customerEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }
    
    // Validate items
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: "Keranjang kosong" },
        { status: 400 }
      );
    }
    
    // Validate products and calculate total
    let calculatedTotal = 0;
    const validatedItems = [];
    
    for (const item of orderData.items) {
      const price = typeof item.productPrice === 'string' ? 
        parseFloat(item.productPrice.replace(/[^0-9.]/g, '')) : 
        item.productPrice;
      
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { error: `Harga produk ${item.productName} tidak valid` },
          { status: 400 }
        );
      }
      
      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      });
      
      if (!product) {
        return NextResponse.json(
          { error: `Produk ${item.productName} tidak ditemukan` },
          { status: 400 }
        );
      }
      
      // Check stock
      const availableStock = item.variantId 
        ? product.variants.find(v => v.id === item.variantId)?.stock || 0
        : product.stock;
      
      if (item.quantity > availableStock) {
        return NextResponse.json(
          { error: `Stok ${item.productName} tidak mencukupi. Tersedia: ${availableStock}` },
          { status: 400 }
        );
      }
      
      const itemTotal = price * item.quantity;
      calculatedTotal += itemTotal;
      
      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: itemTotal,
        notes: item.notes || null
      });
    }
    
    // Find reseller if ref provided
    let reseller = null;
    if (orderData.resellerRef) {
      reseller = await prisma.reseller.findUnique({
        where: { uniqueId: orderData.resellerRef }
      });
    }
    
    // Create order with items in a transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          customerAddress: orderData.customerAddress,
          paymentMethod: orderData.paymentMethod || 'manual',
          notes: orderData.notes || null,
          totalAmount: calculatedTotal,
          totalItems: orderData.totalItems,
          status: 'PENDING',
          resellerId: reseller?.id || null
        }
      });
      
      // Create order items
      await tx.orderItem.createMany({
        data: validatedItems.map(item => ({
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          notes: item.notes
        }))
      });
      
      // Update product/variant stock
      for (const item of validatedItems) {
        if (item.variantId) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: null, // Customer order, no admin user
          type: 'order_created',
          title: `Pesanan Baru #${order.id}`,
          description: `${orderData.customerName} membuat pesanan senilai Rp ${calculatedTotal.toLocaleString('id-ID')} dengan ${orderData.totalItems} item`,
          action: `New order created: ${order.id}`,
          metadata: {
            orderId: order.id,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            totalAmount: calculatedTotal,
            totalItems: orderData.totalItems,
            resellerRef: orderData.resellerRef || null,
            items: orderData.items.length
          }
        }
      });
      
      return order;
    });
    
    console.log('New order created in database:', {
      orderId: createdOrder.id,
      customer: orderData.customerName,
      total: calculatedTotal,
      items: orderData.totalItems
    });
    
    return NextResponse.json({
      success: true,
      orderId: createdOrder.id,
      message: 'Pesanan berhasil dibuat',
      order: {
        id: createdOrder.id,
        totalAmount: Number(createdOrder.totalAmount),
        totalItems: createdOrder.totalItems,
        status: createdOrder.status.toLowerCase()
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Order creation error:', error);
    
    // Log error activity if possible
    try {
      await prisma.activityLog.create({
        data: {
          userId: null,
          type: 'error',
          title: 'Error saat checkout',
          description: 'Gagal membuat pesanan - sistem error',
          action: `Checkout error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            customerName: (await req.json().catch(() => ({})))?.customerName || 'Unknown'
          }
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return NextResponse.json(
      { error: 'Gagal membuat pesanan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}