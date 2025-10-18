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

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        banner: true,
        bio: true,
        karma: true,
        isVerified: true,
        isActive: true,
        isPrivate: true,
        createdAt: true,
        lastActiveAt: true,
        // Counts
        _count: {
          select: {
            posts: true,
            followedUsers: true,
            followers: true,
            createdCommunities: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = verifyToken(request)
    if (!token || token.userId !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { displayName, bio, avatar, banner, theme, language, timezone, notificationsEnabled } = await request.json()

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(banner !== undefined && { banner }),
        ...(theme !== undefined && { theme }),
        ...(language !== undefined && { language }),
        ...(timezone !== undefined && { timezone }),
        ...(notificationsEnabled !== undefined && { notificationsEnabled })
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        banner: true,
        bio: true,
        theme: true,
        language: true,
        timezone: true,
        notificationsEnabled: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}