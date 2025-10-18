import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/stories/expired - Clean up expired stories
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // This endpoint should be protected by a cron job secret
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    
    // Delete expired stories
    const result = await db.story.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    console.log(`Cleaned up ${result.count} expired stories`);

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count,
      timestamp: now
    });
  } catch (error) {
    console.error('Error cleaning up expired stories:', error);
    return NextResponse.json(
      { error: 'Failed to clean up expired stories' },
      { status: 500 }
    );
  }
}