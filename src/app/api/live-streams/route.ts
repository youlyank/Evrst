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
            communityId: true,
            upvotes: true,
            commentCount: true
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
    const { 
      title, 
      description, 
      category, 
      tags, 
      isPrivate, 
      maxViewers, 
      quality, 
      latency,
      scheduledFor,
      communityId 
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
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
      data: {
        title,
        description,
        category,
        tags: JSON.stringify(tags || []),
        isPrivate: isPrivate || false,
        maxViewers,
        quality: quality || '720p',
        latency: latency || 'low',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        streamKey,
        streamerId: userId,
        thread: threadId ? { connect: { id: threadId } } : undefined
      },
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
  }
}