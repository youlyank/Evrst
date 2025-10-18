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

    if (!name || !displayName) {
      return NextResponse.json(
        { error: 'Name and display name are required' },
        { status: 400 }
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
    }

    const community = await db.community.create({
      data: {
        name,
        displayName,
        description,
        icon,
        banner,
        rules,
        color: color || '#0079d3',
        isPrivate: isPrivate || false,
        isNSFW: isNSFW || false,
        creatorId: userId,
        memberCount: 1,
        subscriberCount: 1
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
  }
}