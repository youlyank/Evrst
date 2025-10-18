# ELK.Zone 2.0 - Federated Social Media Platform

<<<<<<< HEAD
A comprehensive, production-ready federated social media platform built with Next.js 15, TypeScript, and modern web technologies. ELK.Zone 2.0 combines the best features of Twitter, Reddit, Instagram Stories, and live streaming into a unified federated experience.

## 🚀 Features

### Core Social Features
- **Real-time Feed** - WebSocket-powered live updates
- **Thread System** - Twitter-like posts with voting, comments, and sharing
- **Communities** - Reddit-style topic-based communities
- **Stories** - Instagram-style ephemeral content with reactions
- **Live Streaming** - Integrated live video streaming
- **Federation** - ActivityPub support for cross-platform communication

### Technical Features
- **Real-time Communication** - Socket.IO for instant updates
- **Queue System** - BullMQ with Redis for background jobs
- **Database** - Prisma ORM with SQLite
- **Authentication** - JWT-based auth system
- **Media Processing** - AI-powered content analysis
- **Responsive Design** - Mobile-first with Tailwind CSS
- **Component Library** - shadcn/ui components

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **State Management**: Zustand + TanStack Query
- **Real-time**: Socket.IO Client
- **Carousels**: Swiper.js

### Backend
- **Runtime**: Node.js with TypeScript
- **Database**: Prisma ORM + SQLite
- **Caching**: Redis
- **Queue System**: BullMQ
- **Real-time**: Socket.IO Server
- **Authentication**: JWT + bcrypt
- **AI Integration**: Z.AI Web Dev SDK
- **File Uploads**: Multer + Sharp

### Infrastructure
- **Development**: Nodemon + TSX
- **Code Quality**: ESLint + Prettier
- **Containerization**: Docker ready
- **Monitoring**: Health checks + logging

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Redis** (v7.0 or higher) - for queue system and caching
- **Git** - for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/youlyank/Evrst.git
cd Evrst
```

### 2. Install Dependencies

=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
```bash
npm install
```

<<<<<<< HEAD
### 3. Environment Setup

=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

<<<<<<< HEAD
# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Socket.IO
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# AI SDK (Optional - for content analysis)
ZAI_API_KEY="your-zai-api-key"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB

# Development
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npm run db:push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 5. Start Redis Server

Make sure Redis is running on your system:

```bash
# On macOS with Homebrew
brew services start redis

# On Ubuntu/Debian
sudo systemctl start redis-server

# On Windows (using WSL)
sudo service redis-server start

# Or run Redis directly
redis-server
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Socket.IO**: ws://localhost:3000/api/socketio

## 📁 Project Structure

```
Evrst/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── posts/         # Post management
│   │   │   ├── communities/   # Community management
│   │   │   ├── stories/       # Story management
│   │   │   ├── live-streams/  # Live streaming
│   │   │   └── socketio/      # Socket.IO server
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── auth-modal.tsx    # Authentication modal
│   ├── lib/                  # Utility libraries
│   │   ├── db.ts            # Database client
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── queue.ts         # Queue configuration
│   │   └── socket.ts        # Socket.IO configuration
│   └── types/               # TypeScript type definitions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── uploads/                 # File upload directory
├── server.ts               # Custom server setup
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🗄️ Database Schema

The application uses the following main models:

### User
- Authentication and profile management
- Karma system for reputation
- Verification status

### Post
- Thread-style posts with content
- Voting system (upvotes/downvotes)
- Media attachments
- Hashtag support

### Community
- Topic-based communities
- Member management
- Post aggregation

### Story
- Ephemeral content (24 hours)
- Image/video support
- Reaction system

### LiveStream
- Real-time video streaming
- Viewer counts
- Category management

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript checks

# Queue Management
npm run queue:worker # Start queue worker
npm run queue:ui     # Open BullMQ dashboard (if configured)
```

## 🔐 Authentication

The application uses JWT-based authentication:

1. **Login**: Users authenticate with username/password
2. **Token Generation**: JWT tokens are generated upon successful login
3. **Token Storage**: Tokens are stored in localStorage
4. **API Protection**: All API endpoints require valid JWT tokens
5. **Socket Authentication**: WebSocket connections are authenticated via tokens

### Authentication Flow

