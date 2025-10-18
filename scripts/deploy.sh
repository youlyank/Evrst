#!/bin/bash

# ELK.Zone 2.0 Production Deployment Script
# This script automates the deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="elk-zone"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Create directories
mkdir -p $BACKUP_DIR
mkdir -p ./logs

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Check if Docker is running
check_docker() {
    log "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not running"
    fi
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    success "Docker is ready"
}

# Check environment variables
check_env() {
    log "Checking environment variables..."
    if [ ! -f .env.production ]; then
        error ".env.production file not found. Please create it from .env.production.example"
    fi
    
    # Load environment variables
    source .env.production
    
    # Check required variables
    required_vars=("DATABASE_URL" "JWT_SECRET" "NEXT_PUBLIC_APP_URL")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    success "Environment variables are set"
}

# Backup current database
backup_database() {
    log "Creating database backup..."
    if docker ps | grep -q elk-zone-postgres; then
        backup_file="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
        docker exec elk-zone-postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > $backup_file
        success "Database backup created: $backup_file"
    else
        warning "No running database found, skipping backup"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment process..."
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build new images
    log "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
    
    # Seed database if needed
    log "Seeding database..."
    docker-compose -f docker-compose.prod.yml exec backend npm run db:seed || true
    
    success "Deployment completed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Check if frontend is responding
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "Frontend is healthy"
    else
        error "Frontend health check failed"
    fi
    
    # Check if backend is responding
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Check database connection
    if docker-compose -f docker-compose.prod.yml exec -T backend npx prisma db pull --force > /dev/null 2>&1; then
        success "Database connection is healthy"
    else
        error "Database connection failed"
    fi
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting ELK.Zone 2.0 deployment..."
    
    check_docker
    check_env
    backup_database
    deploy
    health_check
    cleanup
    
    success "🎉 ELK.Zone 2.0 has been successfully deployed!"
    log "Access your application at: https://elk.zone"
    log "Monitoring dashboard: https://elk.zone:3001"
    log "Kibana analytics: https://elk.zone:5601"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT

# Run main function
main "$@"