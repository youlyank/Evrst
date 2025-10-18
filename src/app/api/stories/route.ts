import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { getRealtimeServer } from '@/lib/realtime-server';

// GET /api/stories/active - Get active stories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    let currentUserId = null;
    if (token) {
      try {
        const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;
        currentUserId = decoded.userId;
      } catch (error) {
        // Invalid token, continue as anonymous
      }
    }

    const now = new Date();
    
    // Build where clause
    const whereClause: any = {
      expiresAt: { gt: now },
      author: { isActive: true }
    };

    if (userId) {
      whereClause.authorId = userId;
    } else if (currentUserId) {
      // Get stories from followed users and own stories
      const follows = await db.userFollow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true }
      });
      
      const followedIds = follows.map(f => f.followingId);
      followedIds.push(currentUserId); // Include own stories
      
      whereClause.authorId = { in: followedIds };
    }

    const stories = await db.story.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true
          }
        },
        views: currentUserId ? {
          where: { userId: currentUserId },
          select: { id: true }
        } : false,
        reactions: {
          select: {
            id: true,
            emoji: true,
            userId: true
          }
        },
        _count: {
          select: {
            views: true,
            reactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Format stories
    const formattedStories = stories.map(story => ({
      id: story.id,
      imageUrl: story.imageUrl,
      videoUrl: story.videoUrl,
      duration: story.duration,
      expiresAt: story.expiresAt,
      createdAt: story.createdAt,
      author: story.author,
      isViewed: currentUserId && story.views && story.views.length > 0,
      viewCount: story._count.views,
      reactionCount: story._count.reactions,
      reactions: story.reactions.reduce((acc, reaction) => {
        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      userReaction: story.reactions.find(r => r.userId === currentUserId)?.emoji || null
    }));

    return NextResponse.json(formattedStories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// POST /api/stories/create - Create a new story
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { imageUrl, videoUrl, duration } = body;

    if (!imageUrl && !videoUrl) {
      return NextResponse.json(
        { error: 'Either imageUrl or videoUrl is required' },
        { status: 400 }
      );
    }

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await db.story.create({
      data: {
        imageUrl,
        videoUrl,
        duration: duration || null,
        expiresAt,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true
          }
        }
      }
    });

    // Broadcast new story to followers
    try {
      const realtimeServer = getRealtimeServer();
      realtimeServer.broadcastNewStory(story);
    } catch (error) {
      console.error('Error broadcasting story:', error);
    }

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}