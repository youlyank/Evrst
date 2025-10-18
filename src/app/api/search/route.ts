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

// GET /api/search - Search posts, users, and communities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, posts, users, communities
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!q.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit
    const searchTerm = q.trim()

    let results: any = {}

    if (type === 'all' || type === 'posts') {
      // Search threads/posts
      const threads = await db.thread.findMany({
        where: {
          AND: [
            { isDeleted: false },
            {
              OR: [
                { content: { contains: searchTerm } },
                { hashtags: { some: { hashtag: { contains: searchTerm } } } }
              ]
            }
          ]
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
        orderBy: [
          { upvotes: 'desc' },
          { commentCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      })

      const totalThreads = await db.thread.count({
        where: {
          AND: [
            { isDeleted: false },
            {
              OR: [
                { content: { contains: searchTerm } },
                { hashtags: { some: { hashtag: { contains: searchTerm } } } }
              ]
            }
          ]
        }
      })

      results.posts = {
        items: threads,
        total: totalThreads,
        pages: Math.ceil(totalThreads / limit)
      }
    }

    if (type === 'all' || type === 'users') {
      // Search users
      const users = await db.user.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { username: { contains: searchTerm } },
                { displayName: { contains: searchTerm } },
                { bio: { contains: searchTerm } }
              ]
            }
          ]
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          bio: true,
          karma: true,
          isVerified: true,
          isPrivate: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              followedUsers: true
            }
          }
        },
        orderBy: [
          { karma: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      })

      const totalUsers = await db.user.count({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { username: { contains: searchTerm } },
                { displayName: { contains: searchTerm } },
                { bio: { contains: searchTerm } }
              ]
            }
          ]
        }
      })

      results.users = {
        items: users,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    }

    if (type === 'all' || type === 'communities') {
      // Search communities
      const communities = await db.community.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { displayName: { contains: searchTerm } },
            { description: { contains: searchTerm } }
          ]
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              members: true,
              posts: true
            }
          }
        },
        orderBy: [
          { memberCount: 'desc' },
          { postCount: 'desc' }
        ],
        skip,
        take: limit
      })

      const totalCommunities = await db.community.count({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { displayName: { contains: searchTerm } },
            { description: { contains: searchTerm } }
          ]
        }
      })

      results.communities = {
        items: communities,
        total: totalCommunities,
        pages: Math.ceil(totalCommunities / limit)
      }
    }

    // Log search for analytics
    try {
      await db.analyticsEvent.create({
        data: {
          eventType: 'search',
          data: {
            query: searchTerm,
            type,
            resultsCount: Object.values(results).reduce((acc: number, result: any) => acc + (result.total || 0), 0)
          }
        }
      })
    } catch (error) {
      console.error('Failed to log search analytics:', error)
    }

    return NextResponse.json({
      query: searchTerm,
      type,
      results,
      pagination: {
        page,
        limit
      }
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}