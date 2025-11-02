import { NextRequest, NextResponse } from "next/server";
import { saveOrder, logActivity, StoredOrder } from "@/lib/storage";

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
    
    // Calculate total amount on server for security
    let calculatedTotal = 0;
    let calculatedItems = 0;
    
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
      
      calculatedTotal += price * item.quantity;
      calculatedItems += item.quantity;
    }
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const now = new Date().toISOString();
    
    // Create order object
    const order: StoredOrder = {
      id: orderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      paymentMethod: orderData.paymentMethod || 'manual',
      notes: orderData.notes || '',
      items: orderData.items.map(item => ({
        ...item,
        productPrice: typeof item.productPrice === 'string' ? 
          parseFloat(item.productPrice.replace(/[^0-9.]/g, '')) : 
          item.productPrice
      })),
      totalAmount: calculatedTotal,
      totalItems: calculatedItems,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      resellerId: orderData.resellerId || undefined,
      resellerRef: orderData.resellerRef || undefined
    };
    
    // Save order to storage
    await saveOrder(order);
    
    // Log activity
    await logActivity({
      type: 'order_created',
      title: `Pesanan Baru #${orderId}`,
      description: `${orderData.customerName} membuat pesanan senilai Rp ${calculatedTotal.toLocaleString('id-ID')} dengan ${calculatedItems} item`,
      metadata: {
        orderId,
        customerName: orderData.customerName,
        totalAmount: calculatedTotal,
        totalItems: calculatedItems,
        resellerRef: orderData.resellerRef
      }
    });
    
    // Log for debugging
    console.log('New order saved:', {
      orderId,
      customer: orderData.customerName,
      total: calculatedTotal,
      items: calculatedItems
    });
    
    return NextResponse.json({
      success: true,
      orderId,
      message: 'Pesanan berhasil dibuat',
      order: {
        id: orderId,
        totalAmount: calculatedTotal,
        totalItems: calculatedItems,
        status: 'pending'
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Order creation error:', error);
    
    // Log error activity
    await logActivity({
      type: 'user_action',
      title: 'Error Checkout',
      description: 'Gagal membuat pesanan - sistem error',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Gagal membuat pesanan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}