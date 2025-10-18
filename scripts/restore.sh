#!/bin/bash

# ELK.Zone 2.0 - Restore Script
# This script handles database and file restoration from backups

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/backups/elkzone"
S3_BUCKET="elkzone-backups"
ENVIRONMENT=${1:-"production"}
BACKUP_DATE=${2:-""}

echo -e "${GREEN}🔄 Starting ELK.Zone 2.0 Restore${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"

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

# Function to list available backups
list_backups() {
    print_status "Available backups:"
    
    # Local backups
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${BLUE}Local backups:${NC}"
        ls -la "$BACKUP_DIR" | grep "^d" | grep "20" | awk '{print "  • " $9 " (" $6 " " $7 " " $8 ")"}'
    fi
    
    # S3 backups
    if command -v aws &> /dev/null; then
        echo -e "${BLUE}S3 backups:${NC}"
        aws s3 ls "s3://$S3_BUCKET/$ENVIRONMENT/" | awk '{print "  • " $2 " (" $1 " " $2 ")"}'
    fi
}

# Function to download backup from S3
download_from_s3() {
    local backup_path=$1
    print_status "Downloading backup from S3..."
    
    if command -v aws &> /dev/null; then
        aws s3 sync "s3://$S3_BUCKET/$ENVIRONMENT/$backup_path" "$BACKUP_DIR/$backup_path" --delete
        print_status "S3 download completed"
    else
        print_error "AWS CLI not found. Cannot download from S3."
        exit 1
    fi
}

# Function to restore Docker Compose environment
restore_docker() {
    local backup_path=$1
    print_status "Restoring Docker Compose environment..."
    
    cd /opt/elkzone
    
    # Stop services
    print_status "Stopping services..."
    docker compose -f docker-compose.prod.yml down
    
    # Restore PostgreSQL
    print_status "Restoring PostgreSQL..."
    if [ -f "$BACKUP_DIR/$backup_path/postgres_$backup_path.sql.gz" ]; then
        docker compose -f docker-compose.prod.yml up -d postgres
        sleep 10
        gunzip -c "$BACKUP_DIR/$backup_path/postgres_$backup_path.sql.gz" | docker compose -f docker-compose.prod.yml exec -T postgres psql -U elk -d elkzone
        print_status "✅ PostgreSQL restored"
    else
        print_error "❌ PostgreSQL backup file not found"
    fi
    
    # Restore Redis
    print_status "Restoring Redis..."
    if [ -f "$BACKUP_DIR/$backup_path/redis_$backup_path.rdb.gz" ]; then
        docker compose -f docker-compose.prod.yml up -d redis
        sleep 5
        # Copy Redis data file
        docker cp "$BACKUP_DIR/$backup_path/redis_$backup_path.rdb.gz" $(docker compose -f docker-compose.prod.yml ps -q redis):/data/dump.rdb.gz
        docker compose -f docker-compose.prod.yml exec redis bash -c "gunzip /data/dump.rdb.gz && redis-cli FLUSHALL && redis-cli DEBUG RESTART"
        print_status "✅ Redis restored"
    else
        print_error "❌ Redis backup file not found"
    fi
    
    # Restore uploads
    print_status "Restoring application files..."
    if [ -f "$BACKUP_DIR/$backup_path/uploads_$backup_path.tar.gz" ]; then
        tar -xzf "$BACKUP_DIR/$backup_path/uploads_$backup_path.tar.gz"
        print_status "✅ Application files restored"
    else
        print_error "❌ Application files backup not found"
    fi
    
    # Start all services
    print_status "Starting all services..."
    docker compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    sleep 30
    
    # Verify restoration
    print_status "Verifying restoration..."
    if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U elk > /dev/null; then
        print_status "✅ PostgreSQL is healthy"
    else
        print_error "❌ PostgreSQL health check failed"
    fi
    
    if docker compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null; then
        print_status "✅ Redis is healthy"
    else
        print_error "❌ Redis health check failed"
    fi
}

