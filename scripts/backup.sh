#!/bin/bash

# ELK.Zone 2.0 - Backup Script
# This script handles database and file backups

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/backups/elkzone"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
S3_BUCKET="elkzone-backups"
ENVIRONMENT=${1:-"production"}

echo -e "${GREEN}🔄 Starting ELK.Zone 2.0 Backup${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Timestamp: ${DATE}${NC}"

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

# Create backup directory
mkdir -p $BACKUP_DIR
cd $BACKUP_DIR

# Create backup subdirectory
BACKUP_PATH="$BACKUP_DIR/$DATE"
mkdir -p $BACKUP_PATH

print_status "Created backup directory: $BACKUP_PATH"

# Function to backup Docker Compose environment
backup_docker() {
    print_status "Backing up Docker Compose environment..."
    
    # Backup PostgreSQL
    print_status "Backing up PostgreSQL..."
    docker compose -f /opt/elkzone/docker-compose.prod.yml exec -T postgres pg_dump -U elk elkzone | gzip > "$BACKUP_PATH/postgres_$DATE.sql.gz"
    
    # Backup Redis
    print_status "Backing up Redis..."
    docker compose -f /opt/elkzone/docker-compose.prod.yml exec -T redis redis-cli --rdb - | gzip > "$BACKUP_PATH/redis_$DATE.rdb.gz"
    
    # Backup application files
    print_status "Backing up application files..."
    tar -czf "$BACKUP_PATH/uploads_$DATE.tar.gz" -C /opt/elkzone uploads/
    
    # Backup configuration files
    print_status "Backing up configuration files..."
    tar -czf "$BACKUP_PATH/config_$DATE.tar.gz" -C /opt/elkzone \
        docker-compose.prod.yml \
        .env.prod \
        nginx/ \
        prometheus/ \
        logstash/
}

# Function to backup Kubernetes environment
backup_kubernetes() {
    print_status "Backing up Kubernetes environment..."
    
    NAMESPACE="elkzone-$ENVIRONMENT"
    
    # Backup all resources as YAML
    kubectl get all,configmaps,secrets,pvc,ingress -n $NAMESPACE -o yaml > "$BACKUP_PATH/k8s-resources_$DATE.yaml"
    
    # Backup PostgreSQL (if using managed DB, use provider tools)
    print_status "Backing up PostgreSQL from Kubernetes..."
    kubectl exec -n $NAMESPACE deployment/elkzone-postgres -- pg_dump -U elk elkzone | gzip > "$BACKUP_PATH/postgres_$DATE.sql.gz"
    
    # Backup application data
    print_status "Backing up application data..."
    kubectl exec -n $NAMESPACE deployment/elkzone-backend -- tar -czf - /app/uploads | gzip > "$BACKUP_PATH/uploads_$DATE.tar.gz"
    
    # Backup PV data (if using self-hosted storage)
    print_status "Backing up persistent volumes..."
    kubectl get pvc -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}' | while read pvc; do
        if [ ! -z "$pvc" ]; then
            print_status "Backing up PVC: $pvc"
            # This would need to be implemented based on your storage class
            # For example, using rsync or snapshot tools
        fi
    done
}

# Function to upload to S3
upload_to_s3() {
    if command -v aws &> /dev/null; then
        print_status "Uploading backups to S3..."
        aws s3 sync "$BACKUP_PATH" "s3://$S3_BUCKET/$ENVIRONMENT/$DATE/" --delete
        print_status "S3 upload completed"
    else
        print_warning "AWS CLI not found. Skipping S3 upload."
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    find $BACKUP_DIR -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;
    
    # Cleanup S3 if AWS CLI is available
    if command -v aws &> /dev/null; then
        aws s3 ls "s3://$S3_BUCKET/$ENVIRONMENT/" | while read -r line; do
            createDate=$(echo $line | awk '{print $1" "$2}')
            createDate=$(date -d "$createDate" +%s)
            olderThan=$(date -d "$RETENTION_DAYS days ago" +%s)
            if [[ $createDate -lt $olderThan ]]; then
                fileName=$(echo $line | awk '{print $4}')
                if [[ $fileName != "" ]]; then
                    aws s3 rm "s3://$S3_BUCKET/$ENVIRONMENT/$fileName" --recursive
                fi
            fi
        done
    fi
}

# Function to verify backup integrity
verify_backup() {
    print_status "Verifying backup integrity..."
    
    # Check if all backup files exist and are not empty
    local files=(
        "postgres_$DATE.sql.gz"
        "redis_$DATE.rdb.gz"
        "uploads_$DATE.tar.gz"
        "config_$DATE.tar.gz"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$BACKUP_PATH/$file" ] && [ -s "$BACKUP_PATH/$file" ]; then
            print_status "✅ $file: OK"
        else
            print_error "❌ $file: Missing or empty"
            return 1
        fi
    done
    
    # Test database backup
    print_status "Testing database backup integrity..."
    if gunzip -t "$BACKUP_PATH/postgres_$DATE.sql.gz"; then
        print_status "✅ Database backup integrity: OK"
    else
        print_error "❌ Database backup integrity: FAILED"
        return 1
    fi
    
    return 0
}

# Function to create backup manifest
create_manifest() {
    print_status "Creating backup manifest..."
    
    cat > "$BACKUP_PATH/manifest.json" << EOF
{
  "backup_date": "$DATE",
  "environment": "$ENVIRONMENT",
  "version": "$(cat /opt/elkzone/package.json | grep version | cut -d'"' -f4)",
  "files": [
    $(ls -la "$BACKUP_PATH" | grep -v manifest | awk '{print "\""$9"\""}' | paste -sd ',' -)
  ],
  "total_size": "$(du -sh "$BACKUP_PATH" | cut -f1)",
  "database": {
    "type": "postgresql",
    "backup_file": "postgres_$DATE.sql.gz",
    "size": "$(du -h "$BACKUP_PATH/postgres_$DATE.sql.gz" | cut -f1)"
  },
  "redis": {
    "backup_file": "redis_$DATE.rdb.gz",
    "size": "$(du -h "$BACKUP_PATH/redis_$DATE.rdb.gz" | cut -f1)"
  },
  "uploads": {
    "backup_file": "uploads_$DATE.tar.gz",
    "size": "$(du -h "$BACKUP_PATH/uploads_$DATE.tar.gz" | cut -f1)"
  }
}
EOF
}

# Main backup logic
print_status "Starting backup process..."

# Check if we're in Docker Compose or Kubernetes environment
if [ -f "/opt/elkzone/docker-compose.prod.yml" ]; then
    backup_docker
elif command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
    backup_kubernetes
else
    print_error "Neither Docker Compose nor Kubernetes environment detected"
    exit 1
fi

# Create manifest
create_manifest

# Verify backup
if verify_backup; then
    print_status "✅ Backup verification passed"
else
    print_error "❌ Backup verification failed"
    exit 1
fi

# Upload to S3
upload_to_s3

# Cleanup old backups
cleanup_old_backups

# Display backup summary
echo ""
echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo ""
echo "📊 Backup Summary:"
echo "  • Location: $BACKUP_PATH"
echo "  • Size: $(du -sh "$BACKUP_PATH" | cut -f1)"
echo "  • Files: $(ls -1 "$BACKUP_PATH" | wc -l)"
echo ""
echo "📁 Backup Files:"
ls -la "$BACKUP_PATH"
echo ""

if command -v aws &> /dev/null; then
    echo "☁️  S3 Location: s3://$S3_BUCKET/$ENVIRONMENT/$DATE/"
fi

echo ""
echo -e "${GREEN}✅ Backup is ready for disaster recovery!${NC}"