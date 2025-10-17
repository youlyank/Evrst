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

// POST /api/stories/[id]/react - React to a story
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

    const { emoji } = await request.json()

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji is required' },
        { status: 400 }
      )
    }

    // Check if story exists and hasn't expired
    const story = await db.story.findUnique({
      where: { id: params.id }
    })

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Story has expired' },
        { status: 410 }
      )
    }

    // Check if user can react to private story
    if (story.isPrivate && story.authorId !== token.userId) {
      // Check if user follows the story author
      const isFollowing = await db.userFollow.findUnique({
        where: {
          followerId_followedId: {
            followerId: token.userId,
            followedId: story.authorId
          }
        }
      })

      if (!isFollowing) {
        return NextResponse.json(
          { error: 'Cannot react to private story' },
          { status: 403 }
        )
      }
    }

    // Check if user already reacted with this emoji
    const existingReaction = await db.storyReaction.findUnique({
      where: {
        storyId_userId_emoji: {
          storyId: params.id,
          userId: token.userId,
          emoji
        }
      }
    })

    if (existingReaction) {
      // Remove reaction if same emoji
      await db.storyReaction.delete({
        where: { id: existingReaction.id }
      })

      return NextResponse.json({
        message: 'Reaction removed',
        emoji
      })
    } else {
      // Remove any existing reactions from this user on this story
      await db.storyReaction.deleteMany({
        where: {
          storyId: params.id,
          userId: token.userId
        }
      })

      // Create new reaction
      const reaction = await db.storyReaction.create({
        data: {
          storyId: params.id,
          userId: token.userId,
          emoji
        },
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
      })

      return NextResponse.json({
        message: 'Reaction added',
        reaction
      })
    }

  } catch (error) {
    console.error('React to story error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}