# Function to restore Kubernetes environment
restore_kubernetes() {
    local backup_path=$1
    print_status "Restoring Kubernetes environment..."
    
    NAMESPACE="elkzone-$ENVIRONMENT"
    
    # Scale down deployments
    print_status "Scaling down deployments..."
    kubectl scale deployment elkzone-backend --replicas=0 -n $NAMESPACE
    kubectl scale deployment elkzone-frontend --replicas=0 -n $NAMESPACE
    
    # Wait for pods to terminate
    kubectl wait --for=delete pod -l app=elkzone-backend -n $NAMESPACE --timeout=300s
    kubectl wait --for=delete pod -l app=elkzone-frontend -n $NAMESPACE --timeout=300s
    
    # Restore PostgreSQL
    print_status "Restoring PostgreSQL..."
    if [ -f "$BACKUP_DIR/$backup_path/postgres_$backup_path.sql.gz" ]; then
        # Create temporary pod for restoration
        kubectl run postgres-restore --image=postgres:15 --rm -i --restart=Never \
            --env="PGPASSWORD=your_password" \
            -n $NAMESPACE -- \
            psql -h elkzone-postgres -U elk -d elkzone < <(gunzip -c "$BACKUP_DIR/$backup_path/postgres_$backup_path.sql.gz")
        print_status "✅ PostgreSQL restored"
    else
        print_error "❌ PostgreSQL backup file not found"
    fi
    
    # Restore application data
    print_status "Restoring application data..."
    if [ -f "$BACKUP_DIR/$backup_path/uploads_$backup_path.tar.gz" ]; then
        # Create temporary pod for file restoration
        kubectl run file-restore --image=busybox --rm -i --restart=Never \
            -n $NAMESPACE -- \
            tar -xzf - -C /tmp/uploads < <(cat "$BACKUP_DIR/$backup_path/uploads_$backup_path.tar.gz")
        
        # Copy files to persistent volume
        kubectl cp /tmp/uploads/ $(kubectl get pod -l app=elkzone-backend -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}'):/app/uploads/
        print_status "✅ Application files restored"
    else
        print_error "❌ Application files backup not found"
    fi
    
    # Scale up deployments
    print_status "Scaling up deployments..."
    kubectl scale deployment elkzone-backend --replicas=3 -n $NAMESPACE
    kubectl scale deployment elkzone-frontend --replicas=3 -n $NAMESPACE
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=elkzone-backend -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=elkzone-frontend -n $NAMESPACE --timeout=300s
    
    # Verify restoration
    print_status "Verifying restoration..."
    kubectl exec -n $NAMESPACE deployment/elkzone-backend -- curl -f http://localhost:4000/api/health
}

# Function to verify backup before restore
verify_backup() {
    local backup_path=$1
    print_status "Verifying backup integrity..."
    
    # Check manifest
    if [ -f "$BACKUP_DIR/$backup_path/manifest.json" ]; then
        print_status "✅ Manifest found"
    else
        print_error "❌ Manifest not found"
        return 1
    fi
    
    # Check critical files
    local files=(
        "postgres_$backup_path.sql.gz"
        "uploads_$backup_path.tar.gz"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$BACKUP_DIR/$backup_path/$file" ] && [ -s "$BACKUP_DIR/$backup_path/$file" ]; then
            print_status "✅ $file: OK"
        else
            print_error "❌ $file: Missing or empty"
            return 1
        fi
    done
    
    return 0
}

# Main restore logic
if [ -z "$BACKUP_DATE" ]; then
    echo -e "${YELLOW}Usage: $0 <environment> <backup_date>${NC}"
    echo ""
    list_backups
    exit 1
fi

# Check if backup exists
if [ ! -d "$BACKUP_DIR/$BACKUP_DATE" ]; then
    print_warning "Backup not found locally. Checking S3..."
    download_from_s3 "$BACKUP_DATE"
fi

if [ ! -d "$BACKUP_DIR/$BACKUP_DATE" ]; then
    print_error "Backup not found: $BACKUP_DATE"
    list_backups
    exit 1
fi

# Verify backup
if ! verify_backup "$BACKUP_DATE"; then
    print_error "Backup verification failed"
    exit 1
fi

# Show backup details
if [ -f "$BACKUP_DIR/$BACKUP_DATE/manifest.json" ]; then
    print_status "Backup details:"
    cat "$BACKUP_DIR/$BACKUP_DATE/manifest.json" | jq '.'
fi

# Confirm restoration
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will replace all current data with the backup from $BACKUP_DATE${NC}"
echo -e "${YELLOW}⚠️  This action cannot be undone!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_status "Restore cancelled"
    exit 0
fi

# Perform restoration
print_status "Starting restoration process..."

# Check if we're in Docker Compose or Kubernetes environment
if [ -f "/opt/elkzone/docker-compose.prod.yml" ]; then
    restore_docker "$BACKUP_DATE"
elif command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
    restore_kubernetes "$BACKUP_DATE"
else
    print_error "Neither Docker Compose nor Kubernetes environment detected"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Restore completed successfully!${NC}"
echo ""
echo "📊 Restore Summary:"
echo "  • Backup date: $BACKUP_DATE"
echo "  • Environment: $ENVIRONMENT"
echo "  • Location: $BACKUP_DIR/$BACKUP_DATE"
echo ""
echo "🔍 Next Steps:"
echo "  • Verify application functionality"
echo "  • Check all services are running"
echo "  • Test user access and data integrity"
echo "  • Monitor system performance"
echo ""
echo -e "${GREEN}✅ System restored from backup!${NC}"