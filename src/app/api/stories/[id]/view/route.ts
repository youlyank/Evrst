<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
=======
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'REPLACE_WITH_ACTUAL_JWT_SECRET_BEFORE_DEPLOYMENT'

// Helper function to verify JWT token
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

// POST /api/stories/[id]/view - Mark story as viewed
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
<<<<<<< HEAD
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
=======
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if story exists and hasn't expired
    const story = await db.story.findUnique({
      where: { id: params.id }
    })

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Story has expired' },
        { status: 410 }
      )
    }

    // Check if user can view private story
    if (story.isPrivate && story.authorId !== token.userId) {
      // Check if user follows the story author
      const isFollowing = await db.userFollow.findUnique({
        where: {
          followerId_followedId: {
            followerId: token.userId,
            followedId: story.authorId
          }
        }
      })

      if (!isFollowing) {
        return NextResponse.json(
          { error: 'Cannot view private story' },
          { status: 403 }
        )
      }
    }

    // Check if already viewed
    const existingView = await db.storyView.findUnique({
      where: {
        userId_storyId: {
          userId: token.userId,
          storyId: params.id
        }
      }
    })

    if (existingView) {
      return NextResponse.json({
        message: 'Story already viewed',
        viewedAt: existingView.viewedAt
      })
    }

    // Create view record
    const view = await db.storyView.create({
      data: {
        userId: token.userId,
        storyId: params.id
      }
    })

    // Update story view count
    await db.story.update({
      where: { id: params.id },
      data: { viewers: { increment: 1 } }
    })

    return NextResponse.json({
      message: 'Story marked as viewed',
      viewedAt: view.viewedAt
    })

  } catch (error) {
    console.error('View story error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  }
}