#!/bin/bash

# ELK.Zone 2.0 - Quick Production Deployment Script
# This script handles the complete deployment process for single VM setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="elk.zone"
REPO_URL="https://github.com/your-org/elkzone-2.0.git"
PROJECT_DIR="/opt/elkzone"

echo -e "${GREEN}🚀 Starting ELK.Zone 2.0 Quick Production Deployment${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y docker.io docker-compose curl wget git certbot python3-certbot-nginx htop

# Add user to docker group
print_status "Adding user to docker group..."
sudo usermod -aG docker $USER
newgrp docker

# Create project directory
print_status "Creating project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Clone repository
print_status "Cloning repository..."
if [ -d "$PROJECT_DIR/.git" ]; then
    cd $PROJECT_DIR
    git pull origin main
else
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

# Create environment file
print_status "Setting up environment configuration..."
if [ ! -f ".env.prod" ]; then
    cp .env.prod.example .env.prod
    print_warning "Please edit .env.prod with your actual configuration values before continuing!"
    print_warning "Press Enter to continue after editing .env.prod..."
    read -p ""
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads backups logs prometheus logstash/pipeline nginx/ssl

# Generate SSL certificates
print_status "Setting up SSL certificates..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    print_status "Obtaining Let's Encrypt certificate..."
    sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email admin@$DOMAIN --agree-tos --no-eff-email
fi

# Build and start services
print_status "Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Health checks
print_status "Performing health checks..."

# Check if frontend is responding
if curl -f -s http://localhost:3000 > /dev/null; then
    print_status "✅ Frontend is healthy"
else
    print_error "❌ Frontend health check failed"
fi

# Check if backend is responding
if curl -f -s http://localhost:4000/api/health > /dev/null; then
    print_status "✅ Backend is healthy"
else
    print_error "❌ Backend health check failed"
fi

# Check database connection
if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U elk > /dev/null; then
    print_status "✅ Database is healthy"
else
    print_error "❌ Database health check failed"
fi

# Check Redis connection
if docker compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null; then
    print_status "✅ Redis is healthy"
else
    print_error "❌ Redis health check failed"
fi

# Setup automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx") | crontab -

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/elkzone > /dev/null <<EOF
$PROJECT_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx
    endscript
}
EOF

# Create systemd service for auto-start
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/elkzone.service > /dev/null <<EOF
[Unit]
Description=ELK.Zone 2.0
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start systemd service
sudo systemctl enable elkzone.service
sudo systemctl start elkzone.service

# Display deployment information
echo ""
echo -e "${GREEN}🎉 ELK.Zone 2.0 deployment completed successfully!${NC}"
echo ""
echo "📊 Service URLs:"
echo "  • Main Application: https://$DOMAIN"
echo "  • API: https://$DOMAIN/api"
echo "  • Kibana: https://$DOMAIN:5601"
echo "  • Grafana: https://$DOMAIN:3001"
echo "  • Prometheus: https://$DOMAIN:9090"
echo ""
echo "🔧 Management Commands:"
echo "  • View logs: docker compose -f $PROJECT_DIR/docker-compose.prod.yml logs -f"
echo "  • Restart services: docker compose -f $PROJECT_DIR/docker-compose.prod.yml restart"
echo "  • Update: cd $PROJECT_DIR && git pull && docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "📁 Important Paths:"
echo "  • Project: $PROJECT_DIR"
echo "  • Uploads: $PROJECT_DIR/uploads"
echo "  • Backups: $PROJECT_DIR/backups"
echo "  • Logs: $PROJECT_DIR/logs"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  • Make sure your DNS A record points to this server's IP"
echo "  • Configure firewall to allow ports 80, 443"
echo "  • Set up monitoring alerts in Grafana"
echo "  • Regularly backup your database to external storage"
echo ""
echo -e "${GREEN}✅ Deployment is ready for production use!${NC}"