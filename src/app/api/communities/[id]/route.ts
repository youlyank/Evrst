<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';

// GET /api/communities/[id] - Get specific community
=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
<<<<<<< HEAD
    const { searchParams } = new URL(request.url);
    const includePosts = searchParams.get('includePosts') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

=======
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
    const community = await db.community.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
<<<<<<< HEAD
            avatar: true
=======
            avatar: true,
            karma: true
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
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
<<<<<<< HEAD
                isVerified: true
              }
            }
          },
          take: 10,
          orderBy: { joinedAt: 'desc' }
=======
                karma: true
              }
            }
          },
          orderBy: { joinedAt: 'desc' },
          take: 10
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
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
<<<<<<< HEAD
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
=======
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: 'asc' },
          take: 5
        },
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
        _count: {
          select: {
            members: true,
            posts: true,
<<<<<<< HEAD
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
=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
<<<<<<< HEAD
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
=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  }
}