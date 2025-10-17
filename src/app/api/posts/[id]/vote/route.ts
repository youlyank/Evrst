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

// POST /api/posts/[id]/vote - Vote on a post
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

    const { type } = await request.json() // 'UPVOTE' or 'DOWNVOTE'

    if (!type || !['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    // Check if post exists
    const thread = await db.thread.findUnique({
      where: { id: params.id, isDeleted: false }
    })

    if (!thread) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await db.vote.findUnique({
      where: {
        userId_threadId: {
          userId: token.userId,
          threadId: params.id
        }
      }
    })

    let updatedThread

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await db.vote.delete({
          where: { id: existingVote.id }
        })

        // Update vote counts
        if (type === 'UPVOTE') {
          updatedThread = await db.thread.update({
            where: { id: params.id },
            data: { upvotes: { decrement: 1 } }
          })
        } else {
          updatedThread = await db.thread.update({
            where: { id: params.id },
            data: { downvotes: { decrement: 1 } }
          })
        }
      } else {
        // Change vote type
        await db.vote.update({
          where: { id: existingVote.id },
          data: { type }
        })

        // Update vote counts
        if (type === 'UPVOTE') {
          updatedThread = await db.thread.update({
            where: { id: params.id },
            data: {
              upvotes: { increment: 1 },
              downvotes: { decrement: 1 }
            }
          })
        } else {
          updatedThread = await db.thread.update({
            where: { id: params.id },
            data: {
              upvotes: { decrement: 1 },
              downvotes: { increment: 1 }
            }
          })
        }
      }
    } else {
      // Create new vote
      await db.vote.create({
        data: {
          type,
          userId: token.userId,
          threadId: params.id
        }
      })

      // Update vote counts
      if (type === 'UPVOTE') {
        updatedThread = await db.thread.update({
          where: { id: params.id },
          data: { upvotes: { increment: 1 } }
        })
      } else {
        updatedThread = await db.thread.update({
          where: { id: params.id },
          data: { downvotes: { increment: 1 } }
        })
      }
    }

    return NextResponse.json({
      message: 'Vote recorded successfully',
      upvotes: updatedThread?.upvotes || thread.upvotes,
      downvotes: updatedThread?.downvotes || thread.downvotes
    })

  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}