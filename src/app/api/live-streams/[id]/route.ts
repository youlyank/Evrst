import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { getRealtimeServer } from '@/lib/realtime-server';

// GET /api/live-streams/[id] - Get specific stream details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stream = await db.liveStream.findUnique({
      where: { id: params.id },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
            bio: true
          }
        },
        thread: {
          include: {
            community: {
              select: {
                id: true,
                name: true,
                displayName: true,
                icon: true
              }
            }
          }
        },
        views: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          },
          orderBy: { joinedAt: 'desc' },
          take: 50
        },
        chat: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        _count: {
          select: {
            views: true,
            chat: true
          }
        }
      }
    });

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    return NextResponse.json(stream);
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream' },
      { status: 500 }
    );
  }
}

// PUT /api/live-streams/[id] - Update stream
export async function PUT(
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

    const body = await request.json();
    const { title, description, category, tags, isPrivate, maxViewers } = body;

    // Check if user owns the stream
    const existingStream = await db.liveStream.findUnique({
      where: { id: params.id },
      select: { streamerId: true }
    });

    if (!existingStream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (existingStream.streamerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (maxViewers !== undefined) updateData.maxViewers = maxViewers;

    const stream = await db.liveStream.update({
      where: { id: params.id },
      data: updateData,
      include: {
        streamer: {
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

    return NextResponse.json(stream);
  } catch (error) {
    console.error('Error updating stream:', error);
    return NextResponse.json(
      { error: 'Failed to update stream' },
      { status: 500 }
    );
  }
}

// DELETE /api/live-streams/[id] - End/delete stream
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

    // Check if user owns the stream
    const existingStream = await db.liveStream.findUnique({
      where: { id: params.id },
      select: { streamerId: true, isLive: true }
    });

    if (!existingStream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (existingStream.streamerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // End the stream
    const stream = await db.liveStream.update({
      where: { id: params.id },
      data: {
        isLive: false,
        endedAt: new Date()
      }
    });

    // Broadcast stream end
    try {
      const realtimeServer = getRealtimeServer();
      realtimeServer.broadcastStreamEnd(params.id);
    } catch (error) {
      console.error('Error broadcasting stream end:', error);
    }

    return NextResponse.json({ success: true, stream });
  } catch (error) {
    console.error('Error ending stream:', error);
    return NextResponse.json(
      { error: 'Failed to end stream' },
      { status: 500 }
    );
  }
}