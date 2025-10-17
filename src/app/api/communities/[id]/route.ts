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

// GET /api/communities/[id] - Get single community
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const community = await db.community.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            karma: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                karma: true
              }
            }
          },
          orderBy: { joinedAt: 'desc' },
          take: 10
        },
        moderators: {
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
        flairs: {
          where: { isEnabled: true },
          orderBy: { createdAt: 'asc' }
        },
        events: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' },
          take: 5
        },
        _count: {
          select: {
            members: true,
            posts: true,
            subscribers: true
          }
        }
      }
    })

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ community })

  } catch (error) {
    console.error('Get community error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/communities/[id] - Update community
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

    const { displayName, description, icon, banner, rules, isPrivate, isNSFW, color } = await request.json()

    // Check if user is moderator or owner
    const moderator = await db.communityModerator.findUnique({
      where: {
        userId_communityId: {
          userId: token.userId,
          communityId: params.id
        }
      }
    })

    if (!moderator) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const updatedCommunity = await db.community.update({
      where: { id: params.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(banner !== undefined && { banner }),
        ...(rules !== undefined && { rules }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(isNSFW !== undefined && { isNSFW }),
        ...(color !== undefined && { color })
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Community updated successfully',
      community: updatedCommunity
    })

  } catch (error) {
    console.error('Update community error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id] - Delete community
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

    // Check if user is the creator
    const community = await db.community.findUnique({
      where: { id: params.id }
    })

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    if (community.creatorId !== token.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await db.community.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Community deleted successfully'
    })

  } catch (error) {
    console.error('Delete community error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}