# 🚀 ELK.Zone 2.0 - Complete Installation Guide

This guide will help you set up ELK.Zone 2.0 from scratch with all dependencies and configurations.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Redis** (v7.0 or higher) - [Installation Guide](#redis-installation)

### Optional Software
- **Docker** (v20.0 or higher) - For containerized deployment
- **Docker Compose** - For multi-container setup
- **PostgreSQL** (v15 or higher) - For production database

## 🔧 Redis Installation

### macOS (using Homebrew)
```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install Redis
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
```

### Windows (using WSL)
```bash
# In WSL Ubuntu terminal
sudo apt update
sudo apt install redis-server

# Start Redis
sudo service redis-server start

# Verify Redis is running
redis-cli ping
```

### Other Systems
```bash
# Download and compile Redis
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
make install

# Start Redis server
redis-server
```

## 📥 Installation Steps

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/youlyank/Evrst.git

# Navigate to the project directory
cd Evrst
```

### 2. Install Node.js Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - Next.js 15 and related packages
# - Prisma ORM
# - TypeScript and development tools
# - UI components (shadcn/ui)
# - Socket.IO and real-time libraries
# - Queue system (BullMQ)
# - Authentication libraries
# - Image processing libraries
# - And much more...
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env  # or use your preferred editor
```

#### Required Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secret (generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Socket.IO
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# Development
NODE_ENV="development"
```

#### Generate Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate NextAuth secret
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema to SQLite
npm run db:push

# (Optional) View database in Prisma Studio
npx prisma studio
# This will open a browser window at http://localhost:5555
```

#### Database Schema Overview

The database includes the following models:
- **User** - User accounts and profiles
- **Post** - Social media posts/threads
- **Comment** - Post comments
- **Community** - Topic-based communities
- **Story** - Ephemeral stories (24 hours)
- **LiveStream** - Live video streams
- **Vote** - Voting records
- **Follow** - User relationships

### 5. Verify Redis Connection

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check Redis info
redis-cli info server
```

### 6. Start Development Server

```bash
# Start the development server
npm run dev
```

You should see output like:
```
> nextjs_tailwind_shadcn_ts@0.1.0 dev
> nodemon server.ts

[nodemon] 3.1.10
[nodemon] watching path(s): server.ts src/**/*
[nodemon] watching extensions: ts,tsx,js,jsx
[nodemon] starting `npx tsx server.ts`

> Ready on http://127.0.0.1:3000
> Socket.IO server running at ws://127.0.0.1:3000/api/socketio
```

### 7. Verify Installation

Open your browser and navigate to:
- **Main Application**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **Database Studio**: http://localhost:5555 (if running `npx prisma studio`)

## 🐳 Docker Installation (Alternative)

### Using Docker Compose (Recommended)

```bash
# Ensure Docker and Docker Compose are installed
docker --version
docker-compose --version

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- **ELK.Zone Application** (port 3000)
- **PostgreSQL Database** (port 5432)
- **Redis** (port 6379)
- **Nginx Reverse Proxy** (ports 80, 443)

### Using Docker Build

```bash
# Build the Docker image
docker build -t elkzone .

# Run the container
docker run -p 3000:3000 --env-file .env elkzone
```

## 🔍 Verification Steps

### 1. Check Application Health

```bash
# Test API health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status": "ok", "timestamp": "...", "uptime": "..."}
```

### 2. Test Database Connection

```bash
# Test database health
curl http://localhost:3000/api/health/db

# Expected response:
# {"status": "ok", "database": "connected"}
```

### 3. Test Redis Connection

```bash
# Test Redis health
curl http://localhost:3000/api/health/redis

# Expected response:
# {"status": "ok", "redis": "connected"}
```

### 4. Test Socket.IO Connection

Open your browser's developer console and check:
```javascript
// Should see WebSocket connection established
// Socket.IO should connect to ws://localhost:3000/api/socketio
```

## 🛠️ Development Workflow

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript checks

# Queue Management
npm run queue:worker # Start queue worker
```

### File Structure

```
Evrst/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Custom components
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript types
├── prisma/               # Database schema
├── public/               # Static assets
├── uploads/              # File uploads
├── scripts/              # Utility scripts
├── docker-compose.yml    # Docker configuration
├── Dockerfile           # Docker image
├── .env.example         # Environment template
└── README.md            # Project documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `NEXTAUTH_SECRET` | NextAuth secret | Required |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO client URL | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

### Database Configuration

For production, switch to PostgreSQL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/elkzone"
```

### Redis Configuration

For production Redis with authentication:

```env
REDIS_URL="redis://username:password@localhost:6379"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

#### 2. Redis Connection Failed
```bash
# Check Redis status
redis-cli ping

# Start Redis server
redis-server

# Check Redis configuration
redis-cli config get "*"
```

#### 3. Database Issues
```bash
# Reset database
npm run db:push -- --force-reset

# Regenerate Prisma client
npx prisma generate

# Check database schema
npx prisma validate
```

#### 4. Node Modules Issues
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
rm package-lock.json

# Reinstall dependencies
npm install
```

#### 5. Permission Issues
```bash
# Fix file permissions
chmod +x scripts/*.sh

# Fix upload directory permissions
mkdir -p uploads
chmod 755 uploads
```

### Getting Help

1. **Check the logs**: Look at the terminal output for error messages
2. **Check the browser console**: Open developer tools for client-side errors
3. **Review configuration**: Ensure all environment variables are set correctly
4. **Check dependencies**: Verify all required services are running
5. **Create an issue**: [GitHub Issues](https://github.com/youlyank/Evrst/issues)

## 🎯 Next Steps

After successful installation:

1. **Explore the Features**: Browse the application and test all features
2. **Read the Documentation**: Check `README.md` for detailed feature descriptions
3. **Configure for Production**: Update environment variables for production use
4. **Set up Monitoring**: Configure logging and monitoring tools
5. **Deploy**: Use Docker or traditional deployment methods

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Socket.IO Documentation](https://socket.io/docs)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Contributing

We welcome contributions! Please read the [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 🎉 Installation Complete!

You have successfully installed ELK.Zone 2.0! The application is now running at http://localhost:3000.

### What's Next?
1. **Create an Account**: Sign up for a new account
2. **Explore Communities**: Browse and join communities
3. **Create Content**: Post threads, stories, and start live streams
4. **Configure**: Adjust settings to your preference
5. **Deploy**: When ready, deploy to production

### Need Help?
- 📖 Check the [README.md](README.md) for detailed feature documentation
- 🐛 Report issues on [GitHub](https://github.com/youlyank/Evrst/issues)
- 💬 Join our community discussions

---

**Built with ❤️ from Ankur**

*ELK.Zone 2.0 - The future of federated social media*