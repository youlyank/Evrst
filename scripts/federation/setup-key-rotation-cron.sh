#!/bin/bash

# ELK.Zone 2.0 - Key Rotation CRON Setup
# Configures automatic key rotation via cron jobs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ROTATION_SCRIPT="$PROJECT_DIR/scripts/federation/auto-key-rotation.sh"
CRON_FILE="/etc/cron.d/elkzone-key-rotation"
LOG_DIR="$PROJECT_DIR/logs"

# Rotation schedules
DAILY_CHECK="0 2 * * *"  # Daily at 2 AM
WEEKLY_ROTATION="0 3 * * 0"  # Sunday at 3 AM
MONTHLY_CLEANUP="0 4 1 * *"  # 1st of month at 4 AM

echo -e "${GREEN}⏰ ELK.Zone 2.0 - Key Rotation CRON Setup${NC}"
echo -e "${BLUE}Project Directory: ${PROJECT_DIR}${NC}"

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

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root to setup cron jobs"
        print_status "Try: sudo $0"
        exit 1
    fi
}

# Function to validate rotation script
validate_rotation_script() {
    print_status "Validating rotation script..."
    
    if [ ! -f "$ROTATION_SCRIPT" ]; then
        print_error "Rotation script not found: $ROTATION_SCRIPT"
        exit 1
    fi
    
    if [ ! -x "$ROTATION_SCRIPT" ]; then
        print_status "Making rotation script executable..."
        chmod +x "$ROTATION_SCRIPT"
    fi
    
    # Test script syntax
    if bash -n "$ROTATION_SCRIPT"; then
        print_success "Rotation script validation passed"
    else
        print_error "Rotation script has syntax errors"
        exit 1
    fi
}

# Function to setup log rotation
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    local logrotate_config="/etc/logrotate.d/elkzone-federation"
    
    cat > "$logrotate_config" << EOF
# ELK.Zone 2.0 - Federation Logs Rotation
$LOG_DIR/key-rotation.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        # Send notification if needed
        # systemctl reload elkzone || true
    endscript
}

$LOG_DIR/rotation-report-*.json {
    weekly
    missingok
    rotate 12
    compress
    delaycompress
    notifempty
}
EOF
    
    print_success "Log rotation configured: $logrotate_config"
}

# Function to create cron configuration
create_cron_config() {
    print_status "Creating cron configuration..."
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    
    # Create cron configuration
    cat > "$CRON_FILE" << EOF
# ELK.Zone 2.0 - Automatic Key Rotation
# Generated on $(date)

# Environment variables
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
PROJECT_DIR=$PROJECT_DIR
ROTATION_INTERVAL_DAYS=90
MAX_BACKUPS=10
FEDERATION_DOMAIN=elkzone.example.com

# Daily check for key rotation needs
$DAILY_CHECK $PROJECT_DIR/scripts/federation/auto-key-rotation.sh --check >> $LOG_DIR/key-rotation.log 2>&1

# Weekly rotation (if needed)
$WEEKLY_ROTATION $PROJECT_DIR/scripts/federation/auto-key-rotation.sh >> $LOG_DIR/key-rotation.log 2>&1

# Monthly backup cleanup
$MONTHLY_CLEANUP $PROJECT_DIR/scripts/federation/auto-key-rotation.sh --cleanup >> $LOG_DIR/key-rotation.log 2>&1

# Quarterly forced rotation (optional - uncomment if needed)
# 0 5 1 1,4,7,10 * $PROJECT_DIR/scripts/federation/auto-key-rotation.sh --force >> $LOG_DIR/key-rotation.log 2>&1
EOF
    
    # Set proper permissions
    chmod 644 "$CRON_FILE"
    
    print_success "Cron configuration created: $CRON_FILE"
}

