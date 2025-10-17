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
            content: true,
            upvotes: true,
            commentCount: true,
            views: true
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

    const { 
      title, 
      description, 
      category, 
      tags, 
      quality, 
      latency, 
      maxViewers,
      isPrivate,
      scheduledFor
    } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Generate unique stream key
    const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create live stream
    const liveStream = await db.liveStream.create({
      data: {
        title,
        description,
        category,
        tags: JSON.stringify(tags || []),
        streamKey,
        streamerId: token.userId,
        quality: quality || '720p',
        latency: latency || 'low',
        maxViewers,
        isPrivate: isPrivate || false,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null
      },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            displayName: true,
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
  }
}