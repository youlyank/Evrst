'use client'

import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AuthModal } from '@/components/auth-modal'
import Heart from 'lucide-react/dist/esm/icons/heart'
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle'
import Share2 from 'lucide-react/dist/esm/icons/share-2'
import Bookmark from 'lucide-react/dist/esm/icons/bookmark'
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up'
import Users from 'lucide-react/dist/esm/icons/users'
import MessageSquare from 'lucide-react/dist/esm/icons/message-square'
import Bell from 'lucide-react/dist/esm/icons/bell'
import Search from 'lucide-react/dist/esm/icons/search'
import Plus from 'lucide-react/dist/esm/icons/plus'
import Home from 'lucide-react/dist/esm/icons/home'
import Compass from 'lucide-react/dist/esm/icons/compass'
import User from 'lucide-react/dist/esm/icons/user'
import Settings from 'lucide-react/dist/esm/icons/settings'
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3'
import Rocket from 'lucide-react/dist/esm/icons/rocket'
import Zap from 'lucide-react/dist/esm/icons/zap'
import Repeat from 'lucide-react/dist/esm/icons/repeat'
import AtSign from 'lucide-react/dist/esm/icons/at-sign'
import Hash from 'lucide-react/dist/esm/icons/hash'
import Link2 from 'lucide-react/dist/esm/icons/link-2'
import Image from 'lucide-react/dist/esm/icons/image'
import Video from 'lucide-react/dist/esm/icons/video'
import Mic from 'lucide-react/dist/esm/icons/mic'
import Phone from 'lucide-react/dist/esm/icons/phone'
import Radio from 'lucide-react/dist/esm/icons/radio'
import Globe from 'lucide-react/dist/esm/icons/globe'
import Shield from 'lucide-react/dist/esm/icons/shield'
import Activity from 'lucide-react/dist/esm/icons/activity'
import Eye from 'lucide-react/dist/esm/icons/eye'
import MoreHorizontal from 'lucide-react/dist/esm/icons/more-horizontal'
import Reply from 'lucide-react/dist/esm/icons/reply'
import Quote from 'lucide-react/dist/esm/icons/quote'
import ThumbsUp from 'lucide-react/dist/esm/icons/thumbs-up'
import ThumbsDown from 'lucide-react/dist/esm/icons/thumbs-down'
import Star from 'lucide-react/dist/esm/icons/star'
import Flag from 'lucide-react/dist/esm/icons/flag'
import Volume2 from 'lucide-react/dist/esm/icons/volume-2'
import Wifi from 'lucide-react/dist/esm/icons/wifi'
import LogIn from 'lucide-react/dist/esm/icons/log-in'
import Menu from 'lucide-react/dist/esm/icons/menu'
import Send from 'lucide-react/dist/esm/icons/send'
import Paperclip from 'lucide-react/dist/esm/icons/paperclip'
import Smile from 'lucide-react/dist/esm/icons/smile'
import Play from 'lucide-react/dist/esm/icons/play'
import Pause from 'lucide-react/dist/esm/icons/pause'
import Edit from 'lucide-react/dist/esm/icons/edit'
import Camera from 'lucide-react/dist/esm/icons/camera'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Circle from 'lucide-react/dist/esm/icons/circle'
import UserPlus from 'lucide-react/dist/esm/icons/user-plus'
import UserMinus from 'lucide-react/dist/esm/icons/user-minus'
import Ban from 'lucide-react/dist/esm/icons/ban'
import Crown from 'lucide-react/dist/esm/icons/crown'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import Users2 from 'lucide-react/dist/esm/icons/users-2'
import Lock from 'lucide-react/dist/esm/icons/lock'
import Unlock from 'lucide-react/dist/esm/icons/unlock'
import VolumeX from 'lucide-react/dist/esm/icons/volume-x'
import WifiOff from 'lucide-react/dist/esm/icons/wifi-off'

// Import Swiper for stories
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface User {
  id: string
  username: string
  displayName: string
  avatar?: string
  isVerified: boolean
  karma: number
}

interface Thread {
  id: string
  content: string
  author: User
  upvotes: number
  downvotes: number
  reposts: number
  commentCount: number
  views: number
  createdAt: string
  isPinned?: boolean
  hashtags?: { hashtag: string }[]
  media?: { type: string; url: string; thumbnail?: string }[]
}

interface Community {
  id: string
  name: string
  displayName: string
  description?: string
  icon?: string
  color?: string
  memberCount: number
  postCount: number
}

