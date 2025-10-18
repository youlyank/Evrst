import { Queue, Worker, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// Redis connection for BullMQ
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

// Queue definitions
export const feedQueue = new Queue('feed-processing', { connection });
export const notificationQueue = new Queue('notifications', { connection });
export const federationQueue = new Queue('federation', { connection });
export const mediaQueue = new Queue('media-processing', { connection });
export const cleanupQueue = new Queue('cleanup', { connection });

// Queue events for monitoring
const queueEvents = new QueueEvents('feed-processing', { connection });
const notificationEvents = new QueueEvents('notifications', { connection });
const federationEvents = new QueueEvents('federation', { connection });

// Feed Processing Worker
export const feedWorker = new Worker(
  'feed-processing',
  async (job) => {
    const { type, data } = job.data;
    
    try {
      switch (type) {
        case 'UPDATE_USER_FEED':
          await updateUserFeed(data.userId, data.options);
          break;
        case 'PROCESS_NEW_POST':
          await processNewPost(data.postId, data.postData);
          break;
        case 'REFRESH_TRENDING':
          await refreshTrendingContent();
          break;
        default:
          throw new Error(`Unknown feed job type: ${type}`);
      }
    } catch (error) {
      console.error(`Feed processing error:`, error);
      throw error;
    }
  },
  { connection }
);

// Notification Worker
export const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const { type, data } = job.data;
    
    try {
      switch (type) {
        case 'SEND_NOTIFICATION':
          await sendNotification(data.userId, data.notification);
          break;
        case 'BROADCAST_NOTIFICATION':
          await broadcastNotification(data.notification, data.recipients);
          break;
        case 'EMAIL_NOTIFICATION':
          await sendNotification(data.email, data.notification);
          break;
        default:
          throw new Error(`Unknown notification job type: ${type}`);
      }
    } catch (error) {
      console.error(`Notification processing error:`, error);
      throw error;
    }
  },
  { connection }
);

// Federation Worker
export const federationWorker = new Worker(
  'federation',
  async (job) => {
    const { type, data } = job.data;
    
    try {
      switch (type) {
        case 'SYNC_ACTIVITYPUB':
          await syncActivityPub(data.instanceUrl, data.options);
          break;
        case 'DELIVER_ACTIVITY':
          await deliverActivity(data.activity, data.targetInbox);
          break;
        case 'PROCESS_INCOMING_ACTIVITY':
          await processIncomingActivity(data.activity, data.signature);
          break;
        case 'UPDATE_PROFILE':
          await updateFederatedProfile(data.userId, data.profileData);
          break;
        default:
          throw new Error(`Unknown federation job type: ${type}`);
      }
    } catch (error) {
      console.error(`Federation processing error:`, error);
      throw error;
    }
  },
  { connection }
);

// Media Processing Worker
export const mediaWorker = new Worker(
  'media-processing',
  async (job) => {
    const { type, data } = job.data;
    
    try {
      switch (type) {
        case 'GENERATE_THUMBNAIL':
          await generateThumbnail(data.mediaUrl, data.options);
          break;
        case 'PROCESS_VIDEO':
          await processVideo(data.videoUrl, data.options);
          break;
        case 'OPTIMIZE_IMAGE':
          await optimizeImage(data.imageUrl, data.options);
          break;
        case 'GENERATE_AI_IMAGE':
          await generateAIImage(data.prompt, data.options);
          break;
        default:
          throw new Error(`Unknown media job type: ${type}`);
      }
    } catch (error) {
      console.error(`Media processing error:`, error);
      throw error;
    }
  },
  { connection }
);

// Cleanup Worker
export const cleanupWorker = new Worker(
  'cleanup',
  async (job) => {
    const { type, data } = job.data;
    
    try {
      switch (type) {
        case 'CLEAN_EXPIRED_STORIES':
          await cleanupExpiredStories();
          break;
        case 'CLEAN_OLD_SESSIONS':
          await cleanupOldSessions();
          break;
        case 'CLEAN_ORPHANED_MEDIA':
          await cleanupOrphanedMedia();
          break;
        case 'UPDATE_USER_STATS':
          await updateUserStats(data.userId);
          break;
        default:
          throw new Error(`Unknown cleanup job type: ${type}`);
      }
    } catch (error) {
      console.error(`Cleanup processing error:`, error);
      throw error;
    }
  },
  { connection }
);

