<<<<<<< HEAD
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

// GET /api/stories - Get stories (user's stories or stories from followed users)
export async function GET(request: NextRequest) {
  try {
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') // Optional: get stories for specific user
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Calculate expiry time (24 hours from now)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    let where: any = {
      expiresAt: { gt: now },
      createdAt: { gte: twentyFourHoursAgo }
    }

    if (userId) {
      // Get stories for specific user
      where.authorId = userId
    } else {
      // Get stories from user and followed users
      const followedUsers = await db.userFollow.findMany({
        where: { followerId: token.userId },
        select: { followedId: true }
      })

      const followedUserIds = followedUsers.map(f => f.followedId)
      followedUserIds.push(token.userId) // Include user's own stories

      where.authorId = { in: followedUserIds }
    }

    const stories = await db.story.findMany({
      where,
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
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
<<<<<<< HEAD
        views: currentUserId ? {
          where: { userId: currentUserId },
          select: { id: true }
        } : false,
        reactions: {
          select: {
            id: true,
            emoji: true,
            userId: true
=======
        views: {
          select: {
            userId: true,
            viewedAt: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          }
        },
        mentions: {
          include: {
            mentionedUser: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
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
<<<<<<< HEAD
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
=======
      skip,
      take: limit
    })

    const total = await db.story.count({ where })

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/stories - Create a new story
export async function POST(request: NextRequest) {
  try {
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { imageUrl, videoUrl, duration, isPrivate } = await request.json()

    if (!imageUrl && !videoUrl) {
      return NextResponse.json(
        { error: 'Either image URL or video URL is required' },
        { status: 400 }
      )
    }

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

    const story = await db.story.create({
      data: {
        imageUrl,
        videoUrl,
<<<<<<< HEAD
        duration: duration || null,
        expiresAt,
        authorId: userId
=======
        duration,
        authorId: token.userId,
        expiresAt,
        isPrivate: isPrivate || false
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
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
<<<<<<< HEAD
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
=======
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  }
}