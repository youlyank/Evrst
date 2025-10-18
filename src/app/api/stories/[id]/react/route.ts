import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';

// POST /api/stories/[id]/react - Add reaction to story
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

    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Check if story exists and is not expired
    const story = await db.story.findUnique({
      where: { id: storyId },
      select: { id: true, expiresAt: true, authorId: true }
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    if (story.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Story has expired' }, { status: 410 });
    }

    // Remove existing reaction (if any) and add new one
    await db.storyReaction.deleteMany({
      where: {
        storyId,
        userId
      }
    });

    const reaction = await db.storyReaction.create({
      data: {
        storyId,
        userId,
        emoji
      }
    });

    return NextResponse.json({ success: true, reaction });
  } catch (error) {
    console.error('Error adding story reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/stories/[id]/react - Remove reaction from story
export async function DELETE(
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

    await db.storyReaction.deleteMany({
      where: {
        storyId,
        userId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing story reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}