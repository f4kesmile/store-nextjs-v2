import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type');
    
    // Build where clause
    const where: any = {};
    if (type && type !== 'all') {
      where.type = type;
    }
    
    // Get activity logs from database
    const activityLogs = await prisma.activityLog.findMany({
      where,
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
    
    // Transform to expected format
    const activities = activityLogs.map(log => ({
      id: log.id.toString(),
      type: log.type,
      title: log.title,
      description: log.description,
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata,
      user: log.user ? {
        username: log.user.username,
        email: log.user.email
      } : null
    }));
    
    return NextResponse.json({
      activities,
      total: activities.length
    });
    
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil log aktivitas' },
      { status: 500 }
    );
  }
}