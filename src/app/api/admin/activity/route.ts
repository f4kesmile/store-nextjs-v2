import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type');
    
    const where: any = {};
    if (type && type !== 'all') where.type = type;

    const activityLogs = await prisma.activityLog.findMany({
      where,
      include: { user: { select: { username: true, email: true, role: { select: { name: true } } } } },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    const activities = activityLogs.map(log => ({
      id: log.id.toString(),
      type: log.type,
      title: log.title || 'Aktivitas',
      description: log.description || log.action,
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata ?? null,
      user: log.user ? {
        username: log.user.username,
        email: log.user.email,
        role: { name: log.user.role?.name || 'SYSTEM' }
      } : null
    }));

    return NextResponse.json({ activities, total: activities.length });
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    return NextResponse.json({ error: 'Gagal mengambil log aktivitas' }, { status: 500 });
  }
}