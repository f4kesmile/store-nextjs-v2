import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    
    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    // Get orders with items
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        reseller: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    });
    
    // Get total count
    const totalCount = await prisma.order.count({ where });
    
    // Transform orders to expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      totalAmount: Number(order.totalAmount),
      totalItems: order.totalItems,
      status: order.status.toLowerCase(),
      createdAt: order.createdAt.toISOString(),
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        variantName: item.variant?.name,
        variantValue: item.variant?.value,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        notes: item.notes
      })),
      reseller: order.reseller ? {
        name: order.reseller.name,
        uniqueId: order.reseller.uniqueId,
        whatsappNumber: order.reseller.whatsappNumber
      } : null
    }));
    
    // Calculate summary statistics
    const allOrders = await prisma.order.findMany({
      select: {
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const summary = {
      totalOrders: allOrders.length,
      totalRevenue: allOrders
        .filter(order => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + Number(order.totalAmount), 0),
      pendingOrders: allOrders.filter(order => order.status === 'PENDING').length,
      completedOrders: allOrders.filter(order => order.status === 'COMPLETED').length,
      todayOrders: allOrders.filter(order => 
        order.createdAt >= today
      ).length
    };
    
    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: (page * limit) < totalCount
      },
      summary
    });
    
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
      { status: 500 }
    );
  }
}