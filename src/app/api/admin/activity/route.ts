import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type');
    
    // Get activity logs
    const activityLogs = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });
    
    // Transform to match expected format
    const activities = activityLogs.map(log => ({
      id: log.id.toString(),
      type: 'user_action', // Map from DB action to type
      title: `User Activity`,
      description: log.action,
      timestamp: log.timestamp.toISOString(),
      metadata: {
        userId: log.userId,
        username: log.user.username
      }
    }));
    
    // Add recent transaction activities
    const recentTransactions = await prisma.transaction.findMany({
      include: {
        product: true,
        variant: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    const transactionActivities = recentTransactions.map(transaction => ({
      id: `trans-${transaction.id}`,
      type: 'order_created',
      title: `Pesanan Baru #${transaction.id}`,
      description: `${transaction.customerName} membuat pesanan ${transaction.product.name}${transaction.variant ? ` (${transaction.variant.value})` : ''} senilai Rp ${Number(transaction.totalPrice).toLocaleString('id-ID')}`,
      timestamp: transaction.createdAt.toISOString(),
      metadata: {
        transactionId: transaction.id,
        customerName: transaction.customerName,
        productName: transaction.product.name,
        totalPrice: Number(transaction.totalPrice),
        quantity: transaction.quantity
      }
    }));
    
    // Combine and sort all activities
    const allActivities = [...activities, ...transactionActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return NextResponse.json({
      activities: allActivities,
      total: allActivities.length
    });
    
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil log aktivitas' },
      { status: 500 }
    );
  }
}