# Function to create systemd timer (alternative to cron)
create_systemd_timer() {
    print_status "Creating systemd timer for key rotation..."
    
    local service_file="/etc/systemd/system/elkzone-key-rotation.service"
    local timer_file="/etc/systemd/system/elkzone-key-rotation.timer"
    
    # Create systemd service
    cat > "$service_file" << EOF
[Unit]
Description=ELK.Zone 2.0 Federation Key Rotation
After=network.target

[Service]
Type=oneshot
User=root
Group=root
Environment=PROJECT_DIR=$PROJECT_DIR
Environment=ROTATION_INTERVAL_DAYS=90
Environment=MAX_BACKUPS=10
Environment=FEDERATION_DOMAIN=elkzone.example.com
ExecStart=$ROTATION_SCRIPT
StandardOutput=append:$LOG_DIR/key-rotation.log
StandardError=append:$LOG_DIR/key-rotation.log

[Install]
WantedBy=multi-user.target
EOF
    
    # Create systemd timer
    cat > "$timer_file" << EOF
[Unit]
Description=ELK.Zone 2.0 Federation Key Rotation Timer
Requires=elkzone-key-rotation.service

[Timer]
OnCalendar=daily
Persistent=true
RandomizedDelaySec=3600

[Install]
WantedBy=timers.target
EOF
    
    # Reload systemd and enable timer
    systemctl daemon-reload
    systemctl enable elkzone-key-rotation.timer
    systemctl start elkzone-key-rotation.timer
    
    print_success "Systemd timer created and started"
}

# Function to create Kubernetes CronJob (for K8s deployments)
create_kubernetes_cronjob() {
    print_status "Creating Kubernetes CronJob manifest..."
    
    local k8s_cronjob="$PROJECT_DIR/k8s/federation/key-rotation-cronjob.yaml"
    
    mkdir -p "$(dirname "$k8s_cronjob")"
    
    cat > "$k8s_cronjob" << EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: elkzone-key-rotation
  namespace: elkzone
  labels:
    app: elkzone
    component: federation
    feature: key-rotation
spec:
  schedule: "0 3 * * 0"  # Weekly on Sunday at 3 AM
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        metadata:
          labels:
            app: elkzone
            component: federation
            feature: key-rotation
        spec:
          restartPolicy: OnFailure
          securityContext:
            runAsUser: 0
            runAsGroup: 0
          containers:
          - name: key-rotation
            image: elkzone/backend:latest
            imagePullPolicy: IfNotPresent
            command:
            - /bin/bash
            - -c
            - |
              set -e
              echo "Starting key rotation at \$(date)"
              /app/scripts/federation/auto-key-rotation.sh
              echo "Key rotation completed at \$(date)"
            env:
            - name: PROJECT_DIR
              value: "/app"
            - name: ROTATION_INTERVAL_DAYS
              value: "90"
            - name: MAX_BACKUPS
              value: "10"
            - name: FEDERATION_DOMAIN
              valueFrom:
                secretKeyRef:
                  name: elkzone-secrets
                  key: federation-domain
            volumeMounts:
            - name: federation-keys
              mountPath: /app/federation
              readOnly: false
            - name: backup-storage
              mountPath: /app/backups
              readOnly: false
            - name: logs
              mountPath: /app/logs
              readOnly: false
            resources:
              requests:
                memory: "128Mi"
                cpu: "100m"
              limits:
                memory: "256Mi"
                cpu: "200m"
          volumes:
          - name: federation-keys
            persistentVolumeClaim:
              claimName: federation-keys-pvc
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-storage-pvc
          - name: logs
            persistentVolumeClaim:
              claimName: logs-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: federation-keys-pvc
  namespace: elkzone
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: fast-ssd
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: backup-storage-pvc
  namespace: elkzone
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: logs-pvc
  namespace: elkzone
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: standard
EOF
    
    print_success "Kubernetes CronJob manifest created: $k8s_cronjob"
}

# Function to test cron configuration
test_cron_config() {
    print_status "Testing cron configuration..."
    
    # Test dry run
    if "$ROTATION_SCRIPT" --check; then
        print_success "Cron configuration test passed"
    else
        print_error "Cron configuration test failed"
        return 1
    fi
}

