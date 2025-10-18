# Changelog

All notable changes to ELK.Zone 2.0 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Next.js 15
- Complete federated social media platform
- Real-time WebSocket integration
- BullMQ queue system with Redis
- Prisma ORM with SQLite database
- JWT authentication system
- shadcn/ui component integration
- Stories feature with reactions
- Live streaming support
- Community system
- ActivityPub federation preparation

### Fixed
- Duplicate lucide-react import issue
- Barrel optimization conflicts
- Database schema synchronization
- Queue worker configuration

## [0.1.0] - 2024-01-XX

### Added
- Project initialization
- Basic Next.js setup
- TypeScript configuration
- Tailwind CSS integration
- Prisma database setup
- Authentication system
- Real-time features
- API routes
- Component library

### Features

#### Core Platform
- **User Management**
  - User registration and authentication
  - Profile management
  - Karma system
  - Verification badges

- **Content System**
  - Thread creation and management
  - Voting system (upvotes/downvotes)
  - Comment system
  - Media attachments
  - Hashtag support

- **Communities**
  - Community creation and management
  - Member system
  - Moderation tools
  - Topic-based organization

- **Stories**
  - Ephemeral content (24 hours)
  - Image and video support
  - Reaction system
  - View tracking

- **Live Streaming**
  - Real-time video streaming
  - Viewer counts
  - Category system
  - Stream metadata

#### Technical Features
- **Real-time Communication**
  - Socket.IO integration
  - Live feed updates
  - Notification system
  - Online status tracking

- **Queue System**
  - BullMQ with Redis
  - Background job processing
  - Media processing
  - Notification delivery

- **Database**
  - Prisma ORM
  - SQLite for development
  - PostgreSQL ready for production
  - Migration system

- **Authentication**
  - JWT-based authentication
  - Secure password hashing
  - Token management
  - Session handling

- **Frontend**
  - Next.js 15 with App Router
  - TypeScript throughout
  - Tailwind CSS styling
  - shadcn/ui components
  - Responsive design
  - Mobile-first approach

#### API Endpoints
- **Authentication**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`

- **Posts**
  - `GET /api/posts`
  - `POST /api/posts`
  - `POST /api/posts/:id/vote`
  - `GET /api/posts/:id/comments`

- **Communities**
  - `GET /api/communities`
  - `POST /api/communities`
  - `POST /api/communities/:id/join`
  - `POST /api/communities/:id/leave`

- **Stories**
  - `GET /api/stories/active`
  - `POST /api/stories`
  - `POST /api/stories/:id/view`
  - `POST /api/stories/:id/react`

- **Live Streams**
  - `GET /api/live-streams`
  - `POST /api/live-streams/start`
  - `POST /api/live-streams/:id/end`

### Technical Stack

#### Frontend
- Next.js 15 (App Router)
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui (New York style)
- Lucide React Icons
- Socket.IO Client
- Swiper.js
- Zustand (state management)
- TanStack Query

#### Backend
- Node.js with TypeScript
- Prisma ORM
- SQLite (development) / PostgreSQL (production)
- Redis
- BullMQ
- Socket.IO
- JWT + bcrypt
- Multer + Sharp
- Z.AI Web Dev SDK

#### Development Tools
- ESLint
- Prettier
- Nodemon
- TSX
- Docker support

### Database Schema

#### Core Models
- **User** - Authentication and profiles
- **Post** - Thread-style posts
- **Comment** - Post comments
- **Community** - Topic communities
- **Story** - Ephemeral content
- **LiveStream** - Live video streams
- **Vote** - Voting records
- **Follow** - User relationships

#### Relationships
- Users can create posts and comments
- Posts belong to communities
- Users can join communities
- Stories are created by users
- Live streams are hosted by users
- Votes are cast by users on posts

### Configuration

#### Environment Variables
- `DATABASE_URL` - Database connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - JWT signing secret
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXT_PUBLIC_SOCKET_URL` - Socket.IO URL
- `ZAI_API_KEY` - AI SDK key (optional)

#### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run db:push` - Database schema sync
- `npm run lint` - Code linting

### Known Issues
- None currently

### Future Plans

#### Phase 5: Pre-Production & Federation Sync
- ActivityPub federation implementation
- Matrix integration
- PeerTube streaming
- Docker containerization
- CI/CD pipeline
- Monitoring setup

#### Phase 6: Future Enhancements
- AI feed ranking
- Spaces & Audio chat
- Hashtag recommender
- Verified identities
- Token reward system

---

## Development Notes

### Project Structure
The project follows a modular structure with clear separation of concerns:

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components
- `src/lib/` - Utility libraries and configurations
- `src/types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations

### Coding Standards
- TypeScript throughout
- ESLint + Prettier for code quality
- Conventional commits for version control
- Component-based architecture
- RESTful API design

### Performance Considerations
- Image optimization with Next.js Image
- Database indexing for queries
- Redis caching for frequently accessed data
- Queue system for background tasks
- Lazy loading for components

### Security Measures
- JWT authentication
- Input validation
- SQL injection prevention with Prisma
- XSS protection
- CORS configuration
- Environment variable protection

---

Built with ❤️ from Ankur