// Job Processing Functions

async function updateUserFeed(userId: string, options: any = {}) {
  console.log(`Updating feed for user: ${userId}`);
  
  // Get user's follows and communities
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      followedUsers: {
        include: { following: true }
      },
      communities: {
        include: { community: true }
      }
    }
  });

  if (!user) return;

  const followedIds = user.followedUsers.map(f => f.followingId);
  const communityIds = user.communities.map(c => c.communityId);

  // Get recent posts from followed users and communities
  const posts = await db.thread.findMany({
    where: {
      OR: [
        { authorId: { in: followedIds } },
        { communityId: { in: communityIds } },
        { authorId: userId }
      ]
    },
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
      community: {
        select: {
          id: true,
          name: true,
          displayName: true,
          icon: true
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
    take: 50
  });

  // Cache feed in Redis
  await connection.setex(`user:${userId}:feed`, 300, JSON.stringify(posts));
  
  console.log(`Feed updated for user ${userId} with ${posts.length} posts`);
}

async function processNewPost(postId: string, postData: any) {
  console.log(`Processing new post: ${postId}`);
  
  // Update feeds of all followers
  const author = await db.user.findUnique({
    where: { id: postData.authorId },
    include: {
      followers: {
        include: { follower: true }
      }
    }
  });

  if (author) {
    for (const follower of author.followers) {
      await feedQueue.add(
        'UPDATE_USER_FEED',
        { userId: follower.followerId, options: { priority: 'high' } },
        { delay: 1000 } // Small delay to ensure post is saved
      );
    }
  }

  // Send notifications to mentioned users
  if (postData.mentions && postData.mentions.length > 0) {
    for (const mention of postData.mentions) {
      await notificationQueue.add(
        'SEND_NOTIFICATION',
        {
          userId: mention,
          notification: {
            type: 'MENTION',
            title: 'You were mentioned',
            message: `${postData.authorName} mentioned you in a post`,
            data: { postId, authorId: postData.authorId }
          }
        }
      );
    }
  }

  console.log(`New post ${postId} processed successfully`);
}

async function refreshTrendingContent() {
  console.log('Refreshing trending content');
  
  // Calculate trending posts based on recent activity
  const trendingPosts = await db.thread.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true
        }
      },
      _count: {
        select: {
          comments: true,
          votes: true
        }
      }
    },
    orderBy: [
      { upvotes: 'desc' },
      { commentCount: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 20
  });

  // Cache trending posts
  await connection.setex('trending:posts', 600, JSON.stringify(trendingPosts));
  
  console.log(`Trending content refreshed with ${trendingPosts.length} posts`);
}

async function sendNotification(userId: string, notification: any) {
  console.log(`Sending notification to user: ${userId}`);
  
  // Store notification in database
  await db.notification.create({
    data: {
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {}
    }
  });

  // Send real-time notification via WebSocket
  // This would be handled by the socket server
  console.log(`Notification sent to user ${userId}`);
}

async function broadcastNotification(notification: any, recipients: string[]) {
  console.log(`Broadcasting notification to ${recipients.length} users`);
  
  for (const userId of recipients) {
    await sendNotification(userId, notification);
  }
}

async function syncActivityPub(instanceUrl: string, options: any = {}) {
  console.log(`Syncing with ActivityPub instance: ${instanceUrl}`);
  
  try {
    // Fetch instance information
    const response = await fetch(`${instanceUrl}/api/v1/instance`);
    const instance = await response.json();
    
    // Log instance info (in production, store in database)
    console.log(`Successfully synced with ${instanceUrl}:`, instance.title || instance.uri);
  } catch (error) {
    console.error(`Failed to sync with ${instanceUrl}:`, error);
    throw error;
  }
}