# Function to display setup summary
display_summary() {
    echo ""
    echo -e "${GREEN}🎉 Key Rotation CRON Setup Summary${NC}"
    echo ""
    echo "📁 Configuration Files:"
    echo "  • Cron configuration: $CRON_FILE"
    echo "  • Log rotation: /etc/logrotate.d/elkzone-federation"
    echo "  • Rotation script: $ROTATION_SCRIPT"
    echo ""
    echo "⏰ Scheduled Tasks:"
    echo "  • Daily check: $DAILY_CHECK"
    echo "  • Weekly rotation: $WEEKLY_ROTATION"
    echo "  • Monthly cleanup: $MONTHLY_CLEANUP"
    echo ""
    echo "📝 Log Files:"
    echo "  • Main log: $LOG_DIR/key-rotation.log"
    echo "  • Rotation reports: $LOG_DIR/rotation-report-*.json"
    echo ""
    echo "🔧 Management Commands:"
    echo "  • View cron jobs: crontab -l"
    echo "  • View logs: tail -f $LOG_DIR/key-rotation.log"
    echo "  • Manual rotation: $ROTATION_SCRIPT"
    echo "  • Force rotation: $ROTATION_SCRIPT --force"
    echo "  • Check status: $ROTATION_SCRIPT --check"
    echo ""
    echo "🐳 Docker Integration:"
    echo "  • Add to crontab: 0 3 * * * docker exec elkzone-backend /app/scripts/federation/auto-key-rotation.sh"
    echo ""
    echo "☸️  Kubernetes Integration:"
    echo "  • Apply manifest: kubectl apply -f $PROJECT_DIR/k8s/federation/key-rotation-cronjob.yaml"
    echo "  • View jobs: kubectl get cronjobs -n elkzone"
    echo "  • View logs: kubectl logs job/elkzone-key-rotation-<timestamp> -n elkzone"
    echo ""
}

# Function to setup Docker cron integration
setup_docker_cron() {
    print_status "Setting up Docker cron integration..."
    
    local docker_cron_file="$PROJECT_DIR/cron/elkzone-docker-cron"
    mkdir -p "$(dirname "$docker_cron_file")"
    
    cat > "$docker_cron_file" << EOF
# ELK.Zone 2.0 - Docker Key Rotation
# Add this to your system crontab with: crontab -e

# Environment variables
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Daily key rotation check (Docker)
0 2 * * * cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml exec -T backend /app/scripts/federation/auto-key-rotation.sh --check >> $LOG_DIR/key-rotation.log 2>&1

# Weekly key rotation (Docker)
0 3 * * 0 cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml exec -T backend /app/scripts/federation/auto-key-rotation.sh >> $LOG_DIR/key-rotation.log 2>&1

# Monthly cleanup (Docker)
0 4 1 * * cd $PROJECT_DIR && docker-compose -f docker-compose.prod.yml exec -T backend /app/scripts/federation/auto-key-rotation.sh --cleanup >> $LOG_DIR/key-rotation.log 2>&1
EOF
    
    print_success "Docker cron configuration created: $docker_cron_file"
    print_status "To install: crontab $docker_cron_file"
}

# Main execution
main() {
    print_status "Setting up automatic key rotation..."
    
    # Check if running as root for system-wide setup
    if [ "$EUID" -eq 0 ]; then
        validate_rotation_script
        create_cron_config
        setup_log_rotation
        test_cron_config
        
        # Optional: Create systemd timer
        if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet; then
            create_systemd_timer
        fi
        
        print_success "System-wide cron setup completed"
    else
        print_warning "Not running as root, setting up user-level configurations..."
        setup_docker_cron
        create_kubernetes_cronjob
        print_success "User-level setup completed"
    fi
    
    display_summary
    
    print_success "Key rotation automation setup completed!"
}

# Handle command line arguments
case "${1:-}" in
    --docker-only)
        print_status "Setting up Docker cron integration only..."
        setup_docker_cron
        ;;
    --k8s-only)
        print_status "Setting up Kubernetes CronJob only..."
        create_kubernetes_cronjob
        ;;
    --systemd-only)
        check_root
        print_status "Setting up systemd timer only..."
        validate_rotation_script
        create_systemd_timer
        ;;
    --test)
        print_status "Testing existing configuration..."
        test_cron_config
        ;;
    --help|-h)
        echo "ELK.Zone 2.0 - Key Rotation CRON Setup"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --docker-only    Setup Docker cron integration only"
        echo "  --k8s-only       Setup Kubernetes CronJob only"
        echo "  --systemd-only   Setup systemd timer only (requires root)"
        echo "  --test           Test existing configuration"
        echo "  --help, -h       Show this help message"
        echo ""
        echo "Note: Run without options for full system setup (requires root)"
        ;;
    *)
        main
        ;;
esac