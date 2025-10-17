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
    const token = verifyToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const chatRoomId = searchParams.get('chatRoomId')
    const conversationId = searchParams.get('conversationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    let where: any = {}

    if (chatRoomId) {
      where.chatRoomId = chatRoomId
    } else if (conversationId) {
      // Direct messages between two users
      where.OR = [
        { 
          AND: [
            { senderId: token.userId },
            { receiverId: conversationId }
          ]
        },
        { 
          AND: [
            { senderId: conversationId },
            { receiverId: token.userId }
          ]
        }
      ]
    } else {
      // All messages for the user
      where.OR = [
        { senderId: token.userId },
        { receiverId: token.userId }
      ]
    }

    const messages = await db.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true
          }
        },
        chatRoom: {
          select: {
            id: true,
            name: true,
            description: true,
            isGroup: true,
            avatar: true
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        },
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await db.message.count({ where })

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
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

    const { content, receiverId, chatRoomId, type, imageUrl, videoUrl, fileUrl, fileName, fileSize, replyToId, isEncrypted } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!receiverId && !chatRoomId) {
      return NextResponse.json(
        { error: 'Either receiver ID or chat room ID is required' },
        { status: 400 }
      )
    }

    // Extract mentions from content
    const mentions = content.match(/@(\w+)/g)?.map(mention => mention.substring(1)) || []

    const message = await db.message.create({
      data: {
        content,
        senderId: token.userId,
        receiverId,
        chatRoomId,
        type: type || 'TEXT',
        imageUrl,
        videoUrl,
        fileUrl,
        fileName,
        fileSize,
        replyToId,
        isEncrypted: isEncrypted || false,
        mentions: {
          create: mentions.map(async (username) => {
            const mentionedUser = await db.user.findUnique({ where: { username } })
            if (mentionedUser) {
              return { mentionedUserId: mentionedUser.id }
            }
            return null
          }).filter(Boolean)
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            isVerified: true
          }
        },
        chatRoom: {
          select: {
            id: true,
            name: true,
            description: true,
            isGroup: true,
            avatar: true
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        },
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

    // TODO: Emit real-time event via WebSocket
    // This would be handled by the socket.io integration

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}