interface LiveStream {
  id: string
  title: string
  streamer: User
  category?: string
  viewerCount: number
  thumbnailUrl?: string
  isLive: boolean
  quality?: string
  startedAt?: string
}

interface Story {
  id: string
  imageUrl: string
  videoUrl?: string
  duration?: number
  expiresAt: string
  createdAt: string
  author: User
  isViewed: boolean
  viewCount: number
  reactionCount: number
  reactions: Record<string, number>
  userReaction?: string | null
}

export default function ELKZone() {
  const [activeTab, setActiveTab] = useState('threads')
  const [newThread, setNewThread] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Simulate authentication check
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      setIsAuthenticated(true)
      // Mock user data
      setCurrentUser({
        id: '1',
        username: 'demo_user',
        displayName: 'Demo User',
        avatar: '/avatars/demo.png',
        isVerified: false,
        karma: 42
      })
    }
    setLoading(false)
  }, [])

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated) return

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: localStorage.getItem('auth_token')
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to real-time server')
      newSocket.emit('join_feed')
    })

    newSocket.on('new_post', (post: Thread) => {
      setThreads(prev => [post, ...prev])
    })

    newSocket.on('new_comment', (comment) => {
      // Handle new comment notification
      console.log('New comment:', comment)
    })

    newSocket.on('new_like', (like) => {
      // Handle new like notification
      console.log('New like:', like)
    })

    newSocket.on('new_story', (story: Story) => {
      setStories(prev => [story, ...prev])
    })

    newSocket.on('stream_start', (stream: LiveStream) => {
      setLiveStreams(prev => [stream, ...prev])
    })

    newSocket.on('stream_end', (data: { streamId: string }) => {
      setLiveStreams(prev => prev.filter(s => s.id !== data.streamId))
    })

    newSocket.on('user_status_update', (status) => {
      if (status.online) {
        setOnlineUsers(prev => new Set([...prev, status.userId]))
      } else {
        setOnlineUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(status.userId)
          return newSet
        })
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [isAuthenticated])

  // Fetch data
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchData = async () => {
      try {
        // Fetch stories
        const storiesResponse = await fetch('/api/stories/active', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        if (storiesResponse.ok) {
          const storiesData = await storiesResponse.json()
          setStories(storiesData || [])
        }

        // Fetch threads
        const threadsResponse = await fetch('/api/posts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        if (threadsResponse.ok) {
          const threadsData = await threadsResponse.json()
          setThreads(threadsData.posts || [])
        }

        // Fetch communities
        const communitiesResponse = await fetch('/api/communities')
        if (communitiesResponse.ok) {
          const communitiesData = await communitiesResponse.json()
          setCommunities(communitiesData || [])
        }

        // Fetch live streams
        const streamsResponse = await fetch('/api/live-streams?status=live')
        if (streamsResponse.ok) {
          const streamsData = await streamsResponse.json()
          setLiveStreams(streamsData || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [isAuthenticated])

  const handleCreateThread = async () => {
    if (!newThread.trim() || !isAuthenticated) return

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          content: newThread,
          type: 'TEXT'
        })
      })

      if (response.ok) {
        const newThreadData = await response.json()
        setThreads([newThreadData, ...threads])
        setNewThread('')
      }
    } catch (error) {
      console.error('Error creating thread:', error)
    }
  }

  const handleVote = async (threadId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!isAuthenticated) return

    try {
      const response = await fetch(`/api/posts/${threadId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ type: voteType })
      })

      if (response.ok) {
        const updatedData = await response.json()
        setThreads(threads.map(thread => 
          thread.id === threadId 
            ? { ...thread, upvotes: updatedData.upvotes, downvotes: updatedData.downvotes }
            : thread
        ))
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (!isAuthenticated) return

    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        setCommunities(communities.map(community => 
          community.id === communityId 
            ? { ...community, memberCount: community.memberCount + 1 }
            : community
        ))
      }
    } catch (error) {
      console.error('Error joining community:', error)
    }
  }

  const handleViewStory = async (storyId: string) => {
    if (!isAuthenticated) return

    try {
      await fetch(`/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      setStories(stories.map(story => 
        story.id === storyId 
          ? { ...story, isViewed: true, viewCount: story.viewCount + 1 }
          : story
      ))
    } catch (error) {
      console.error('Error viewing story:', error)
    }
  }

  const handleStoryReaction = async (storyId: string, emoji: string) => {
    if (!isAuthenticated) return

    try {
      await fetch(`/api/stories/${storyId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ emoji })
      })

      setStories(stories.map(story => {
        if (story.id === storyId) {
          const newReactions = { ...story.reactions }
          newReactions[emoji] = (newReactions[emoji] || 0) + 1
          
          // Remove previous reaction if exists
          if (story.userReaction && story.userReaction !== emoji) {
            newReactions[story.userReaction] = Math.max(0, newReactions[story.userReaction] - 1)
          }

          return {
            ...story,
            reactions: newReactions,
            userReaction: story.userReaction === emoji ? null : emoji,
            reactionCount: story.userReaction === emoji 
              ? story.reactionCount - 1 
              : story.reactionCount + 1
          }
        }
        return story
      }))
    } catch (error) {
      console.error('Error reacting to story:', error)
    }
  }

=======
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rocket, Globe, Users, MessageSquare, Radio, BarChart3, Shield, Activity } from 'lucide-react'

export default function ELKZone() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Rocket className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium">Loading ELK.Zone 2.0...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <div className="mr-6 flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-blue-600" />
                <span className="hidden font-bold sm:inline-block text-xl">ELK.Zone 2.0</span>
                <Badge variant="secondary" className="text-xs">Federated</Badge>
              </div>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Button variant="ghost" size="sm" className="h-8">
<<<<<<< HEAD
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                <Hash className="mr-2 h-4 w-4" />
                Communities
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                <Camera className="mr-2 h-4 w-4" />
                Stories
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                <Radio className="mr-2 h-4 w-4" />
                Live
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                <Globe className="mr-2 h-4 w-4" />
=======
                Home
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                Communities
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                Live
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                Messages
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
                Fediverse
              </Button>
            </nav>
          </div>
<<<<<<< HEAD
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search threads, communities, users..." className="pl-8 md:w-[300px] lg:w-[400px]" />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8">
              <Bell className="h-4 w-4" />
            </Button>
            {isAuthenticated ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{currentUser?.displayName?.[0]}</AvatarFallback>
              </Avatar>
            ) : (
              <AuthModal>
                <Button variant="ghost" size="sm" className="h-8">
                  <LogIn className="h-4 w-4" />
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
      </header>

      <div className="container">
        <div className="flex gap-6 py-6">
          {/* Left Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="space-y-4">
              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      Create Thread
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="What's happening?"
                      value={newThread}
                      onChange={(e) => setNewThread(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" className="flex-1" onClick={handleCreateThread}>
                        <Send className="mr-2 h-4 w-4" />
                        Post
                      </Button>
                      <Button size="sm" variant="outline" title="Add image">
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" title="Add video">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" title="Add link">
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Trending Communities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {communities.slice(0, 5).map((community) => (
                    <div key={community.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {community.icon && <span className="text-lg">{community.icon}</span>}
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: community.color }}></div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">c/{community.name}</p>
                          <p className="text-xs text-muted-foreground">{community.memberCount} members</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleJoinCommunity(community.id)}
                        disabled={!isAuthenticated}
                      >
                        Join
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Radio className="h-5 w-5" />
                    Live Streams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {liveStreams.slice(0, 3).map((stream) => (
                    <div key={stream.id} className="flex items-center gap-3">
                      <div className="relative">
                        {stream.thumbnailUrl && (
                          <img src={stream.thumbnailUrl} alt={stream.title} className="w-16 h-12 object-cover rounded" />
                        )}
                        {stream.isLive && (
                          <div className="absolute bottom-1 right-1 bg-red-600 text-white text-xs px-1 rounded">
                            LIVE
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{stream.title}</p>
                        <p className="text-xs text-muted-foreground">{stream.streamer.displayName}</p>
                        <p className="text-xs text-muted-foreground">{stream.viewerCount} viewers</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Stories Section */}
          {stories.length > 0 && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Stories
                    {socket && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Wifi className="h-3 w-3" />
                        Live
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={12}
                    slidesPerView={6}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    breakpoints={{
                      320: { slidesPerView: 2 },
                      640: { slidesPerView: 3 },
                      768: { slidesPerView: 4 },
                      1024: { slidesPerView: 5 },
                      1280: { slidesPerView: 6 }
                    }}
                    className="stories-swiper"
                  >
                    {stories.map((story) => (
                      <SwiperSlide key={story.id}>
                        <div 
                          className="relative cursor-pointer group"
                          onClick={() => handleViewStory(story.id)}
                        >
                          <div className={`aspect-[9/16] rounded-lg overflow-hidden ${story.isViewed ? 'opacity-60' : ''}`}>
                            {story.videoUrl ? (
                              <video 
                                src={story.videoUrl} 
                                className="w-full h-full object-cover"
                                muted
                                loop
                                onMouseEnter={(e) => e.currentTarget.play()}
                                onMouseLeave={(e) => e.currentTarget.pause()}
                              />
                            ) : (
                              <img 
                                src={story.imageUrl} 
                                alt={story.author.displayName}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          {/* Author info */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={story.author.avatar} />
                                <AvatarFallback className="text-xs">
                                  {story.author.displayName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {story.author.displayName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(story.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Online indicator */}
                          {onlineUsers.has(story.author.id) && (
                            <div className="absolute top-2 right-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            </div>
                          )}

                          {/* Reactions overlay */}
                          {story.reactionCount > 0 && (
                            <div className="absolute top-2 left-2">
                              <div className="flex items-center gap-1 bg-black/50 rounded-full px-2 py-1">
                                <span className="text-xs">
                                  {Object.keys(story.reactions)[0]}
                                </span>
                                <span className="text-xs text-white">
                                  {story.reactionCount}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="threads">🏠 Home</TabsTrigger>
                <TabsTrigger value="communities">🧑‍🤝‍🧑 Communities</TabsTrigger>
                <TabsTrigger value="stories">📸 Stories</TabsTrigger>
                <TabsTrigger value="live">🎙️ Live</TabsTrigger>
                <TabsTrigger value="chat">💬 Chat</TabsTrigger>
                <TabsTrigger value="governance">⚙️ Governance</TabsTrigger>
              </TabsList>

              <TabsContent value="stories" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stories.map((story) => (
                    <Card key={story.id} className="overflow-hidden">
                      <div 
                        className="aspect-[9/16] cursor-pointer relative"
                        onClick={() => handleViewStory(story.id)}
                      >
                        {story.videoUrl ? (
                          <video 
                            src={story.videoUrl} 
                            className="w-full h-full object-cover"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        ) : (
                          <img 
                            src={story.imageUrl} 
                            alt={story.author.displayName}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Story overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Author info */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={story.author.avatar} />
                              <AvatarFallback>
                                {story.author.displayName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {story.author.displayName}
                              </p>
                              <p className="text-white/80 text-sm">
                                {new Date(story.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {onlineUsers.has(story.author.id) && (
                              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          
                          {/* Story reactions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-white/80 text-sm">
                                {story.viewCount} views
                              </span>
                              {story.reactionCount > 0 && (
                                <span className="text-white/80 text-sm">
                                  {story.reactionCount} reactions
                                </span>
                              )}
                            </div>
                            
                            {/* Quick reactions */}
                            <div className="flex gap-1">
                              {['❤️', '😂', '😮', '😢'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStoryReaction(story.id, emoji)
                                  }}
                                  className={`w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm hover:bg-white/30 transition-colors ${
                                    story.userReaction === emoji ? 'ring-2 ring-white' : ''
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expires in */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-white" />
                            <span className="text-white text-xs">
                              {Math.ceil((new Date(story.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60))}h
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {stories.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No stories yet</h3>
                      <p className="text-muted-foreground text-center">
                        Stories from people you follow will appear here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="chat" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Real-time Chat
                      {socket && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Wifi className="h-3 w-3" />
                          Connected
                        </div>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Chat with other users in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 border rounded-lg p-4 bg-muted/10">
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Chat feature coming soon</p>
                          <p className="text-sm">Real-time messaging with Matrix integration</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="governance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Federation Governance
                    </CardTitle>
                    <CardDescription>
                      Monitor and manage the federated network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Network Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Online Users</span>
                              <span className="text-sm font-medium">{onlineUsers.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Connected Instances</span>
                              <span className="text-sm font-medium">12</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Active Communities</span>
                              <span className="text-sm font-medium">{communities.length}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Policy Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Evaluations</span>
                              <span className="text-sm font-medium text-green-600">Pass</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Last Check</span>
                              <span className="text-sm font-medium">2m ago</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Violations</span>
                              <span className="text-sm font-medium">0</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Live Streams</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Active Now</span>
                              <span className="text-sm font-medium">{liveStreams.filter(s => s.isLive).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total Viewers</span>
                              <span className="text-sm font-medium">
                                {liveStreams.reduce((sum, s) => sum + s.viewerCount, 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Scheduled</span>
                              <span className="text-sm font-medium">3</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="threads" className="space-y-4">
                {threads.map((thread) => (
                  <Card key={thread.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={thread.author.avatar} />
                            <AvatarFallback>{thread.author.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{thread.author.displayName}</p>
                              <p className="text-sm text-muted-foreground">@{thread.author.username}</p>
                              {thread.author.isVerified && (
                                <Badge variant="secondary" className="text-xs">✓</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{thread.createdAt}</p>
                          </div>
                        </div>
                        {thread.isPinned && (
                          <Badge variant="outline">Pinned</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{thread.content}</p>
                      
                      {thread.media && thread.media.length > 0 && (
                        <div className="mb-4 grid grid-cols-2 gap-2">
                          {thread.media.map((media, index) => (
                            <div key={index} className="relative">
                              {media.type === 'image' ? (
                                <img src={media.url} alt="Thread media" className="w-full h-48 object-cover rounded" />
                              ) : (
                                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                                  <Play className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {thread.hashtags && thread.hashtags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {thread.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag.hashtag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleVote(thread.id, 'UPVOTE')}
                          disabled={!isAuthenticated}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          {thread.upvotes}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleVote(thread.id, 'DOWNVOTE')}
                          disabled={!isAuthenticated}
                        >
                          <ThumbsDown className="mr-2 h-4 w-4" />
                          {thread.downvotes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          {thread.commentCount}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Repeat className="mr-2 h-4 w-4" />
                          {thread.reposts}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="communities" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities.map((community) => (
                    <Card key={community.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {community.icon && <span className="text-2xl">{community.icon}</span>}
                          <div className="flex-1">
                            <CardTitle className="text-lg">c/{community.name}</CardTitle>
                            <CardDescription>{community.description}</CardDescription>
                          </div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: community.color }}></div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{community.memberCount} members</span>
                            <span>{community.postCount} posts</span>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleJoinCommunity(community.id)}
                            disabled={!isAuthenticated}
                          >
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="live" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveStreams.map((stream) => (
                    <Card key={stream.id}>
                      <CardHeader className="p-0">
                        <div className="relative">
                          {stream.thumbnailUrl && (
                            <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-48 object-cover rounded-t-lg" />
                          )}
                          {stream.isLive && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                              LIVE
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {stream.quality}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="text-lg mb-2">{stream.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={stream.streamer.avatar} />
                            <AvatarFallback>{stream.streamer.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{stream.streamer.displayName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>{stream.viewerCount} viewers</span>
                          </div>
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Watch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="fediverse" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Fediverse Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Akkoma Federation</p>
                            <p className="text-sm text-muted-foreground">Connected and synchronized</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Matrix Integration</p>
                            <p className="text-sm text-muted-foreground">Real-time messaging active</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">PeerTube Streaming</p>
                            <p className="text-sm text-muted-foreground">Live streaming ready</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden w-80 shrink-0 xl:block">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#ELKZone</p>
                      <p className="text-sm text-muted-foreground">1,234 posts</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#Fediverse</p>
                      <p className="text-sm text-muted-foreground">892 posts</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#Decentralized</p>
                      <p className="text-sm text-muted-foreground">567 posts</p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Federation Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Connected to 12 instances</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>3,456 federated users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>89 cross-instance posts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>23 active Matrix rooms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
=======
        </div>
      </header>

      <div className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to ELK.Zone 2.0</h1>
          <p className="text-xl text-muted-foreground mb-8">
            The next-generation federated social platform with AI-powered intelligence
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Federated Network
              </CardTitle>
              <CardDescription>
                Connect with users across multiple federated platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ActivityPub, Matrix, PeerTube, and Jitsi integration for seamless cross-platform communication.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Smart Communities
              </CardTitle>
              <CardDescription>
                AI-powered community management and content moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intelligent content organization and automated moderation with human oversight.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Real-time Chat
              </CardTitle>
              <CardDescription>
                Instant messaging with end-to-end encryption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure messaging with Matrix protocol integration and self-destructing messages.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-600" />
                Live Streaming
              </CardTitle>
              <CardDescription>
                Broadcast to the federated network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                PeerTube integration for decentralized video streaming and live broadcasts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Privacy First
              </CardTitle>
              <CardDescription>
                Your data, your rules, your control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                End-to-end encryption, zero-knowledge architecture, and GDPR compliance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-600" />
                Self-Healing
              </CardTitle>
              <CardDescription>
                AI-powered system monitoring and auto-recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Intelligent monitoring with predictive failure detection and automatic recovery.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Real-time federation network status and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Online</div>
                <div className="text-sm text-muted-foreground">Network Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-muted-foreground">Active Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
            </div>
          </CardContent>
        </Card>
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
      </div>
    </div>
  )
}