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

// GET /api/posts/[id] - Get single post with replies
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const thread = await db.thread.findUnique({
      where: { id: params.id, isDeleted: false },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            karma: true,
            isVerified: true,
            bio: true
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
            color: true,
            description: true
          }
        },
        media: true,
        hashtags: {
          select: { hashtag: true }
        },
        mentions: {
          include: {
            mentionedUser: {
              select: { username: true, displayName: true }
            }
          }
        },
        replies: {
          where: { isDeleted: false },
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
            media: true,
            _count: {
              select: {
                votes: true,
                replies: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      }
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await db.thread.update({
      where: { id: params.id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({ post: thread })

  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, isSensitive } = await request.json()

    // Check if user owns the post
    const existingThread = await db.thread.findUnique({
      where: { id: params.id }
    })

    if (!existingThread) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (existingThread.authorId !== token.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const updatedThread = await db.thread.update({
      where: { id: params.id },
      data: {
        ...(content !== undefined && { content }),
        ...(isSensitive !== undefined && { isSensitive })
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
        },
        community: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true
          }
        },
        media: true,
        hashtags: true
      }
    })

    return NextResponse.json({
      message: 'Post updated successfully',
      post: updatedThread
    })

  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the post
    const existingThread = await db.thread.findUnique({
      where: { id: params.id }
    })

    if (!existingThread) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (existingThread.authorId !== token.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Soft delete
    await db.thread.update({
      where: { id: params.id },
      data: { isDeleted: true }
    })

    return NextResponse.json({
      message: 'Post deleted successfully'
    })

  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}