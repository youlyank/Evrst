'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  MessageSquare, 
  Users, 
  Globe, 
  Video, 
  Search, 
  BarChart3, 
  Shield, 
  Zap,
  Database,
  Cloud,
  Wifi,
  Lock,
  Heart,
  Share2,
  Bookmark,
  Bell,
  Settings,
  Phone,
  Mic,
  Camera,
  Image,
  FileText,
  Link,
  TrendingUp,
  Award,
  Target,
  Rocket,
  GitBranch,
  Activity,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  UserPlus,
  Calendar,
  Clock,
  Star,
  Flag,
  MoreHorizontal,
  Filter,
  Grid,
  List,
  Archive,
  Trash2,
  Edit,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Check,
  X,
  AlertCircle,
  Info,
  HelpCircle,
  Download,
  Upload,
  RefreshCw,
  Save,
  Copy,
  ExternalLink,
  Home,
  Compass,
  User,
  Menu,
  Search as SearchIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  LogOut,
  LogIn,
  UserCheck,
  UserX,
  Mail,
  MailOpen,
  Send,
  Paperclip,
  Smile,
  AtSign,
  Hash,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Speaker,
  MicOff,
  VideoOff,
  Maximize,
  Minimize,
  Fullscreen,
  PictureInPicture,
  Cast,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
  Cpu,
  HardDrive,
  MemoryStick,
  Server,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Moon,
<<<<<<< HEAD
=======
  Cloud,
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  Cloudy,
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Timer,
<<<<<<< HEAD
=======
  Stopwatch,
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
  TimerReset,
  TimerOff,
  AlarmClock,
  AlarmClockCheck,
  AlarmClockOff,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12
} from 'lucide-react'

