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

// POST /api/communities/[id]/join - Join a community
export async function POST(
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

    // Check if community exists
    const community = await db.community.findUnique({
      where: { id: params.id }
    })

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMember = await db.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: token.userId,
          communityId: params.id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this community' },
        { status: 409 }
      )
    }

    // Add user as member
    await db.communityMember.create({
      data: {
        userId: token.userId,
        communityId: params.id,
        role: 'MEMBER'
      }
    })

    // Update community member count
    await db.community.update({
      where: { id: params.id },
      data: { memberCount: { increment: 1 } }
    })

    return NextResponse.json({
      message: 'Successfully joined community'
    })

  } catch (error) {
    console.error('Join community error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id]/join - Leave a community
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

    // Check if user is a member
    const existingMember = await db.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: token.userId,
          communityId: params.id
        }
      }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Not a member of this community' },
        { status: 404 }
      )
    }

    // Remove moderator role if user is moderator
    await db.communityModerator.deleteMany({
      where: {
        userId: token.userId,
        communityId: params.id
      }
    })

    // Remove membership
    await db.communityMember.delete({
      where: {
        userId_communityId: {
          userId: token.userId,
          communityId: params.id
        }
      }
    })

    // Update community member count
    await db.community.update({
      where: { id: params.id },
      data: { memberCount: { decrement: 1 } }
    })

    return NextResponse.json({
      message: 'Successfully left community'
    })

  } catch (error) {
    console.error('Leave community error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}