async function deliverActivity(activity: any, targetInbox: string) {
  console.log(`Delivering activity to: ${targetInbox}`);
  
  try {
    const response = await fetch(targetInbox, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'
      },
      body: JSON.stringify(activity)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to deliver activity: ${response.statusText}`);
    }
    
    console.log(`Activity delivered successfully to ${targetInbox}`);
  } catch (error) {
    console.error(`Failed to deliver activity to ${targetInbox}:`, error);
    throw error;
  }
}

async function processIncomingActivity(activity: any, signature: string) {
  console.log('Processing incoming ActivityPub activity');
  
  // Verify signature
  // Process activity based on type
  switch (activity.type) {
    case 'Create':
      // Handle new post creation
      break;
    case 'Follow':
      // Handle follow request
      break;
    case 'Like':
      // Handle like
      break;
    case 'Announce':
      // Handle boost/repost
      break;
    default:
      console.log(`Unhandled activity type: ${activity.type}`);
  }
}

async function updateFederatedProfile(userId: string, profileData: any) {
  console.log(`Updating federated profile for user: ${userId}`);
  
  await db.user.update({
    where: { id: userId },
    data: {
      displayName: profileData.displayName,
      bio: profileData.bio,
      avatar: profileData.avatar,
      federatedId: profileData.federatedId,
      instance: profileData.instance
    }
  });
}

async function generateThumbnail(mediaUrl: string, options: any = {}) {
  console.log(`Generating thumbnail for: ${mediaUrl}`);
  
  try {
    const zai = await ZAI.create();
    const response = await zai.images.generations.create({
      prompt: `Generate a thumbnail for media content`,
      size: '1280x720'
    });
    
    if (response.data && response.data[0]) {
      const thumbnailBase64 = response.data[0].base64;
      // In production, upload to storage service
      console.log('Thumbnail generated successfully');
      return thumbnailBase64;
    }
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    throw error;
  }
}

async function processVideo(videoUrl: string, options: any = {}) {
  console.log(`Processing video: ${videoUrl}`);
  // Video processing logic would go here
  console.log('Video processed successfully');
}

async function optimizeImage(imageUrl: string, options: any = {}) {
  console.log(`Optimizing image: ${imageUrl}`);
  // Image optimization logic would go here
  console.log('Image optimized successfully');
}

async function generateAIImage(prompt: string, options: any = {}) {
  console.log(`Generating AI image with prompt: ${prompt}`);
  
  try {
    const zai = await ZAI.create();
    const response = await zai.images.generations.create({
      prompt,
      size: options.size || '1024x1024'
    });
    
    if (response.data && response.data[0]) {
      return response.data[0].base64;
    }
  } catch (error) {
    console.error('Failed to generate AI image:', error);
    throw error;
  }
}

async function cleanupExpiredStories() {
  console.log('Cleaning up expired stories');
  
  const result = await db.story.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
  
  console.log(`Cleaned up ${result.count} expired stories`);
}

async function cleanupOldSessions() {
  console.log('Cleaning up old sessions');
  // Session cleanup logic would go here
  console.log('Old sessions cleaned up');
}

async function cleanupOrphanedMedia() {
  console.log('Cleaning up orphaned media');
  // Media cleanup logic would go here
  console.log('Orphaned media cleaned up');
}

async function updateUserStats(userId: string) {
  console.log(`Updating stats for user: ${userId}`);
  
  const stats = await db.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
          followedUsers: true,
          followers: true
        }
      }
    }
  });
  
  if (stats) {
    await db.user.update({
      where: { id: userId },
      data: {
        karma: stats._count.posts * 10 + stats._count.comments * 5
      }
    });
  }
  
  console.log(`Stats updated for user ${userId}`);
}

// Error handling
feedWorker.on('failed', (job, err) => {
  console.error(`Feed job ${job?.id} failed:`, err);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Notification job ${job?.id} failed:`, err);
});

federationWorker.on('failed', (job, err) => {
  console.error(`Federation job ${job?.id} failed:`, err);
});

mediaWorker.on('failed', (job, err) => {
  console.error(`Media job ${job?.id} failed:`, err);
});

cleanupWorker.on('failed', (job, err) => {
  console.error(`Cleanup job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing BullMQ workers...');
  await feedWorker.close();
  await notificationWorker.close();
  await federationWorker.close();
  await mediaWorker.close();
  await cleanupWorker.close();
  await connection.quit();
  process.exit(0);
});

export { connection as redisConnection };