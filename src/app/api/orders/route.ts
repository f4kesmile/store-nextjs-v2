import { NextRequest, NextResponse } from "next/server";

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
    
    // Generate order ID (in production, use proper ID generation)
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create order object
    const order = {
      id: orderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      paymentMethod: orderData.paymentMethod,
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
      createdAt: new Date().toISOString(),
      resellerId: orderData.resellerId || null,
      resellerRef: orderData.resellerRef || null
    };
    
    // TODO: Save to database
    // await prisma.order.create({ data: order });
    
    // TODO: Send confirmation email
    // await sendOrderConfirmationEmail(order);
    
    // TODO: Notify admin/reseller
    // await notifyNewOrder(order);
    
    // Log order for debugging
    console.log('New order created:', {
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
    return NextResponse.json(
      { error: 'Gagal membuat pesanan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}