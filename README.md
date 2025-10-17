# ELK.Zone 2.0 - Federated Social Media Platform

🚀 **A comprehensive federated social media platform combining the best features of Twitter, Reddit, Discord, Instagram, and Twitch with ActivityPub, Matrix, and PeerTube integration.**

## 🌟 Features

### Social Media Features
- **📝 Threads/Twitter-style Feed** - Real-time posts with voting, reposts, and threading
- **🏘️ Reddit-style Communities** - Topic-based communities with moderation and role management
- **💬 Discord-style Messaging** - Real-time chat with rooms, reactions, and mentions
- **📸 Instagram-style Stories** - 24-hour ephemeral content with reactions and views
- **🎥 Twitch-style Live Streaming** - Integrated live streaming with real-time chat

### Federation & Integration
- **🌐 ActivityPub Federation** - Connect with Akkoma, Mastodon, and other fediverse platforms
- **🔐 Matrix Integration** - End-to-end encrypted messaging and voice/video calls
- **📺 PeerTube Streaming** - Decentralized video hosting and live streaming
- **🎙️ Jitsi Integration** - Voice and video conferencing capabilities

### Advanced Features
- **🔍 ELK Stack Integration** - Powerful search and analytics
- **📊 Real-time Analytics** - Trending topics, user engagement metrics
- **🎨 Modern UI/UX** - Responsive design with shadcn/ui components
- **🔒 Security First** - JWT authentication, bcrypt password hashing, rate limiting

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Federation    │
│                 │    │                 │    │                 │
│ Next.js 15      │◄──►│ Node.js/Express │◄──►│ ActivityPub     │
│ TypeScript      │    │ Prisma ORM     │    │ Matrix          │
│ Tailwind CSS    │    │ Socket.IO      │    │ PeerTube        │
│ shadcn/ui       │    │ JWT Auth       │    │ Jitsi           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite (development) or PostgreSQL (production)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd elk-zone-2.0
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
npm run db:push
npm run db:generate
```

4. **Seed sample data (optional)**
```bash
npm run db:seed
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Posts & Threads
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get specific post
- `POST /api/posts/[id]/vote` - Vote on post

### Communities
- `GET /api/communities` - Get all communities
- `POST /api/communities` - Create community
- `POST /api/communities/[id]/join` - Join community

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- WebSocket: `/api/socketio` - Real-time messaging

### Live Streaming
- `GET /api/live-streams` - Get live streams
- `POST /api/live-streams` - Create live stream

### Stories
- `GET /api/stories` - Get stories
- `POST /api/stories` - Create story
- `POST /api/stories/[id]/view` - View story
- `POST /api/stories/[id]/react` - React to story

## 🗄️ Database Schema

The platform uses a comprehensive Prisma schema with the following main models:

- **Users** - User profiles with federation support
- **Threads** - Posts with media, hashtags, and mentions
- **Communities** - Reddit-style communities with roles
- **Messages** - Real-time messaging with encryption
- **Stories** - 24-hour ephemeral content
- **LiveStreams** - Live streaming with chat integration
- **Analytics** - Event tracking and trending topics

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Federation Services
MATRIX_URL="https://matrix.example.com"
PEERTUBE_URL="https://peertube.example.com"
JITSI_URL="https://jitsi.example.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## 🎨 UI Components

The platform uses a modern component stack:

- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Consistent iconography
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling

## 🌍 Federation Setup

### ActivityPub (Akkoma)
1. Install Akkoma instance
2. Configure federation endpoints
3. Set up webhooks for cross-instance communication

### Matrix Integration
1. Set up Matrix Synapse server
2. Configure application service
3. Enable end-to-end encryption

### PeerTube Integration
1. Deploy PeerTube instance
2. Configure streaming endpoints
3. Set up live streaming keys

## 📊 Analytics & Monitoring

### ELK Stack Integration
- **Elasticsearch** - Search and indexing
- **Logstash** - Log processing
- **Kibana** - Data visualization

### Built-in Analytics
- Real-time user engagement
- Trending topics detection
- Community growth metrics
- Streaming analytics

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **bcrypt Password Hashing** - Strong password protection
- **Rate Limiting** - Prevent abuse
- **CORS Protection** - Secure cross-origin requests
- **Input Validation** - Prevent injection attacks
- **Content Moderation** - Automated and manual moderation

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
- Use PostgreSQL for production
- Configure reverse proxy (Nginx/Traefik)
- Set up SSL certificates
- Configure monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ActivityPub** - Federation protocol
- **Matrix** - Secure messaging
- **PeerTube** - Video streaming
- **Next.js** - React framework
- **Prisma** - Database ORM
- **shadcn/ui** - UI components

## 📞 Support

- 📧 Email: support@elk.zone
- 💬 Matrix: #elkzone:matrix.org
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/elk-zone-2.0/issues)

---

**🌟 Join the federated social media revolution with ELK.Zone 2.0!**