export function FeaturesShowcase() {
  const features = [
    {
      category: 'Social Features',
      icon: MessageSquare,
      color: 'bg-blue-500',
      items: [
        { name: 'Social Feed', description: 'Real-time posts with voting and comments', status: 'active' },
        { name: 'Communities', description: 'Reddit-style sub-communities', status: 'active' },
        { name: 'User Profiles', description: 'Customizable profiles with karma system', status: 'active' },
        { name: 'Stories', description: '24-hour ephemeral content', status: 'development' },
        { name: 'Live Streaming', description: 'Real-time video streaming', status: 'planned' }
      ]
    },
    {
      category: 'Communication',
      icon: Users,
      color: 'bg-green-500',
      items: [
        { name: 'Direct Messaging', description: '1-on-1 and group conversations', status: 'active' },
        { name: 'Voice Calls', description: 'High-quality voice communication', status: 'development' },
        { name: 'Video Calls', description: 'Face-to-face video conversations', status: 'development' },
        { name: 'Screen Sharing', description: 'Share your screen with others', status: 'planned' },
        { name: 'Discord Alternative', description: 'Full community voice/video platform', status: 'planned' }
      ]
    },
    {
      category: 'Search & Analytics',
      icon: Search,
      color: 'bg-purple-500',
      items: [
        { name: 'ElasticSearch', description: 'Full-text search across all content', status: 'development' },
        { name: 'Advanced Filters', description: 'Powerful search and filtering options', status: 'development' },
        { name: 'Analytics Dashboard', description: 'Kibana-powered insights', status: 'development' },
        { name: 'Trending Topics', description: 'Real-time trending content', status: 'planned' },
        { name: 'User Analytics', description: 'Detailed user behavior insights', status: 'planned' }
      ]
    },
    {
      category: 'Infrastructure',
      icon: Server,
      color: 'bg-orange-500',
      items: [
        { name: 'Microservices', description: 'Scalable service architecture', status: 'active' },
        { name: 'Real-time Updates', description: 'WebSocket-powered live updates', status: 'active' },
        { name: 'CDN Integration', description: 'Fast media delivery globally', status: 'development' },
        { name: 'Load Balancing', description: 'High availability infrastructure', status: 'development' },
        { name: 'Auto-scaling', description: 'Dynamic resource allocation', status: 'planned' }
      ]
    },
    {
      category: 'Security & Privacy',
      icon: Shield,
      color: 'bg-red-500',
      items: [
        { name: 'End-to-end Encryption', description: 'Secure messaging and calls', status: 'development' },
        { name: 'Two-factor Auth', description: 'Enhanced account security', status: 'development' },
        { name: 'Privacy Controls', description: 'Granular privacy settings', status: 'planned' },
        { name: 'Content Moderation', description: 'AI-powered moderation tools', status: 'planned' },
        { name: 'GDPR Compliance', description: 'Full data protection compliance', status: 'planned' }
      ]
    },
    {
      category: 'Federation',
      icon: Globe,
      color: 'bg-teal-500',
      items: [
        { name: 'ActivityPub', description: 'Fediverse compatibility', status: 'planned' },
        { name: 'Matrix Integration', description: 'Interoperable messaging', status: 'planned' },
        { name: 'Cross-platform', description: 'Universal accessibility', status: 'development' },
        { name: 'API Access', description: 'Developer-friendly APIs', status: 'development' },
        { name: 'Webhooks', description: 'Event-driven integrations', status: 'planned' }
      ]
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>
      case 'development':
        return <Badge className="bg-yellow-500">In Development</Badge>
      case 'planned':
        return <Badge className="bg-gray-500">Planned</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'active':
        return 100
      case 'development':
        return 60
      case 'planned':
        return 20
      default:
        return 0
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Uniteverse Platform Features</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive social media platform combining the best features of Reddit, Discord, Twitter, and modern communication tools
        </p>
      </div>

      {/* Platform Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            Platform Overview
          </CardTitle>
          <CardDescription>
            Next-generation social media with real-time communication, powerful search, and community-driven content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-blue-600">125K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-green-600">3.8K+</div>
              <div className="text-sm text-muted-foreground">Communities</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="text-3xl font-bold text-purple-600">89K+</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((category) => (
          <Card key={category.category} className="overflow-hidden">
            <CardHeader className={`${category.color} text-white`}>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-6 w-6" />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <Progress 
                      value={getStatusProgress(item.status)} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-6 w-6" />
            Technology Stack
          </CardTitle>
          <CardDescription>
            Modern, scalable technologies powering the Uniteverse platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Frontend</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Next.js 15 with App Router</div>
                <div>• React 19</div>
                <div>• TypeScript 5</div>
                <div>• Tailwind CSS 4</div>
                <div>• shadcn/ui Components</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Backend</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Node.js with Express</div>
                <div>• Prisma ORM</div>
                <div>• SQLite Database</div>
                <div>• Socket.io for Real-time</div>
                <div>• NextAuth.js for Auth</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Infrastructure</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Docker Containers</div>
                <div>• Redis Caching</div>
                <div>• AWS S3 Storage</div>
                <div>• ELK Stack (Planned)</div>
                <div>• WebRTC for Calls</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Search & Analytics</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• ElasticSearch</div>
                <div>• Logstash</div>
                <div>• Kibana Dashboard</div>
                <div>• Real-time Analytics</div>
                <div>• Custom Metrics</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Communication</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Matrix Protocol</div>
                <div>• WebRTC</div>
                <div>• Jitsi Integration</div>
                <div>• Voice/Video Calls</div>
                <div>• Screen Sharing</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Federation</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• ActivityPub</div>
                <div>• Fediverse Compatible</div>
                <div>• Akkoma Integration</div>
                <div>• Cross-platform</div>
                <div>• Open APIs</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Development Roadmap
          </CardTitle>
          <CardDescription>
            Our phased approach to building the complete platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Phase 1: Core Social Features (Current)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  User registration, communities, posts, voting, basic messaging
                </p>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">85% Complete</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Phase 2: Communication & Media</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Voice/video calls, stories, short videos, advanced messaging
                </p>
                <Progress value={30} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">30% Complete</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Phase 3: Search & Analytics</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  ElasticSearch integration, Kibana dashboards, advanced analytics
                </p>
                <Progress value={10} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">10% Complete</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Phase 4: Federation & Scaling</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  ActivityPub integration, Matrix protocol, global scaling
                </p>
                <Progress value={5} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">5% Complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}