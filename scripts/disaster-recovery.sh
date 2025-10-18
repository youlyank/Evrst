#!/bin/bash

# ELK.Zone 2.0 - Disaster Recovery Script
# This script handles complete disaster recovery procedures

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
RECOVERY_TYPE=${2:-"full"}

echo -e "${GREEN}🚨 Starting ELK.Zone 2.0 Disaster Recovery${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Recovery Type: ${RECOVERY_TYPE}${NC}"

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

# Function to check system health
check_system_health() {
    print_status "Checking system health..."
    
    local issues=0
    
    # Check disk space
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -gt 90 ]; then
        print_error "❌ Disk usage is critical: ${disk_usage}%"
        ((issues++))
    else
        print_status "✅ Disk usage: ${disk_usage}%"
    fi
    
    # Check memory
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $mem_usage -gt 90 ]; then
        print_error "❌ Memory usage is critical: ${mem_usage}%"
        ((issues++))
    else
        print_status "✅ Memory usage: ${mem_usage}%"
    fi
    
    # Check load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    if (( $(echo "$load_avg > 2.0" | bc -l) )); then
        print_warning "⚠️  High load average: $load_avg"
        ((issues++))
    else
        print_status "✅ Load average: $load_avg"
    fi
    
    # Check network connectivity
    if ping -c 1 8.8.8.8 &> /dev/null; then
        print_status "✅ Network connectivity: OK"
    else
        print_error "❌ Network connectivity: FAILED"
        ((issues++))
    fi
    
    return $issues
}

# Function to perform emergency backup
emergency_backup() {
    print_status "Performing emergency backup..."
    
    local emergency_dir="$BACKUP_DIR/emergency_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$emergency_dir"
    
    # Backup current state if possible
    if [ -f "/opt/elkzone/docker-compose.prod.yml" ]; then
        cd /opt/elkzone
        
        # Quick database dump
        if docker compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
            print_status "Creating emergency database backup..."
            docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U elk elkzone | gzip > "$emergency_dir/emergency_postgres.sql.gz"
        fi
        
        # Backup configuration
        tar -czf "$emergency_dir/emergency_config.tar.gz" \
            docker-compose.prod.yml \
            .env.prod \
            nginx/ \
            2>/dev/null || true
    fi
    
    print_status "Emergency backup created: $emergency_dir"
}

# Function to rebuild infrastructure
rebuild_infrastructure() {
    print_status "Rebuilding infrastructure..."
    
    # Update system packages
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    # Install required packages
    print_status "Installing required packages..."
    sudo apt install -y docker.io docker-compose curl wget git htop
    
    # Ensure Docker is running
    sudo systemctl enable docker
    sudo systemctl start docker
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Clone latest repository
    print_status "Cloning latest repository..."
    if [ -d "/opt/elkzone" ]; then
        cd /opt/elkzone
        git fetch origin
        git reset --hard origin/main
    else
        git clone https://github.com/your-org/elkzone-2.0.git /opt/elkzone
        cd /opt/elkzone
    fi
    
    # Create necessary directories
    mkdir -p uploads backups logs prometheus logstash/pipeline nginx/ssl
    
    print_status "Infrastructure rebuilt successfully"
}

# Function to restore from latest backup
restore_from_backup() {
    print_status "Restoring from latest backup..."
    
    # Find latest backup
    local latest_backup=""
    
    # Check local backups first
    if [ -d "$BACKUP_DIR" ]; then
        latest_backup=$(ls -t "$BACKUP_DIR" | grep "20" | head -1)
    fi
    
    # Check S3 if no local backup found
    if [ -z "$latest_backup" ] && command -v aws &> /dev/null; then
        latest_backup=$(aws s3 ls "s3://$S3_BUCKET/$ENVIRONMENT/" | sort -r | head -1 | awk '{print $2}')
        if [ ! -z "$latest_backup" ]; then
            latest_backup=${latest_backup%/}
            print_status "Downloading latest backup from S3: $latest_backup"
            ./scripts/restore.sh "$ENVIRONMENT" "$latest_backup"
            return 0
        fi
    fi
    
    if [ -z "$latest_backup" ]; then
        print_error "No backups found"
        return 1
    fi
    
    print_status "Using latest backup: $latest_backup"
    ./scripts/restore.sh "$ENVIRONMENT" "$latest_backup"
}

