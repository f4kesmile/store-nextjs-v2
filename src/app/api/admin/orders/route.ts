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
    
    // Get transactions with related data
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        product: true,
        variant: true,
        reseller: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    });
    
    // Get total count
    const totalCount = await prisma.transaction.count({ where });
    
    // Group transactions by customer and created time (simulate orders)
    const orderGroups = new Map();
    
    transactions.forEach(transaction => {
      const orderKey = `${transaction.customerName}-${transaction.createdAt.toISOString().split('T')[0]}`;
      
      if (!orderGroups.has(orderKey)) {
        orderGroups.set(orderKey, {
          id: `${transaction.customerName.replace(/\s+/g, '-').toLowerCase()}-${transaction.id}`,
          customerName: transaction.customerName,
          customerEmail: '', // We'll need to add this to Transaction model
          customerPhone: transaction.customerPhone,
          totalAmount: 0,
          totalItems: 0,
          status: transaction.status.toLowerCase(),
          createdAt: transaction.createdAt.toISOString(),
          items: [],
          resellerRef: transaction.reseller?.uniqueId || null
        });
      }
      
      const order = orderGroups.get(orderKey);
      order.totalAmount += Number(transaction.totalPrice);
      order.totalItems += transaction.quantity;
      order.items.push({
        productId: transaction.productId,
        productName: transaction.product.name,
        variantName: transaction.variant?.name,
        variantValue: transaction.variant?.value,
        quantity: transaction.quantity,
        price: Number(transaction.totalPrice),
        notes: transaction.notes
      });
    });
    
    const orders = Array.from(orderGroups.values());
    
    // Calculate summary statistics
    const allTransactions = await prisma.transaction.findMany({
      select: {
        totalPrice: true,
        status: true
      }
    });
    
    const summary = {
      totalOrders: orderGroups.size,
      totalRevenue: allTransactions
        .filter(t => t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Number(t.totalPrice), 0),
      pendingOrders: allTransactions.filter(t => t.status === 'PENDING').length,
      completedOrders: allTransactions.filter(t => t.status === 'COMPLETED').length
    };
    
    return NextResponse.json({
      orders,
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