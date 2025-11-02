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
    
    // Process each item and create transactions
    const transactions = [];
    let totalCalculated = 0;
    
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
      
      if (item.quantity <= 0 || item.quantity > item.maxStock) {
        return NextResponse.json(
          { error: `Jumlah produk ${item.productName} tidak valid` },
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
      
      // Verify variant if specified
      let variant = null;
      if (item.variantId) {
        variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: `Varian tidak ditemukan untuk ${item.productName}` },
            { status: 400 }
          );
        }
      }
      
      const itemTotal = price * item.quantity;
      totalCalculated += itemTotal;
      
      transactions.push({
        productId: item.productId,
        variantId: item.variantId || null,
        resellerId: orderData.resellerId || null,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        quantity: item.quantity,
        totalPrice: itemTotal,
        status: 'PENDING' as const,
        notes: item.notes || orderData.notes || null
      });
    }
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create transactions in database
    const createdTransactions = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const transactionData of transactions) {
        const result = await tx.transaction.create({
          data: transactionData,
          include: {
            product: true,
            variant: true,
            reseller: true
          }
        });
        results.push(result);
      }
      
      return results;
    });
    
    // Create a comprehensive order record (you might want to add Order model to schema)
    // For now, we'll store in a simple orders table or use existing transaction grouping
    
    console.log('New transactions created:', {
      orderId,
      customer: orderData.customerName,
      total: totalCalculated,
      transactionIds: createdTransactions.map(t => t.id)
    });
    
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Pesanan berhasil dibuat',
      order: {
        id: orderId,
        totalAmount: totalCalculated,
        totalItems: orderData.totalItems,
        status: 'pending',
        transactions: createdTransactions.map(t => ({
          id: t.id,
          productName: t.product.name,
          quantity: t.quantity,
          totalPrice: t.totalPrice
        }))
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Order creation error:', error);
    
    return NextResponse.json(
      { error: 'Gagal membuat pesanan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}