# Function to perform health checks after recovery
post_recovery_health_check() {
    print_status "Performing post-recovery health checks..."
    
    local checks_passed=0
    local total_checks=5
    
    # Wait for services to start
    sleep 30
    
    # Check frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_status "✅ Frontend health check: PASSED"
        ((checks_passed++))
    else
        print_error "❌ Frontend health check: FAILED"
    fi
    
    # Check backend
    if curl -f -s http://localhost:4000/api/health > /dev/null; then
        print_status "✅ Backend health check: PASSED"
        ((checks_passed++))
    else
        print_error "❌ Backend health check: FAILED"
    fi
    
    # Check database
    if [ -f "/opt/elkzone/docker-compose.prod.yml" ]; then
        if docker compose -f /opt/elkzone/docker-compose.prod.yml exec -T postgres pg_isready -U elk > /dev/null; then
            print_status "✅ Database health check: PASSED"
            ((checks_passed++))
        else
            print_error "❌ Database health check: FAILED"
        fi
    fi
    
    # Check Redis
    if [ -f "/opt/elkzone/docker-compose.prod.yml" ]; then
        if docker compose -f /opt/elkzone/docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null; then
            print_status "✅ Redis health check: PASSED"
            ((checks_passed++))
        else
            print_error "❌ Redis health check: FAILED"
        fi
    fi
    
    # Check SSL certificates
    if [ -f "/etc/letsencrypt/live/elk.zone/fullchain.pem" ]; then
        local cert_expiry=$(openssl x509 -in /etc/letsencrypt/live/elk.zone/fullchain.pem -noout -enddate | cut -d= -f2)
        local cert_epoch=$(date -d "$cert_expiry" +%s)
        local current_epoch=$(date +%s)
        local days_until_expiry=$(( (cert_epoch - current_epoch) / 86400 ))
        
        if [ $days_until_expiry -gt 7 ]; then
            print_status "✅ SSL certificate: Valid ($days_until_expiry days remaining)"
            ((checks_passed++))
        else
            print_warning "⚠️  SSL certificate expires soon: $days_until_expiry days"
        fi
    else
        print_warning "⚠️  SSL certificate not found"
    fi
    
    echo ""
    print_status "Health checks completed: $checks_passed/$total_checks passed"
    
    if [ $checks_passed -eq $total_checks ]; then
        print_status "🎉 All health checks passed!"
        return 0
    else
        print_warning "⚠️  Some health checks failed. Please investigate."
        return 1
    fi
}

# Function to generate recovery report
generate_recovery_report() {
    local recovery_start=$1
    local recovery_end=$(date +%s)
    local duration=$((recovery_end - recovery_start))
    
    local report_file="$BACKUP_DIR/recovery_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "recovery_type": "$RECOVERY_TYPE",
  "environment": "$ENVIRONMENT",
  "start_time": "$(date -d @$recovery_start)",
  "end_time": "$(date -d @$recovery_end)",
  "duration_seconds": $duration,
  "duration_formatted": "$((duration / 60)) minutes $((duration % 60)) seconds",
  "system_info": {
    "hostname": "$(hostname)",
    "os": "$(lsb_release -d | cut -f2)",
    "kernel": "$(uname -r)",
    "disk_usage": "$(df / | awk 'NR==2 {print $5}')",
    "memory_usage": "$(free | awk 'NR==2{printf "%.0f%%", $3*100/$2}')"
  },
  "services": {
    "frontend": "$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "failed")",
    "backend": "$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health || echo "failed")",
    "database": "$(docker compose -f /opt/elkzone/docker-compose.prod.yml exec -T postgres pg_isready -U elk >/dev/null 2>&1 && echo "healthy" || echo "failed")",
    "redis": "$(docker compose -f /opt/elkzone/docker-compose.prod.yml exec -T redis redis-cli ping >/dev/null 2>&1 && echo "healthy" || echo "failed")"
  },
  "next_steps": [
    "Monitor system performance for the next 24 hours",
    "Verify all user data is intact",
    "Check federation services are working",
    "Update monitoring alerts",
    "Communicate with users about service restoration"
  ]
}
EOF
    
    print_status "Recovery report generated: $report_file"
}

# Main disaster recovery logic
print_status "Starting disaster recovery procedures..."

# Check system health
if ! check_system_health; then
    print_warning "System health issues detected. Performing emergency backup..."
    emergency_backup
fi

# Record recovery start time
recovery_start=$(date +%s)

case $RECOVERY_TYPE in
    "full")
        print_status "Performing full disaster recovery..."
        rebuild_infrastructure
        restore_from_backup
        ;;
    "data")
        print_status "Performing data recovery only..."
        restore_from_backup
        ;;
    "infrastructure")
        print_status "Performing infrastructure recovery only..."
        rebuild_infrastructure
        ;;
    *)
        print_error "Unknown recovery type: $RECOVERY_TYPE"
        print_status "Available types: full, data, infrastructure"
        exit 1
        ;;
esac

# Post-recovery health checks
if post_recovery_health_check; then
    print_status "🎉 Disaster recovery completed successfully!"
else
    print_warning "⚠️  Disaster recovery completed with issues. Please investigate."
fi

# Generate recovery report
generate_recovery_report $recovery_start

echo ""
echo -e "${GREEN}🎉 Disaster recovery process completed!${NC}"
echo ""
echo "📊 Recovery Summary:"
echo "  • Type: $RECOVERY_TYPE"
echo "  • Environment: $ENVIRONMENT"
echo "  • Duration: $(( ($(date +%s) - recovery_start) / 60 )) minutes"
echo ""
echo "🔍 Next Steps:"
echo "  • Monitor system performance"
echo "  • Verify all services are functioning"
echo "  • Check user access and data"
echo "  • Test federation services"
echo "  • Review recovery report"
echo ""
echo -e "${GREEN}✅ System is ready for operation!${NC}"