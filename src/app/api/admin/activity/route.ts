import { NextRequest, NextResponse } from "next/server";
import { getActivityLogs } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type');
    
    let activities = await getActivityLogs(limit);
    
    // Filter by type if provided
    if (type && type !== 'all') {
      activities = activities.filter(activity => activity.type === type);
    }
    
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