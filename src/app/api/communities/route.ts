<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { getRealtimeServer } from '@/lib/realtime-server';

// GET /api/communities - Get communities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'popular'; // popular, new, members
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sort) {
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'members':
        orderBy = { memberCount: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = [
          { postCount: 'desc' },
          { memberCount: 'desc' }
        ];
        break;
    }

    const communities = await db.community.findMany({
      where: whereClause,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    const communities = await db.community.findMany({
      where,
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        },
        _count: {
          select: {
            members: true,
            posts: true
          }
        }
      },
<<<<<<< HEAD
      orderBy,
      take: limit,
      skip: offset
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

// POST /api/communities - Create a new community
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { 
      name, 
      displayName, 
      description, 
      icon, 
      banner, 
      rules, 
      color, 
      isPrivate, 
      isNSFW 
    } = body;
=======
      orderBy: { memberCount: 'desc' },
      skip,
      take: limit
    })

    const total = await db.community.count({ where })

    return NextResponse.json({
      communities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching communities:', error)
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

    const { name, displayName, description, icon, banner, rules, isPrivate, isNSFW, color } = await request.json()
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Name and display name are required' },
        { status: 400 }
<<<<<<< HEAD
      );
    }

    // Check if name is already taken
    const existingCommunity = await db.community.findUnique({
      where: { name }
    });

    if (existingCommunity) {
      return NextResponse.json(
        { error: 'Community name already taken' },
        { status: 409 }
      );
=======
      )
    }

    // Check if community name already exists
    const existingCommunity = await db.community.findUnique({
      where: { name }
    })

    if (existingCommunity) {
      return NextResponse.json(
        { error: 'Community with this name already exists' },
        { status: 409 }
      )
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
    }

    const community = await db.community.create({
      data: {
        name,
        displayName,
        description,
<<<<<<< HEAD
        icon,
        banner,
        rules,
        color: color || '#0079d3',
        isPrivate: isPrivate || false,
        isNSFW: isNSFW || false,
        creatorId: userId,
        memberCount: 1,
        subscriberCount: 1
=======
        creatorId: token.userId,
        icon,
        banner,
        rules,
        isPrivate: isPrivate || false,
        isNSFW: isNSFW || false,
        color: color || '#0079d3'
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
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
<<<<<<< HEAD
    });

    // Add creator as admin member
    await db.communityMember.create({
      data: {
        userId,
        communityId: community.id,
        role: 'ADMIN'
      }
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error('Error creating community:', error);
    return NextResponse.json(
      { error: 'Failed to create community' },
      { status: 500 }
    );
=======
    })

    // Add creator as a member and owner
    await db.communityMember.create({
      data: {
        userId: token.userId,
        communityId: community.id,
        role: 'OWNER'
      }
    })

    await db.communityModerator.create({
      data: {
        userId: token.userId,
        communityId: community.id,
        role: 'owner'
      }
    })

    return NextResponse.json(community, { status: 201 })
  } catch (error) {
    console.error('Error creating community:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  }
}