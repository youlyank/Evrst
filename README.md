# ELK.Zone 2.0 - Federated Social Media Platform

A next-generation federated social media platform combining the best features of ActivityPub (Akkoma), Matrix, Reddit-style communities, Threads/Twitter feed, Instagram Stories, and live streaming.

## 🚀 Features

### Core Social Features
- **🏠 Unified Feed**: Real-time federated feed combining posts from followed users and communities
- **🧑‍🤝‍🧑 Communities**: Reddit-style communities with voting, moderation, and role management
- **📸 Stories**: 24-hour expiring posts with reactions and view tracking
- **🎙️ Live Streaming**: Integrated PeerTube streaming with real-time chat
- **💬 Real-time Chat**: Matrix-based messaging with federation support

### Federation & Governance
- **🌐 ActivityPub**: Full federation with Mastodon, Pixelfed, and other ActivityPub platforms
- **🔐 Matrix Integration**: Decentralized chat and video calls
- **⚖️ Governance**: Automated policy evaluation and federation management
- **📊 Monitoring**: Prometheus metrics and Grafana dashboards

### Advanced Features
- **🔄 Real-time Updates**: WebSocket-based live updates
- **📱 Mobile Responsive**: Optimized for all devices
- **🎨 Modern UI**: Built with shadcn/ui and Tailwind CSS
- **⚡ High Performance**: Caching with Redis and optimized database queries

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ELK.Zone      │    │   Akkoma        │    │   Matrix        │
│   (Next.js)     │◄──►│   (ActivityPub) │◄──►│   (Chat)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PeerTube      │    │   Jitsi         │    │   PostgreSQL    │
│   (Video)       │    │   (Calls)       │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis         │    │   Prometheus    │    │   Grafana       │
│   (Cache)       │    │   (Metrics)     │    │   (Monitoring)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** component library
- **Socket.IO Client** for real-time updates
- **Swiper.js** for story carousels

### Backend
- **Next.js API Routes** for REST API
- **Socket.IO** for WebSocket connections
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and sessions
- **Z.AI SDK** for AI features

### Infrastructure
- **Docker & Docker Compose** for containerization
- **Nginx** as reverse proxy
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Akkoma** for ActivityPub federation
- **Matrix Synapse** for chat
- **PeerTube** for video streaming
- **Jitsi** for video calls

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (if not using Docker)

### 1. Clone and Setup
```bash
git clone https://github.com/elkzone/elkzone.git
cd elkzone
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start with Docker
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f elkzone
```

### 3. Local Development
```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev

# Start socket server (in another terminal)
npm run socket:dev
```

## 🌐 Access Points

Once deployed, you can access different services at:

- **Main App**: https://elkzone.com
- **Social Feed**: https://social.elkzone.com (Akkoma)
- **Chat**: https://chat.elkzone.com (Matrix)
- **Video**: https://video.elkzone.com (PeerTube)
- **Calls**: https://meet.elkzone.com (Jitsi)
- **Monitoring**: https://monitor.elkzone.com (Grafana)

## 📊 Monitoring

### Prometheus Metrics
Available at `http://localhost:9090` (or your monitoring domain)

Key metrics:
- `elkzone_active_users_total`
- `elkzone_posts_total`
- `elkzone_live_streams_active`
- `federation_handshake_total`
- `governance_policy_evaluations_total`

### Grafana Dashboards
Access at `https://monitor.elkzone.com` with credentials from `.env`

Pre-configured dashboards:
- **Overview**: System health and key metrics
- **Federation**: Cross-instance communication
- **Performance**: Response times and error rates
- **Social**: User engagement and content metrics

## 🔧 Configuration

### Environment Variables
Key configuration options in `.env`:

```bash
# Application
NEXTAUTH_URL=https://elkzone.com
NEXTAUTH_SECRET=your-secret-here

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Federation
ACTIVITYPUB_HOST=elkzone.com
MATRIX_SERVER_NAME=matrix.elkzone.com

# Real-time
SOCKET_URL=http://socket-server:3001
REDIS_URL=redis://redis:6379
```

### Database Schema
The application uses Prisma with PostgreSQL. Key models:

- **User**: Unified user identity across platforms
- **Thread**: Posts and content
- **Community**: Reddit-style communities
- **Story**: 24-hour expiring content
- **LiveStream**: Video streaming sessions
- **Message**: Chat messages

## 🚀 Deployment

### Production Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose exec elkzone npm run db:deploy

# Setup SSL certificates
./scripts/setup-ssl.sh
```

### Scaling
- **Horizontal Scaling**: Add more ELK.Zone instances behind load balancer
- **Database**: Use PostgreSQL clustering for high availability
- **Cache**: Scale Redis with clustering
- **CDN**: Use CloudFlare for static assets

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ActivityPub** for federation protocol
- **Akkoma** for ActivityPub implementation
- **Matrix** for decentralized chat
- **PeerTube** for video streaming
- **Jitsi** for video calls
- **Next.js** for the framework
- **shadcn/ui** for UI components

## 📞 Support

- **Documentation**: https://docs.elkzone.com
- **Community**: https://community.elkzone.com
- **Issues**: https://github.com/elkzone/elkzone/issues
- **Matrix Chat**: #elkzone:matrix.elkzone.com

---

🦌 **ELK.Zone 2.0** - Building the future of federated social media