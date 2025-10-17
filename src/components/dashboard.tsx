'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  BarChart3, 
  Activity,
  Globe,
  Zap,
  Shield,
  Database,
  Search,
  Bell,
  Settings,
  Video,
  Mic,
  Phone,
  Mail,
  Calendar,
  Clock,
  Star,
  Award,
  Target,
  Rocket,
  GitBranch,
  Wifi,
  Server,
  Cloud,
  Lock,
  Unlock,
  UserPlus,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Flag,
  MoreHorizontal
} from 'lucide-react'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock analytics data
  const analytics = {
    users: {
      total: 125432,
      active: 45678,
      new: 1234,
      growth: 12.5
    },
    posts: {
      total: 89234,
      today: 8234,
      engagement: 78.9,
      growth: 23.4
    },
    communities: {
      total: 3847,
      active: 2341,
      new: 45,
      growth: 8.7
    },
    messages: {
      total: 1456789,
      today: 45678,
      active: 12345,
      growth: 34.2
    }
  }

  const recentActivity = [
    { id: 1, type: 'post', user: 'Alex Chen', action: 'created a new post in c/tech', time: '2 minutes ago' },
    { id: 2, type: 'comment', user: 'Sarah Johnson', action: 'commented on "Building the future"', time: '5 minutes ago' },
    { id: 3, type: 'join', user: 'Mike Wilson', action: 'joined c/gaming', time: '8 minutes ago' },
    { id: 4, type: 'message', user: 'Emma Davis', action: 'sent a message to General Chat', time: '12 minutes ago' },
    { id: 5, type: 'vote', user: 'David Kim', action: 'upvoted a post in c/design', time: '15 minutes ago' }
  ]

  const topCommunities = [
    { name: 'technology', members: 45200, posts: 892, growth: 15.2, icon: '💻' },
    { name: 'design', members: 32100, posts: 645, growth: 12.8, icon: '🎨' },
    { name: 'gaming', members: 28700, posts: 523, growth: 18.4, icon: '🎮' },
    { name: 'music', members: 19300, posts: 342, growth: 9.6, icon: '🎵' },
    { name: 'science', members: 15800, posts: 287, growth: 11.3, icon: '🔬' }
  ]

  const systemHealth = [
    { metric: 'API Response Time', value: '124ms', status: 'healthy', icon: Zap },
    { metric: 'Database Load', value: '45%', status: 'healthy', icon: Database },
    { metric: 'Memory Usage', value: '67%', status: 'warning', icon: Server },
    { metric: 'Network Latency', value: '23ms', status: 'healthy', icon: Wifi },
    { metric: 'Storage Used', value: '2.3TB', status: 'healthy', icon: Cloud },
    { metric: 'Active Connections', value: '12,456', status: 'healthy', icon: Activity }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Uniteverse Dashboard</h1>
          <p className="text-muted-foreground">Monitor your social media platform in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.users.growth}% from last month
            </p>
            <div className="mt-2 text-xs">
              <span className="text-green-600">+{analytics.users.new}</span> new today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.posts.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.posts.growth}% from yesterday
            </p>
            <div className="mt-2 text-xs">
              {analytics.posts.engagement}% engagement rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.communities.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.communities.growth}% growth
            </p>
            <div className="mt-2 text-xs">
              {analytics.communities.active} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.messages.today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.messages.growth}% from yesterday
            </p>
            <div className="mt-2 text-xs">
              {analytics.messages.active} active chats
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'post' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'comment' && <MessageCircle className="h-4 w-4 text-green-500" />}
                      {activity.type === 'join' && <UserPlus className="h-4 w-4 text-purple-500" />}
                      {activity.type === 'message' && <Mail className="h-4 w-4 text-orange-500" />}
                      {activity.type === 'vote' && <ThumbsUp className="h-4 w-4 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Features</CardTitle>
                <CardDescription>Core functionality status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Social Feed</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Communities</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Messaging</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span className="text-sm">Video Calls</span>
                  </div>
                  <Badge variant="secondary">In Development</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span className="text-sm">ElasticSearch</span>
                  </div>
                  <Badge variant="secondary">In Development</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">Analytics</span>
                  </div>
                  <Badge variant="secondary">In Development</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Communities</CardTitle>
              <CardDescription>Most active and growing communities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCommunities.map((community) => (
                  <div key={community.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{community.icon}</span>
                      <div>
                        <p className="font-medium">c/{community.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {community.members.toLocaleString()} members • {community.posts} posts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">+{community.growth}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">growth</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Activity Feed</CardTitle>
              <CardDescription>Live updates from across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar>
                      <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Platform performance and infrastructure status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {systemHealth.map((item) => (
                  <div key={item.metric} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.metric}</p>
                        <p className="text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={item.status === 'healthy' ? 'default' : item.status === 'warning' ? 'secondary' : 'destructive'}
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}