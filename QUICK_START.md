# 🚀 ELK.Zone 2.0 - Quick Start Guide

Get your federated social platform running in under 5 minutes!

## ⚡ One-Command Deployment

```bash
# Clone the repository
git clone https://github.com/youlyank/Evrst.git
cd Evrst

# Deploy everything (includes database setup, SSL, monitoring)
./scripts/deploy-all.sh --seed
```

That's it! 🎉 Your platform will be available at:
- **Main App**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin/admin)
- **Federation**: http://localhost:4000

## 🔧 Manual Setup (5 Steps)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings (optional for localhost)
```

### 3️⃣ Setup Database
```bash
npx prisma generate
npm run db:push
npm run db:seed  # Optional: Add sample data
```

### 4️⃣ Start Development
```bash
npm run dev
```

### 5️⃣ Access Platform
Open http://localhost:3000 in your browser

## 🐳 Docker Deployment (Recommended)

```bash
# Start all services with monitoring
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Production Deployment

### Domain Setup
1. Update `FEDERATION_DOMAIN` in `.env`
2. Run: `./scripts/deploy-all.sh`
3. Configure DNS to point to your server

### SSL Certificate
```bash
# Automatic Let's Encrypt (requires domain)
./scripts/security/setup-ssl.sh your-domain.com

# Or self-signed for development
./scripts/security/generate-keys.sh
```

## 📊 What's Included?

- ✅ **Complete Federated Platform** (ActivityPub + Matrix + PeerTube + Jitsi)
- ✅ **AI-Powered Monitoring** (ZAI SDK integration)
- ✅ **Auto-Healing Systems** (Predictive maintenance)
- ✅ **Security Hardening** (Zero-trust architecture)
- ✅ **Monitoring Stack** (Grafana + Prometheus)
- ✅ **SSL Certificates** (Auto-generated)
- ✅ **Database Setup** (Prisma + PostgreSQL)
- ✅ **Sample Data** (Ready to test)

## 🔍 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Main App | http://localhost:3000 | - |
| Grafana | http://localhost:3001 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Akkoma (Fediverse) | http://localhost:4000 | - |
| Matrix Chat | http://localhost:8008 | - |
| PeerTube | http://localhost:9000 | - |
| Jitsi Meet | http://localhost:4443 | - |

## 🛠️ Management Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Update database schema
npm run db:seed      # Add sample data
npm run db:reset     # Reset database

# Deployment
./scripts/deploy-all.sh      # Full deployment
./scripts/quick-deploy.sh    # Quick deployment
./scripts/backup.sh          # Backup data
./scripts/restore.sh         # Restore data

# Monitoring
docker-compose logs -f       # View all logs
docker-compose restart       # Restart services
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Required for production
FEDERATION_DOMAIN=your-domain.com
NEXTAUTH_SECRET=your-secret-key
ZAI_API_KEY=your-zai-api-key

# Optional for development
DATABASE_URL=postgresql://elkzone:password@localhost:5432/elkzone
```

### Port Configuration
- **3000**: Main Application
- **3001**: Grafana Dashboard
- **4000**: Akkoma (ActivityPub)
- **8008**: Matrix (Synapse)
- **9000**: PeerTube
- **4443**: Jitsi Meet
- **9090**: Prometheus

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5432 | xargs kill -9
```

### Database Connection Error
```bash
# Reset database
npm run db:reset
npm run db:push
```

### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

### Permission Issues
```bash
# Fix script permissions
chmod +x scripts/*.sh
```

## 📖 Next Steps

1. **Create Admin Account**: Register first user on the platform
2. **Configure Federation**: Set up your domain for external federation
3. **Customize Branding**: Update logos and colors in the UI
4. **Setup Monitoring**: Configure alerts in Grafana
5. **Enable SSL**: Configure proper certificates for production

## 🆘 Need Help?

- 📖 **Full Documentation**: [README.md](README.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/youlyank/Evrst/issues)
- 💬 **Community**: [Matrix Chat](https://matrix.to/#/#elkzone:matrix.org)
- 📧 **Support**: support@elk.zone

---

**🎉 Congratulations! You now have a fully functional federated social platform!**

Built with ❤️ using Next.js, Docker, and AI-powered intelligence.