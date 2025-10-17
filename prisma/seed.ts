import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding ELK.Zone 2.0 database...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@elk.zone',
        username: 'alice',
        displayName: 'Alice Chen',
        bio: 'Federation enthusiast and open source advocate',
        karma: 1250,
        isVerified: true,
        avatar: '/avatars/01.png',
        banner: '/banners/alice.jpg',
        theme: 'dark',
        language: 'en',
        notificationsEnabled: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@elk.zone',
        username: 'bob',
        displayName: 'Bob Wilson',
        bio: 'Live streamer and gaming enthusiast',
        karma: 890,
        isVerified: false,
        avatar: '/avatars/02.png',
        banner: '/banners/bob.jpg',
        theme: 'light',
        language: 'en',
        notificationsEnabled: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'carol@elk.zone',
        username: 'carol',
        displayName: 'Carol Martinez',
        bio: 'Community builder and moderator',
        karma: 2100,
        isVerified: true,
        avatar: '/avatars/03.png',
        banner: '/banners/carol.jpg',
        theme: 'light',
        language: 'es',
        notificationsEnabled: true,
      }
    }),
    prisma.user.create({
      data: {
        email: 'david@elk.zone',
        username: 'david',
        displayName: 'David Kim',
        bio: 'Developer and tech writer',
        karma: 567,
        isVerified: false,
        avatar: '/avatars/04.png',
        banner: '/banners/david.jpg',
        theme: 'dark',
        language: 'en',
        notificationsEnabled: false,
      }
    })
  ])

  console.log('✅ Created sample users')

  // Create communities
  const communities = await Promise.all([
    prisma.community.create({
      data: {
        name: 'federation',
        displayName: 'Federation',
        description: 'Discuss the fediverse, ActivityPub, and decentralized social media',
        icon: '🌐',
        color: '#0079d3',
        creatorId: users[0].id,
        memberCount: 1234,
        postCount: 892,
        subscriberCount: 456,
      }
    }),
    prisma.community.create({
      data: {
        name: 'livestreams',
        displayName: 'Live Streams',
        description: 'Share and discover live streaming content',
        icon: '📺',
        color: '#ff4500',
        creatorId: users[1].id,
        memberCount: 892,
        postCount: 234,
        subscriberCount: 123,
      }
    }),
    prisma.community.create({
      data: {
        name: 'opensource',
        displayName: 'Open Source',
        description: 'Everything about open source software and development',
        icon: '💻',
        color: '#00a86b',
        creatorId: users[2].id,
        memberCount: 2341,
        postCount: 1567,
        subscriberCount: 789,
      }
    }),
    prisma.community.create({
      data: {
        name: 'tech',
        displayName: 'Technology',
        description: 'Latest news and discussions about technology',
        icon: '🔧',
        color: '#ff6b35',
        creatorId: users[3].id,
        memberCount: 3456,
        postCount: 2109,
        subscriberCount: 1234,
      }
    })
  ])

  console.log('✅ Created sample communities')

  // Add users to communities
  for (const user of users) {
    for (const community of communities) {
      await prisma.communityMember.create({
        data: {
          userId: user.id,
          communityId: community.id,
          role: user.id === community.creatorId ? 'ADMIN' : 'MEMBER',
        }
      })
    }
  }

  console.log('✅ Added users to communities')

  // Create sample threads/posts
  const threads = await Promise.all([
    prisma.thread.create({
      data: {
        content: 'Just discovered the power of ActivityPub federation! The ability to connect different social media platforms is truly revolutionary. We\'re building the future of social networking with ELK.Zone 2.0! 🚀\n\n#Fediverse #Decentralized #ActivityPub',
        type: 'TEXT',
        upvotes: 45,
        downvotes: 2,
        reposts: 12,
        commentCount: 8,
        views: 234,
        isPinned: true,
        authorId: users[0].id,
        communityId: communities[0].id,
      }
    }),
    prisma.thread.create({
      data: {
        content: 'Going live in 30 minutes! Today we\'re discussing the future of decentralized streaming and how PeerTube integration is changing the game. Join me for an interactive session! 🎮\n\n#LiveStreaming #Gaming #PeerTube',
        type: 'TEXT',
        upvotes: 23,
        downvotes: 1,
        reposts: 5,
        commentCount: 15,
        views: 567,
        authorId: users[1].id,
        communityId: communities[1].id,
      }
    }),
    prisma.thread.create({
      data: {
        content: 'New moderation tools are now available for community admins! We\'ve implemented advanced filtering, automated moderation, and cross-instance community management. This is a game changer for federated communities! 🛠️\n\n#Moderation #Community #OpenSource',
        type: 'TEXT',
        upvotes: 67,
        downvotes: 3,
        reposts: 18,
        commentCount: 23,
        views: 890,
        isPinned: true,
        authorId: users[2].id,
        communityId: communities[2].id,
      }
    }),
    prisma.thread.create({
      data: {
        content: 'The integration between Matrix and our platform is now complete! End-to-end encrypted messaging, voice calls, and seamless federation with other Matrix homeservers. Privacy-first communication is here! 🔐\n\n#Matrix #Encryption #Privacy',
        type: 'TEXT',
        upvotes: 89,
        downvotes: 4,
        reposts: 34,
        commentCount: 45,
        views: 1234,
        authorId: users[3].id,
        communityId: communities[3].id,
      }
    }),
    prisma.thread.create({
      data: {
        content: 'Quick tutorial: How to set up your own federated instance using ELK.Zone 2.0. It\'s easier than you think! Check out our documentation and join the decentralized revolution. 📚\n\n#Tutorial #SelfHosting #Fediverse',
        type: 'TEXT',
        upvotes: 34,
        downvotes: 0,
        reposts: 8,
        commentCount: 12,
        views: 456,
        authorId: users[0].id,
        communityId: communities[2].id,
      }
    })
  ])

  console.log('✅ Created sample threads')

  // Add hashtags to threads
  const hashtags = [
    { threadId: threads[0].id, hashtag: 'Fediverse' },
    { threadId: threads[0].id, hashtag: 'Decentralized' },
    { threadId: threads[0].id, hashtag: 'ActivityPub' },
    { threadId: threads[1].id, hashtag: 'LiveStreaming' },
    { threadId: threads[1].id, hashtag: 'Gaming' },
    { threadId: threads[1].id, hashtag: 'PeerTube' },
    { threadId: threads[2].id, hashtag: 'Moderation' },
    { threadId: threads[2].id, hashtag: 'Community' },
    { threadId: threads[2].id, hashtag: 'OpenSource' },
    { threadId: threads[3].id, hashtag: 'Matrix' },
    { threadId: threads[3].id, hashtag: 'Encryption' },
    { threadId: threads[3].id, hashtag: 'Privacy' },
    { threadId: threads[4].id, hashtag: 'Tutorial' },
    { threadId: threads[4].id, hashtag: 'SelfHosting' },
    { threadId: threads[4].id, hashtag: 'Fediverse' },
  ]

  await Promise.all(
    hashtags.map(tag => 
      prisma.threadHashtag.create({
        data: tag
      })
    )
  )

  console.log('✅ Added hashtags to threads')

  // Create sample live streams
  const liveStreams = await Promise.all([
    prisma.liveStream.create({
      data: {
        title: 'Building Federated Apps with ActivityPub',
        description: 'Deep dive into ActivityPub protocol and building decentralized applications',
        category: 'Technology',
        tags: JSON.stringify(['programming', 'federation', 'activitypub']),
        thumbnailUrl: '/streams/dev-stream.jpg',
        streamKey: 'live_stream_123',
        isLive: true,
        viewerCount: 234,
        duration: 3600,
        quality: '1080p',
        latency: 'low',
        startedAt: new Date(Date.now() - 3600000),
        streamerId: users[0].id,
      }
    }),
    prisma.liveStream.create({
      data: {
        title: 'Gaming Night - Indie Games Marathon',
        description: 'Playing the latest indie games and chatting with the community',
        category: 'Gaming',
        tags: JSON.stringify(['gaming', 'indie', 'marathon']),
        thumbnailUrl: '/streams/gaming-night.jpg',
        streamKey: 'live_stream_456',
        isLive: true,
        viewerCount: 567,
        duration: 7200,
        quality: '720p',
        latency: 'low',
        startedAt: new Date(Date.now() - 7200000),
        streamerId: users[1].id,
      }
    }),
    prisma.liveStream.create({
      data: {
        title: 'Community Management Best Practices',
        description: 'Tips and tricks for managing online communities in the fediverse',
        category: 'Community',
        tags: JSON.stringify(['community', 'management', 'moderation']),
        thumbnailUrl: '/streams/community-mgmt.jpg',
        streamKey: 'live_stream_789',
        isLive: false,
        viewerCount: 0,
        duration: 0,
        quality: '1080p',
        latency: 'low',
        scheduledFor: new Date(Date.now() + 86400000),
        streamerId: users[2].id,
      }
    })
  ])

  console.log('✅ Created sample live streams')

  // Create sample stories
  const stories = await Promise.all([
    prisma.story.create({
      data: {
        imageUrl: '/stories/alice-story.jpg',
        duration: 15,
        expiresAt: new Date(Date.now() + 86400000),
        authorId: users[0].id,
        viewers: 45,
      }
    }),
    prisma.story.create({
      data: {
        imageUrl: '/stories/bob-story.jpg',
        videoUrl: '/stories/bob-video.mp4',
        duration: 30,
        expiresAt: new Date(Date.now() + 86400000),
        authorId: users[1].id,
        viewers: 78,
      }
    }),
    prisma.story.create({
      data: {
        imageUrl: '/stories/carol-story.jpg',
        duration: 10,
        expiresAt: new Date(Date.now() + 86400000),
        authorId: users[2].id,
        viewers: 123,
      }
    })
  ])

  console.log('✅ Created sample stories')

  // Create trending topics
  const trendingTopics = await Promise.all([
    prisma.trendingTopic.create({
      data: {
        name: 'ELKZone',
        query: 'ELKZone',
        posts: 1234,
        growth: 45.2,
        category: 'Technology',
        location: 'Global',
      }
    }),
    prisma.trendingTopic.create({
      data: {
        name: 'Fediverse',
        query: 'Fediverse',
        posts: 892,
        growth: 23.8,
        category: 'Technology',
        location: 'Global',
      }
    }),
    prisma.trendingTopic.create({
      data: {
        name: 'Decentralized',
        query: 'Decentralized',
        posts: 567,
        growth: 18.5,
        category: 'Technology',
        location: 'Global',
      }
    })
  ])

  console.log('✅ Created trending topics')

  // Create some votes
  const votes = [
    { userId: users[1].id, threadId: threads[0].id, type: 'UPVOTE' },
    { userId: users[2].id, threadId: threads[0].id, type: 'UPVOTE' },
    { userId: users[3].id, threadId: threads[0].id, type: 'UPVOTE' },
    { userId: users[0].id, threadId: threads[1].id, type: 'UPVOTE' },
    { userId: users[2].id, threadId: threads[1].id, type: 'UPVOTE' },
    { userId: users[3].id, threadId: threads[2].id, type: 'UPVOTE' },
    { userId: users[0].id, threadId: threads[2].id, type: 'UPVOTE' },
    { userId: users[1].id, threadId: threads[2].id, type: 'UPVOTE' },
  ]

  await Promise.all(
    votes.map(vote => 
      prisma.vote.create({
        data: vote
      })
    )
  )

  console.log('✅ Created sample votes')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   Users: ${users.length}`)
  console.log(`   Communities: ${communities.length}`)
  console.log(`   Threads: ${threads.length}`)
  console.log(`   Live Streams: ${liveStreams.length}`)
  console.log(`   Stories: ${stories.length}`)
  console.log(`   Trending Topics: ${trendingTopics.length}`)
  console.log('\n🚀 ELK.Zone 2.0 is ready for testing!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })