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

    // NEW: normalize resellerId from resellerRef if provided
    let resellerId: number | null = null;
    if (orderData.resellerId) {
      resellerId = Number(orderData.resellerId);
    } else if (orderData.resellerRef) {
      const r = await prisma.reseller.findUnique({ where: { uniqueId: orderData.resellerRef } });
      resellerId = r?.id ?? null;
    }
    
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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.customerEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }
    
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: "Keranjang kosong" },
        { status: 400 }
      );
    }
    
    let calculatedTotal = 0;
    const validatedItems = [] as Array<{productId:number; variantId:number|null; quantity:number; unitPrice:number; totalPrice:number; notes:string|null}>;
    
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
      
      const product = await prisma.product.findUnique({ where: { id: item.productId }, include: { variants: true } });
      if (!product) {
        return NextResponse.json(
          { error: `Produk ${item.productName} tidak ditemukan` },
          { status: 400 }
        );
      }
      
      const availableStock = item.variantId 
        ? product.variants.find(v => v.id === item.variantId)?.stock || 0
        : product.stock;
      
      if (item.quantity > availableStock) {
        return NextResponse.json(
          { error: `Stok ${item.productName} tidak mencukupi. Tersedia: ${availableStock}` },
          { status: 400 }
        );
      }
      
      const itemTotal = Number(price) * item.quantity;
      calculatedTotal += itemTotal;
      
      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice: Number(price),
        totalPrice: itemTotal,
        notes: item.notes || null
      });
    }
    
    const createdOrder = await prisma.$transaction(async (tx) => {
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
          resellerId: resellerId, // normalized reseller id
        }
      });
      
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
      
      // Update stocks
      for (const item of validatedItems) {
        if (item.variantId) {
          await tx.variant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
        } else {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
      }
      
      await tx.activityLog.create({
        data: {
          userId: null,
          type: 'order_created',
          title: `Pesanan Baru #${order.id}`,
          description: `${orderData.customerName} membuat pesanan senilai Rp ${calculatedTotal.toLocaleString('id-ID')} dengan ${orderData.totalItems} item`,
          action: `New order created: ${order.id}`,
          metadata: { resellerRef: orderData.resellerRef || null, resellerId }
        }
      });
      
      return order;
    });

    return NextResponse.json({ success:true, orderId: createdOrder.id },{ status:201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Gagal membuat pesanan. Silakan coba lagi.' },{ status:500 });
  }
}
