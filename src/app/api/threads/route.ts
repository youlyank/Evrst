import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'new' // new, hot, top, trending
    const communityId = searchParams.get('communityId')
    const authorId = searchParams.get('authorId')
    const hashtag = searchParams.get('hashtag')

    const skip = (page - 1) * limit

    let orderBy: any = { createdAt: 'desc' }
    
    if (sort === 'hot') {
      orderBy = [{ upvotes: 'desc' }, { replies: 'desc' }]
    } else if (sort === 'top') {
      orderBy = [{ upvotes: 'desc' }, { reposts: 'desc' }]
    } else if (sort === 'trending') {
      orderBy = [{ views: 'desc' }, { upvotes: 'desc' }]
    }

    const where: any = {}
    
    if (communityId) where.communityId = communityId
    if (authorId) where.authorId = authorId
    if (hashtag) {
      where.hashtags = {
        some: {
          hashtag: hashtag
        }
      }
    }

    const threads = await db.thread.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
            federatedId: true,
            instance: true
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
        hashtags: true,
        mentions: {
          include: {
            mentionedUser: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        },
        liveStream: {
          select: {
            id: true,
            title: true,
            isLive: true,
            viewerCount: true,
            thumbnailUrl: true
          }
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
      threads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching threads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      content, 
      type, 
      authorId, 
      communityId, 
      parentId,
      imageUrl, 
      videoUrl, 
      linkUrl,
      hashtags,
      mentions,
      isSensitive,
      language
    } = await request.json()

    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Content and author ID are required' },
        { status: 400 }
      )
    }

    // Extract hashtags and mentions from content
    const extractedHashtags = content.match(/#(\w+)/g)?.map(tag => tag.slice(1)) || []
    const extractedMentions = content.match(/@(\w+)/g)?.map(mention => mention.slice(1)) || []

    const thread = await db.thread.create({
      data: {
        content,
        type: type || 'TEXT',
        authorId,
        communityId,
        parentId,
        imageUrl,
        videoUrl,
        linkUrl,
        isSensitive: isSensitive || false,
        language: language || 'en',
        hashtags: {
          create: [
            ...new Set([...(hashtags || []), ...extractedHashtags])
          ].map(hashtag => ({ hashtag }))
        },
        mentions: {
          create: extractedMentions.map(username => ({
            mentionedUser: {
              connect: {
                username: username
              }
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true,
            federatedId: true
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
        hashtags: true,
        mentions: {
          include: {
            mentionedUser: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      }
    })

    // TODO: Send to federation layer (ActivityPub)
    // TODO: Index in ElasticSearch
    // TODO: Send real-time updates via WebSocket

    return NextResponse.json(thread, { status: 201 })
  } catch (error) {
    console.error('Error creating thread:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}