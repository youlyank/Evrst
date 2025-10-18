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
    const communityId = searchParams.get('communityId')
    const sort = searchParams.get('sort') || 'new' // new, hot, top
    const userId = searchParams.get('userId') // For user-specific feed

    const skip = (page - 1) * limit

    let orderBy: any = { createdAt: 'desc' }
    
    if (sort === 'hot') {
      orderBy = [{ upvotes: 'desc' }, { commentCount: 'desc' }]
    } else if (sort === 'top') {
      orderBy = [{ upvotes: 'desc' }, { createdAt: 'desc' }]
    }

    const where: any = { isDeleted: false }
    if (communityId) where.communityId = communityId
    if (userId) where.authorId = userId

    const threads = await db.thread.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            karma: true,
            isVerified: true
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
            color: true
          }
        },
        media: true,
        hashtags: {
          select: { hashtag: true }
        },
        _count: {
          select: {
            comments: true,
            votes: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    const total = await db.thread.count({ where })

    return NextResponse.json({
      posts: threads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
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

    const { content, type, communityId, parentId, imageUrl, videoUrl, linkUrl, isSensitive } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Extract mentions and hashtags from content
    const mentions = content.match(/@(\w+)/g)?.map(mention => mention.substring(1)) || []
    const hashtags = content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || []

    const thread = await db.thread.create({
      data: {
        content,
        type: type || 'TEXT',
        authorId: token.userId,
        communityId,
        parentId,
        imageUrl,
        videoUrl,
        linkUrl,
        isSensitive: isSensitive || false,
        mentions: {
          create: mentions.map(async (username) => {
            const mentionedUser = await db.user.findUnique({ where: { username } })
            if (mentionedUser) {
              return { mentionedUserId: mentionedUser.id }
            }
            return null
          }).filter(Boolean)
        },
        hashtags: {
          create: hashtags.map(hashtag => ({ hashtag }))
        }
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
        hashtags: true,
        mentions: {
          include: {
            mentionedUser: {
              select: { username: true, displayName: true }
            }
          }
        }
      }
    })

    return NextResponse.json(thread, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}