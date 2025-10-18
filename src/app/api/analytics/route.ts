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

// GET /api/analytics - Get analytics data
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
    const type = searchParams.get('type') || 'overview'
    const period = searchParams.get('period') || '7d' // 1d, 7d, 30d, 90d

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    let analytics: any = {}

    switch (type) {
      case 'overview':
        // General platform statistics
        const [
          totalUsers,
          activeUsers,
          totalPosts,
          totalCommunities,
          totalLiveStreams,
          activeLiveStreams
        ] = await Promise.all([
          db.user.count({ where: { isActive: true } }),
          db.user.count({
            where: {
              isActive: true,
              lastActiveAt: { gte: startDate }
            }
          }),
          db.thread.count({
            where: {
              isDeleted: false,
              createdAt: { gte: startDate }
            }
          }),
          db.community.count(),
          db.liveStream.count(),
          db.liveStream.count({ where: { isLive: true } })
        ])

        analytics = {
          users: {
            total: totalUsers,
            active: activeUsers,
            growth: await calculateGrowth('users', startDate, now)
          },
          content: {
            posts: totalPosts,
            communities: totalCommunities,
            growth: await calculateGrowth('posts', startDate, now)
          },
          streaming: {
            totalStreams: totalLiveStreams,
            activeStreams: activeLiveStreams,
            growth: await calculateGrowth('streams', startDate, now)
          }
        }
        break

      case 'trending':
        // Trending topics and content
        const trendingTopics = await db.trendingTopic.findMany({
          where: {
            startedAt: { gte: startDate }
          },
          orderBy: [
            { posts: 'desc' },
            { growth: 'desc' }
          ],
          take: 10
        })

        const topPosts = await db.thread.findMany({
          where: {
            isDeleted: false,
            createdAt: { gte: startDate }
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true
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
            _count: {
              select: {
                comments: true,
                votes: true
              }
            }
          },
          orderBy: [
            { upvotes: 'desc' },
            { commentCount: 'desc' }
          ],
          take: 10
        })

        analytics = {
          topics: trendingTopics,
          posts: topPosts
        }
        break

      case 'engagement':
        // User engagement metrics
        const engagementData = await db.analyticsEvent.groupBy({
          by: ['eventType'],
          where: {
            timestamp: { gte: startDate }
          },
          _count: {
            id: true
          }
        })

        const totalEvents = engagementData.reduce((sum, event) => sum + event._count.id, 0)

        analytics = {
          events: engagementData.map(event => ({
            type: event.eventType,
            count: event._count.id,
            percentage: totalEvents > 0 ? (event._count.id / totalEvents) * 100 : 0
          })),
          totalEvents
        }
        break

      case 'growth':
        // Growth metrics over time
        analytics = {
          users: await getGrowthData('users', startDate, now),
          posts: await getGrowthData('posts', startDate, now),
          communities: await getGrowthData('communities', startDate, now)
        }
        break
    }

    return NextResponse.json({
      type,
      period,
      dateRange: {
        start: startDate,
        end: now
      },
      analytics
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to calculate growth percentage
async function calculateGrowth(type: string, startDate: Date, endDate: Date) {
  try {
    const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
    
    let currentCount: number
    let previousCount: number

    switch (type) {
      case 'users':
        currentCount = await db.user.count({
          where: { createdAt: { gte: startDate, lte: endDate } }
        })
        previousCount = await db.user.count({
          where: { createdAt: { gte: previousStartDate, lte: startDate } }
        })
        break
      case 'posts':
        currentCount = await db.thread.count({
          where: { 
            isDeleted: false,
            createdAt: { gte: startDate, lte: endDate } 
          }
        })
        previousCount = await db.thread.count({
          where: { 
            isDeleted: false,
            createdAt: { gte: previousStartDate, lte: startDate } 
          }
        })
        break
      case 'streams':
        currentCount = await db.liveStream.count({
          where: { createdAt: { gte: startDate, lte: endDate } }
        })
        previousCount = await db.liveStream.count({
          where: { createdAt: { gte: previousStartDate, lte: startDate } }
        })
        break
      default:
        return 0
    }

    if (previousCount === 0) return currentCount > 0 ? 100 : 0
    return ((currentCount - previousCount) / previousCount) * 100
  } catch (error) {
    console.error('Error calculating growth:', error)
    return 0
  }
}

// Helper function to get growth data over time
async function getGrowthData(type: string, startDate: Date, endDate: Date) {
  try {
    // This is a simplified version - in production you'd want more sophisticated time-based grouping
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const data = []

    for (let i = 0; i < daysDiff; i++) {
      const dayStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      let count: number

      switch (type) {
        case 'users':
          count = await db.user.count({
            where: { 
              createdAt: { gte: dayStart, lte: dayEnd }
            }
          })
          break
        case 'posts':
          count = await db.thread.count({
            where: { 
              isDeleted: false,
              createdAt: { gte: dayStart, lte: dayEnd }
            }
          })
          break
        case 'communities':
          count = await db.community.count({
            where: { 
              createdAt: { gte: dayStart, lte: dayEnd }
            }
          })
          break
        default:
          count = 0
      }

      data.push({
        date: dayStart.toISOString().split('T')[0],
        count
      })
    }

    return data
  } catch (error) {
    console.error('Error getting growth data:', error)
    return []
  }
}