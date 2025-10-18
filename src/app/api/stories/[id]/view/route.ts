import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';

// POST /api/stories/[id]/view - Mark story as viewed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;
    const userId = decoded.userId;
    const storyId = params.id;

    // Check if story exists and is not expired
    const story = await db.story.findUnique({
      where: { id: storyId },
      select: { id: true, expiresAt: true }
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    if (story.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Story has expired' }, { status: 410 });
    }

    // Create or update view record
    const view = await db.storyView.upsert({
      where: {
        userId_storyId: {
          userId,
          storyId
        }
      },
      update: {
        viewedAt: new Date()
      },
      create: {
        userId,
        storyId
      }
    });

    // Update view count
    await db.story.update({
      where: { id: storyId },
      data: {
        viewers: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true, viewedAt: view.viewedAt });
  } catch (error) {
    console.error('Error marking story as viewed:', error);
    return NextResponse.json(
      { error: 'Failed to mark story as viewed' },
      { status: 500 }
    );
  }
}