```typescript
// Login
POST /api/auth/login
{
  "username": "user",
  "password": "password"
}

// Response
{
  "token": "jwt-token",
  "user": { ... }
}

// Protected API call
GET /api/posts
Authorization: Bearer jwt-token
```

## 🔄 Real-time Features

### Socket.IO Events

#### Client → Server
- `join_feed` - Join the main feed
- `join_community` - Join a specific community
- `leave_community` - Leave a community

#### Server → Client
- `new_post` - New post in feed
- `new_comment` - New comment on post
- `new_like` - New like on post
- `new_story` - New story available
- `stream_start` - Live stream started
- `stream_end` - Live stream ended
- `user_status_update` - User online/offline status

### Queue System

The application uses BullMQ for background processing:

- **Post Processing**: Content analysis and hashtag extraction
- **Notifications**: Email and push notifications
- **Media Processing**: Image optimization and thumbnail generation
- **Federation**: ActivityPub message delivery
- **Cleanup**: Expired content removal

## 🎨 UI Components

The application uses shadcn/ui components with custom theming:

### Available Components
- Button, Card, Input, Textarea
- Avatar, Badge, Tabs
- Dialog, Dropdown, Sheet
- Form, Label, Select
- Toast, Alert, Skeleton

### Custom Components
- `AuthModal` - Authentication modal
- `PostCard` - Post display component
- `StoryViewer` - Story viewing component
- `LiveStreamCard` - Live stream component
=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

## 🚀 Deployment

### Docker Deployment
<<<<<<< HEAD

```dockerfile
# Dockerfile example
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - redis
      - db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: elkzone
      POSTGRES_USER: elk
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Variables for Production

```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@localhost:5432/elkzone"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_SECRET="your-production-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

## 🔧 Configuration

### Next.js Configuration

The application uses custom Next.js configuration for:
- Image optimization
- Custom server setup
- Socket.IO integration
- Environment variable handling

### Tailwind Configuration

Custom Tailwind setup with:
- shadcn/ui design system
- Custom color palette
- Responsive breakpoints
- Animation utilities

## 🧪 Testing

While this project doesn't include tests in the current version, here's the recommended testing setup:

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Posts API

```bash
# Get all posts
GET /api/posts

# Create new post
POST /api/posts
{
  "content": "Post content",
  "type": "TEXT"
}

# Vote on post
POST /api/posts/:id/vote
{
  "type": "UPVOTE" | "DOWNVOTE"
}
```

### Communities API

```bash
# Get all communities
GET /api/communities

# Join community
POST /api/communities/:id/join
```

### Stories API

```bash
# Get active stories
GET /api/stories/active

# View story
POST /api/stories/:id/view

# React to story
POST /api/stories/:id/react
{
  "emoji": "❤️"
}
```

## 🔍 Monitoring & Debugging

### Health Checks

```bash
# Check application health
GET /api/health

# Check database connection
GET /api/health/db

# Check Redis connection
GET /api/health/redis
```

### Logging

The application uses structured logging:
- Development: Console output
- Production: File-based logging (recommended)

### Performance Monitoring

Consider integrating:
- **APM**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible

## 🛡️ Security Considerations

- **JWT Tokens**: Use strong secrets and implement rotation
- **Input Validation**: Validate all user inputs
- **Rate Limiting**: Implement API rate limiting
- **CORS**: Configure proper CORS policies
- **HTTPS**: Use HTTPS in production
- **Environment Variables**: Never commit secrets to git

## 🐛 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check Redis status
   redis-cli ping
   
   # Start Redis
   redis-server
   ```

2. **Database Connection Issues**
   ```bash
   # Reset database
   npm run db:push -- --force-reset
   
   # Check Prisma schema
   npx prisma validate
   ```

3. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

4. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node modules
   rm -rf node_modules package-lock.json
   npm install
   ```
=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

<<<<<<< HEAD
- **Next.js Team** - For the amazing framework
- **Prisma Team** - For the excellent ORM
- **shadcn/ui** - For the beautiful component library
- **Socket.IO Team** - For real-time communication
- **BullMQ Team** - For the robust queue system

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/youlyank/Evrst/issues)
3. Create a new issue with detailed information
4. Join our community discussions

---

**Built with ❤️ from Ankur**

*ELK.Zone 2.0 - The future of federated social media*
=======
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
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
