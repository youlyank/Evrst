import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';

// GET /api/communities/[id] - Get specific community
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includePosts = searchParams.get('includePosts') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const community = await db.community.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
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
                isVerified: true
              }
            }
          },
          take: 10,
          orderBy: { joinedAt: 'desc' }
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
          where: {
            startTime: { gt: new Date() }
          },
          orderBy: { startTime: 'asc' },
          take: 5
        },
        posts: includePosts ? {
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
            _count: {
              select: {
                comments: true,
                votes: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        } : false,
        _count: {
          select: {
            members: true,
            posts: true,
            events: true
          }
        }
      }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    return NextResponse.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community' },
      { status: 500 }
    );
  }
}

// POST /api/communities/[id]/join - Join a community
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;
    const userId = decoded.userId;

    // Check if community exists
    const community = await db.community.findUnique({
      where: { id: params.id },
      select: { id: true, isPrivate: true }
    });

    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await db.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: params.id
        }
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this community' },
        { status: 409 }
      );
    }

    // Add user as member
    const member = await db.communityMember.create({
      data: {
        userId,
        communityId: params.id,
        role: 'MEMBER'
      }
    });

    // Update community member count
    await db.community.update({
      where: { id: params.id },
      data: {
        memberCount: {
          increment: 1
        },
        subscriberCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error) {
    console.error('Error joining community:', error);
    return NextResponse.json(
      { error: 'Failed to join community' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[id]/leave - Leave a community
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;
    const userId = decoded.userId;

    // Check if user is a member
    const existingMember = await db.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId: params.id
        }
      }
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Not a member of this community' },
        { status: 404 }
      );
    }

    // Remove member
    await db.communityMember.delete({
      where: {
        userId_communityId: {
          userId,
          communityId: params.id
        }
      }
    });

    // Update community member count
    await db.community.update({
      where: { id: params.id },
      data: {
        memberCount: {
          decrement: 1
        },
        subscriberCount: {
          decrement: 1
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving community:', error);
    return NextResponse.json(
      { error: 'Failed to leave community' },
      { status: 500 }
    );
  }
}