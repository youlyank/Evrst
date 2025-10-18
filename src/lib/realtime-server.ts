import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verify } from 'jsonwebtoken';
import { db } from '@/lib/db';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export class RealtimeFeedServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any;
        const user = await db.user.findUnique({
          where: { id: decoded.userId },
          include: {
            profile: true,
            followedUsers: {
              include: { following: true }
            },
            followers: {
              include: { follower: true }
            }
          }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Track user connection
      if (!this.connectedUsers.has(socket.userId!)) {
        this.connectedUsers.set(socket.userId!, new Set());
      }
      this.connectedUsers.get(socket.userId!)!.add(socket.id);

      // Join user to their personal room
      socket.join(`user:${socket.userId}`);

      // Join rooms for communities user is a member of
      socket.user.communities.forEach((membership: any) => {
        socket.join(`community:${membership.communityId}`);
      });

      // Join rooms for followed users
      socket.user.followedUsers.forEach((follow: any) => {
        socket.join(`follow:${follow.followingId}`);
      });

      // Handle real-time feed events
      socket.on('join_feed', () => {
        socket.join('global_feed');
        this.sendFeedUpdate(socket);
      });

      socket.on('leave_feed', () => {
        socket.leave('global_feed');
      });

      socket.on('join_community', (communityId: string) => {
        socket.join(`community:${communityId}`);
      });

      socket.on('leave_community', (communityId: string) => {
        socket.leave(`community:${communityId}`);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { roomId: string; threadId?: string }) => {
        socket.to(data.roomId).emit('user_typing', {
          userId: socket.userId,
          username: socket.user.username,
          threadId: data.threadId
        });
      });

      socket.on('typing_stop', (data: { roomId: string; threadId?: string }) => {
        socket.to(data.roomId).emit('user_stop_typing', {
          userId: socket.userId,
          threadId: data.threadId
        });
      });

      // Handle online status
      socket.on('update_status', (status: { online: boolean; lastSeen?: Date }) => {
        this.broadcastUserStatus(socket.userId!, status);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        
        // Remove socket from tracking
        const userSockets = this.connectedUsers.get(socket.userId!);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(socket.userId!);
            // Broadcast user offline
            this.broadcastUserStatus(socket.userId!, { online: false, lastSeen: new Date() });
          }
        }
      });
    });
  }

  // Feed event broadcasters
  public broadcastNewPost(post: any) {
    const postData = {
      id: post.id,
      content: post.content,
      author: {
        id: post.author.id,
        username: post.author.username,
        displayName: post.author.displayName,
        avatar: post.author.avatar
      },
      community: post.community,
      createdAt: post.createdAt,
      upvotes: post.upvotes,
      commentCount: post.commentCount
    };

    // Send to global feed
    this.io.to('global_feed').emit('new_post', postData);

    // Send to community members
    if (post.communityId) {
      this.io.to(`community:${post.communityId}`).emit('new_post', postData);
    }

    // Send to followers
    this.io.to(`follow:${post.authorId}`).emit('new_post', postData);
  }

  public broadcastNewComment(comment: any) {
    const commentData = {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        username: comment.author.username,
        displayName: comment.author.displayName,
        avatar: comment.author.avatar
      },
      threadId: comment.threadId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      upvotes: comment.upvotes
    };

    // Send to thread participants
    this.io.to(`thread:${comment.threadId}`).emit('new_comment', commentData);

    // Send to mentioned users
    comment.mentions?.forEach((mention: any) => {
      this.io.to(`user:${mention.mentionedUserId}`).emit('mentioned', commentData);
    });
  }

  public broadcastNewLike(like: any) {
    const likeData = {
      id: like.id,
      user: {
        id: like.user.id,
        username: like.user.username,
        displayName: like.user.displayName,
        avatar: like.user.avatar
      },
      threadId: like.threadId,
      commentId: like.commentId,
      type: like.type,
      createdAt: like.createdAt
    };

    // Send to post/comment author
    if (like.thread) {
      this.io.to(`user:${like.thread.authorId}`).emit('new_like', likeData);
    } else if (like.comment) {
      this.io.to(`user:${like.comment.authorId}`).emit('new_like', likeData);
    }
  }

  public broadcastUserOnline(userId: string) {
    this.broadcastUserStatus(userId, { online: true });
  }

  public broadcastUserOffline(userId: string) {
    this.broadcastUserStatus(userId, { online: false, lastSeen: new Date() });
  }

  private broadcastUserStatus(userId: string, status: { online: boolean; lastSeen?: Date }) {
    const statusData = {
      userId,
      ...status,
      timestamp: new Date()
    };

    // Send to followers
    this.io.to(`follow:${userId}`).emit('user_status_update', statusData);

    // Send to friends in common communities
    // This would require more complex logic to determine shared communities
  }

  private async sendFeedUpdate(socket: AuthenticatedSocket) {
    try {
      // Get recent posts from followed users and communities
      const followedUserIds = socket.user.followedUsers.map((f: any) => f.followingId);
      const communityIds = socket.user.communities.map((c: any) => c.communityId);

      const recentPosts = await db.thread.findMany({
        where: {
          OR: [
            { authorId: { in: followedUserIds } },
            { communityId: { in: communityIds } },
            { authorId: socket.userId } // Include user's own posts
          ]
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
        take: 20
      });

      socket.emit('feed_update', recentPosts);
    } catch (error) {
      console.error('Error sending feed update:', error);
      socket.emit('error', { message: 'Failed to load feed' });
    }
  }

  // Story events
  public broadcastNewStory(story: any) {
    const storyData = {
      id: story.id,
      imageUrl: story.imageUrl,
      videoUrl: story.videoUrl,
      duration: story.duration,
      expiresAt: story.expiresAt,
      author: {
        id: story.author.id,
        username: story.author.username,
        displayName: story.author.displayName,
        avatar: story.author.avatar
      },
      createdAt: story.createdAt
    };

    // Send to followers
    this.io.to(`follow:${story.authorId}`).emit('new_story', storyData);
  }

  // Live streaming events
  public broadcastStreamStart(stream: any) {
    const streamData = {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      thumbnailUrl: stream.thumbnailUrl,
      category: stream.category,
      streamer: {
        id: stream.streamer.id,
        username: stream.streamer.username,
        displayName: stream.streamer.displayName,
        avatar: stream.streamer.avatar
      },
      startedAt: stream.startedAt,
      viewerCount: stream.viewerCount
    };

    // Send to global feed
    this.io.to('global_feed').emit('stream_start', streamData);

    // Send to followers
    this.io.to(`follow:${stream.streamerId}`).emit('stream_start', streamData);

    // Send to community if applicable
    if (stream.thread?.communityId) {
      this.io.to(`community:${stream.thread.communityId}`).emit('stream_start', streamData);
    }
  }

  public broadcastStreamEnd(streamId: string) {
    this.io.emit('stream_end', { streamId });
  }

  // Community events
  public broadcastCommunityEvent(event: any) {
    const eventData = {
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      isOnline: event.isOnline,
      community: {
        id: event.community.id,
        name: event.community.name,
        displayName: event.community.displayName
      }
    };

    this.io.to(`community:${event.communityId}`).emit('community_event', eventData);
  }

  // Get online user count
  public getOnlineUserCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected sockets for a user
  public getUserSocketCount(userId: string): number {
    return this.connectedUsers.get(userId)?.size || 0;
  }
}

// Singleton instance
let realtimeServer: RealtimeFeedServer;

export const initializeRealtimeServer = (httpServer: HTTPServer) => {
  if (!realtimeServer) {
    realtimeServer = new RealtimeFeedServer(httpServer);
  }
  return realtimeServer;
};

export const getRealtimeServer = () => {
  if (!realtimeServer) {
    throw new Error('Realtime server not initialized');
  }
  return realtimeServer;
};