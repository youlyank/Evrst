import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Matrix integration endpoints
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'create_room':
        return await createMatrixRoom(data)
      case 'send_message':
        return await sendMatrixMessage(data)
      case 'join_room':
        return await joinMatrixRoom(data)
      case 'sync':
        return await syncMatrixMessages(data)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Matrix API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  async function createMatrixRoom(data: any) {
    const { name, description, isPrivate, userId, participantIds } = data

    // TODO: Implement actual Matrix room creation
    // For now, create a local chat room
    const chatRoom = await db.chatRoom.create({
      data: {
        name,
        description,
        isGroup: participantIds && participantIds.length > 1,
        isPrivate: isPrivate || false,
        isEncrypted: true,
        matrixRoomId: `!room_${Date.now()}:matrix.elk.zone`,
        members: {
          create: [
            { userId, role: 'admin' },
            ...(participantIds || []).map((participantId: string) => ({
              userId: participantId,
              role: 'member'
            }))
          ]
        }
      },
      include: {
        members: {
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
        }
      }
    })

    return NextResponse.json({
      roomId: chatRoom.matrixRoomId,
      chatRoom
    })
  }

  async function sendMatrixMessage(data: any) {
    const { roomId, content, senderId, type, replyToId } = data

    // Create message in local database
    const message = await db.message.create({
      data: {
        content,
        type: type || 'TEXT',
        senderId,
        roomId,
        replyToId,
        roomId: roomId
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    // TODO: Send to actual Matrix server
    // TODO: Handle encryption if room is encrypted
    // TODO: Send real-time updates via WebSocket

    return NextResponse.json(message)
  }

  async function joinMatrixRoom(data: any) {
    const { roomId, userId } = data

    // Add user to local chat room
    const membership = await db.chatRoomMember.create({
      data: {
        userId,
        chatRoomId: roomId,
        role: 'member'
      }
    })

    // TODO: Send actual Matrix join request
    // TODO: Handle room permissions

    return NextResponse.json({ success: true, membership })
  }

  async function syncMatrixMessages(data: any) {
    const { roomId, userId, since } = data

    // Get messages from local database
    const messages = await db.message.findMany({
      where: {
        chatRoomId: roomId,
        createdAt: since ? { gte: new Date(since) } : undefined
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // TODO: Sync with actual Matrix server
    // TODO: Handle pagination and batch tokens

    return NextResponse.json({
      messages,
      nextBatch: Date.now().toString()
    })
  }
}

// Get Matrix rooms for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const chatRooms = await db.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                isActive: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: {
        messages: {
          _max: {
            createdAt: 'desc'
          }
        }
      }
    })

    return NextResponse.json({ chatRooms })
  } catch (error) {
    console.error('Error fetching Matrix rooms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}