'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AuthModal } from '@/components/auth-modal'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Bell, 
  Search, 
  Plus, 
  Home, 
  Compass, 
  User, 
  Settings, 
  BarChart3, 
  Rocket, 
  Zap,
  Repeat,
  AtSign,
  Hash,
  Link2,
  Image,
  Video,
  Mic,
  Phone,
  Radio,
  Globe,
  Shield,
  Activity,
  Eye,
  MoreHorizontal,
  Reply,
  Retweet,
  Quote,
  ThumbsUp,
  ThumbsDown,
  Star,
  Flag,
  Volume2,
  Wifi,
  LogIn,
  Menu,
  Send,
  Paperclip,
  Smile,
  Play,
  Pause,
  Edit
} from 'lucide-react'

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

export default function ELKZone() {
  const [activeTab, setActiveTab] = useState('threads')
  const [newThread, setNewThread] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
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

  // Fetch data
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchData = async () => {
      try {
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
          setCommunities(communitiesData.communities || [])
        }

        // Fetch live streams
        const streamsResponse = await fetch('/api/live-streams?isLive=true')
        if (streamsResponse.ok) {
          const streamsData = await streamsResponse.json()
          setLiveStreams(streamsData.streams || [])
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
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="ghost" size="sm" className="h-8">
                <Hash className="mr-2 h-4 w-4" />
                Communities
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
                Fediverse
              </Button>
            </nav>
          </div>
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

          {/* Main Content */}
          <main className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="threads">Threads</TabsTrigger>
                <TabsTrigger value="communities">Communities</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
                <TabsTrigger value="fediverse">Fediverse</TabsTrigger>
              </TabsList>

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
      </div>
    </div>
  )
}