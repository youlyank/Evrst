<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { getRealtimeServer } from '@/lib/realtime-server';
import ZAI from 'z-ai-web-dev-sdk';

// GET /api/live-streams - Get active and scheduled streams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // 'live', 'scheduled', 'all'
    const userId = searchParams.get('userId');

    const whereClause: any = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (userId) {
      whereClause.streamerId = userId;
    }
    
    if (status === 'live') {
      whereClause.isLive = true;
    } else if (status === 'scheduled') {
      whereClause.isLive = false;
      whereClause.scheduledFor = { gt: new Date() };
    }

    const streams = await db.liveStream.findMany({
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const isLive = searchParams.get('isLive')
    const userId = searchParams.get('userId') // For user-specific streams

    const skip = (page - 1) * limit

    const where: any = {}
    if (category) where.category = category
    if (isLive !== null) where.isLive = isLive === 'true'
    if (userId) where.streamerId = userId

    const streams = await db.liveStream.findMany({
      where,
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true
          }
        },
        thread: {
          select: {
            id: true,
<<<<<<< HEAD
            communityId: true,
            upvotes: true,
            commentCount: true
=======
            content: true,
            upvotes: true,
            commentCount: true,
            views: true
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
          }
        },
        _count: {
          select: {
            views: true,
            chat: true
          }
        }
      },
      orderBy: [
        { isLive: 'desc' },
        { viewerCount: 'desc' },
        { startedAt: 'desc' }
      ],
<<<<<<< HEAD
      take: 50
    });

    return NextResponse.json(streams);
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live streams' },
      { status: 500 }
    );
  }
}

// POST /api/live-streams - Create a new live stream
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
=======
      skip,
      take: limit
    })

    const total = await db.liveStream.count({ where })

    return NextResponse.json({
      streams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching live streams:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
    const { 
      title, 
      description, 
      category, 
      tags, 
<<<<<<< HEAD
      isPrivate, 
      maxViewers, 
      quality, 
      latency,
      scheduledFor,
      communityId 
    } = body;
=======
      quality, 
      latency, 
      maxViewers,
      isPrivate,
      scheduledFor
    } = await request.json()
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
<<<<<<< HEAD
      );
    }

    // Generate unique stream key
    const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create thread for the stream if community is specified
    let threadId: string | undefined = undefined;
    if (communityId) {
      const thread = await db.thread.create({
        data: {
          content: `🔴 **LIVE NOW**: ${title}\n\n${description || ''}`,
          type: 'TEXT',
          authorId: userId,
          communityId,
          linkUrl: `/live/${streamKey}`
        }
      });
      threadId = thread.id;
    }

    const stream = await db.liveStream.create({
=======
      )
    }

    // Generate unique stream key
    const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create live stream
    const liveStream = await db.liveStream.create({
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
      data: {
        title,
        description,
        category,
        tags: JSON.stringify(tags || []),
<<<<<<< HEAD
        isPrivate: isPrivate || false,
        maxViewers,
        quality: quality || '720p',
        latency: latency || 'low',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        streamKey,
        streamerId: userId,
        thread: threadId ? { connect: { id: threadId } } : undefined
=======
        streamKey,
        streamerId: token.userId,
        quality: quality || '720p',
        latency: latency || 'low',
        maxViewers,
        isPrivate: isPrivate || false,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
      },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
<<<<<<< HEAD
            avatar: true,
            isVerified: true
          }
        },
        thread: {
          select: {
            id: true,
            communityId: true
          }
        }
      }
    });

    // Generate stream thumbnail using AI if no thumbnail provided
    if (!body.thumbnailUrl) {
      try {
        const zai = await ZAI.create();
        const imageResponse = await zai.images.generations.create({
          prompt: `Professional live streaming thumbnail for "${title}" in category ${category || 'general'}, high quality, vibrant colors`,
          size: '1024x1024'
        });

        if (imageResponse.data && imageResponse.data[0]) {
          const thumbnailBase64 = imageResponse.data[0].base64;
          // In production, you would upload this to a storage service
          // For now, we'll store a placeholder URL
          await db.liveStream.update({
            where: { id: stream.id },
            data: {
              thumbnailUrl: `data:image/png;base64,${thumbnailBase64}`
            }
          });
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    }

    // Broadcast stream start if going live immediately
    if (!scheduledFor) {
      try {
        const realtimeServer = getRealtimeServer();
        realtimeServer.broadcastStreamStart(stream);
      } catch (error) {
        console.error('Error broadcasting stream start:', error);
      }
    }

    return NextResponse.json(stream, { status: 201 });
  } catch (error) {
    console.error('Error creating live stream:', error);
    return NextResponse.json(
      { error: 'Failed to create live stream' },
      { status: 500 }
    );
=======
            avatar: true
          }
        }
      }
    })

    // Create associated thread for the stream
    const thread = await db.thread.create({
      data: {
        content: `🔴 **LIVE NOW**: ${title}\n\n${description || ''}\n\nJoin the stream: https://elk.zone/live/${liveStream.id}`,
        type: 'LIVE',
        authorId: token.userId,
        hashtags: {
          create: [
            { hashtag: 'LiveStream' },
            { hashtag: category || 'Streaming' }
          ]
        }
      }
    })

    // Update live stream with thread reference
    await db.liveStream.update({
      where: { id: liveStream.id },
      data: { threadId: thread.id }
    })

    // TODO: Configure PeerTube/RTMP server
    // TODO: Set up Matrix room for chat
    // TODO: Notify followers
    // TODO: Index in ElasticSearch

    return NextResponse.json({ ...liveStream, thread }, { status: 201 })
  } catch (error) {
    console.error('Error creating live stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  }
}