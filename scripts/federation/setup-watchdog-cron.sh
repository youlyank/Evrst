#!/bin/bash

# ELK.Zone 2.0 - Watchdog Service CRON Setup
# Configures automatic watchdog monitoring via cron jobs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WATCHDOG_SCRIPT="$PROJECT_DIR/scripts/federation/watchdog-service.sh"
CRON_FILE="/etc/cron.d/elkzone-watchdog"
LOG_DIR="$PROJECT_DIR/logs"

# Monitoring schedules
CONTINUOUS_CHECK="*/5 * * * *"  # Every 5 minutes
HOURLY_REPORT="0 * * * *"       # Every hour
DAILY_SUMMARY="0 6 * * *"       # Daily at 6 AM

echo -e "${GREEN}⏰ ELK.Zone 2.0 - Watchdog Service CRON Setup${NC}"
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

# Function to validate watchdog script
validate_watchdog_script() {
    print_status "Validating watchdog script..."
    
    if [ ! -f "$WATCHDOG_SCRIPT" ]; then
        print_error "Watchdog script not found: $WATCHDOG_SCRIPT"
        exit 1
    fi
    
    if [ ! -x "$WATCHDOG_SCRIPT" ]; then
        print_status "Making watchdog script executable..."
        chmod +x "$WATCHDOG_SCRIPT"
    fi
    
    # Test script syntax
    if bash -n "$WATCHDOG_SCRIPT"; then
        print_success "Watchdog script validation passed"
    else
        print_error "Watchdog script has syntax errors"
        exit 1
    fi
}

# Function to create cron configuration
create_cron_config() {
    print_status "Creating watchdog cron configuration..."
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    
    # Create cron configuration
    cat > "$CRON_FILE" << EOF
# ELK.Zone 2.0 - Federation AI Watchdog
# Generated on $(date)

# Environment variables
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
PROJECT_DIR=$PROJECT_DIR
CHECK_INTERVAL=300
ALERT_COOLDOWN=600
MAX_FAILURES=3

# Continuous monitoring checks (every 5 minutes)
$CONTINUOUS_CHECK $PROJECT_DIR/scripts/federation/watchdog-service.sh check >> $LOG_DIR/watchdog-cron.log 2>&1

# Hourly detailed health report
$HOURLY_REPORT $PROJECT_DIR/scripts/federation/watchdog-service.sh check >> $LOG_DIR/watchdog-hourly.log 2>&1

# Daily summary and cleanup
$DAILY_SUMMARY $PROJECT_DIR/scripts/federation/watchdog-service.sh status >> $LOG_DIR/watchdog-daily.log 2>&1

# Ensure watchdog service is running (every 10 minutes)
*/10 * * * * $PROJECT_DIR/scripts/federation/watchdog-service.sh status >> $LOG_DIR/watchdog-service.log 2>&1

# Weekly watchdog service restart (Sundays at 2 AM)
0 2 * * 0 $PROJECT_DIR/scripts/federation/watchdog-service.sh restart >> $LOG_DIR/watchdog-restart.log 2>&1
EOF
    
    # Set proper permissions
    chmod 644 "$CRON_FILE"
    
    print_success "Cron configuration created: $CRON_FILE"
}

# Function to create systemd service for watchdog
create_systemd_service() {
    print_status "Creating systemd service for watchdog..."
    
    local service_file="/etc/systemd/system/elkzone-watchdog.service"
    
    cat > "$service_file" << EOF
[Unit]
Description=ELK.Zone 2.0 Federation AI Watchdog
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=root
Group=root
Environment=PROJECT_DIR=$PROJECT_DIR
Environment=CHECK_INTERVAL=60
Environment=ALERT_COOLDOWN=300
Environment=MAX_FAILURES=3
ExecStart=$WATCHDOG_SCRIPT start
ExecStop=$WATCHDOG_SCRIPT stop
ExecReload=$WATCHDOG_SCRIPT restart
Restart=always
RestartSec=10
StandardOutput=append:$LOG_DIR/watchdog-service.log
StandardError=append:$LOG_DIR/watchdog-service.log
PIDFile=$LOG_DIR/watchdog.pid

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable elkzone-watchdog.service
    
    print_success "Systemd service created: $service_file"
}

# Function to create Docker integration
create_docker_integration() {
    print_status "Creating Docker integration for watchdog..."
    
    local docker_compose_file="$PROJECT_DIR/docker-compose.watchdog.yml"
    
    cat > "$docker_compose_file" << EOF
version: '3.8'

services:
  elkzone-watchdog:
    build:
      context: .
      dockerfile: Dockerfile.watchdog
    container_name: elkzone-watchdog
    restart: unless-stopped
    environment:
      - CHECK_INTERVAL=60
      - ALERT_COOLDOWN=300
      - MAX_FAILURES=3
      - SERVICE_URL=http://elkzone-backend:3000/api/federation/watchdog
    volumes:
      - ./logs:/app/logs
      - ./cache:/app/cache
      - ./scripts:/app/scripts
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - elkzone-network
    depends_on:
      - elkzone-backend
    healthcheck:
      test: ["CMD", "/app/scripts/federation/watchdog-service.sh", "status"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  elkzone-network:
    external: true
EOF
    
    # Create watchdog Dockerfile
    local dockerfile="$PROJECT_DIR/Dockerfile.watchdog"
    
    cat > "$dockerfile" << EOF
FROM alpine:latest

# Install required packages
RUN apk add --no-cache \\
    bash \\
    curl \\
    jq \\
    net-tools \\
    procps \\
    docker-cli

# Create app directory
WORKDIR /app

# Copy scripts and configuration
COPY scripts/ /app/scripts/
COPY logs/ /app/logs/
COPY cache/ /app/cache/

# Create necessary directories
RUN mkdir -p /app/logs /app/cache

# Make scripts executable
RUN chmod +x /app/scripts/federation/watchdog-service.sh

# Set environment variables
ENV CHECK_INTERVAL=60
ENV ALERT_COOLDOWN=300
ENV MAX_FAILURES=3
ENV SERVICE_URL=http://elkzone-backend:3000/api/federation/watchdog

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \\
    CMD /app/scripts/federation/watchdog-service.sh status

# Run the watchdog service
CMD ["/app/scripts/federation/watchdog-service.sh", "start"]
EOF
    
    print_success "Docker integration created"
    print_status "Docker Compose file: $docker_compose_file"
    print_status "Dockerfile: $dockerfile"
}

# Function to create Kubernetes integration
create_kubernetes_integration() {
    print_status "Creating Kubernetes integration for watchdog..."
    
    local k8s_deployment="$PROJECT_DIR/k8s/federation/watchdog-deployment.yaml"
    
    mkdir -p "$(dirname "$k8s_deployment")"
    
    cat > "$k8s_deployment" << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elkzone-watchdog
  namespace: elkzone
  labels:
    app: elkzone
    component: federation
    feature: watchdog
spec:
  replicas: 1
  selector:
    matchLabels:
      app: elkzone
      component: federation
      feature: watchdog
  template:
    metadata:
      labels:
        app: elkzone
        component: federation
        feature: watchdog
    spec:
      serviceAccountName: elkzone-watchdog
      restartPolicy: Always
      containers:
      - name: watchdog
        image: elkzone/watchdog:latest
        imagePullPolicy: IfNotPresent
        command:
        - /bin/bash
        - -c
        - |
          set -e
          echo "Starting Federation AI Watchdog in Kubernetes..."
          /app/scripts/federation/watchdog-service.sh start
        env:
        - name: CHECK_INTERVAL
          value: "60"
        - name: ALERT_COOLDOWN
          value: "300"
        - name: MAX_FAILURES
          value: "3"
        - name: SERVICE_URL
          value: "http://elkzone-backend:3000/api/federation/watchdog"
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: cache
          mountPath: /app/cache
        - name: scripts
          mountPath: /app/scripts
          readOnly: true
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        livenessProbe:
          exec:
            command:
            - /app/scripts/federation/watchdog-service.sh
            - status
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          exec:
            command:
            - /app/scripts/federation/watchdog-service.sh
            - check
          initialDelaySeconds: 10
          periodSeconds: 30
          timeoutSeconds: 5
          failureThreshold: 3
      volumes:
      - name: logs
        emptyDir: {}
      - name: cache
        emptyDir: {}
      - name: scripts
        configMap:
          name: elkzone-scripts
          defaultMode: 0755
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: elkzone-watchdog
  namespace: elkzone
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: elkzone-watchdog
rules:
- apiGroups: [""]
  resources: ["pods", "services", "endpoints"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch", "patch", "update"]
- apiGroups: ["batch"]
  resources: ["jobs", "cronjobs"]
  verbs: ["get", "list", "watch", "create", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: elkzone-watchdog
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: elkzone-watchdog
subjects:
- kind: ServiceAccount
  name: elkzone-watchdog
  namespace: elkzone
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: elkzone-scripts
  namespace: elkzone
data:
  watchdog-service.sh: |
$(cat "$WATCHDOG_SCRIPT" | sed 's/^/    /')
EOF
    
    print_success "Kubernetes integration created: $k8s_deployment"
}

# Function to test watchdog configuration
test_watchdog_config() {
    print_status "Testing watchdog configuration..."
    
    # Test script functionality
    if "$WATCHDOG_SCRIPT" --help >/dev/null 2>&1; then
        print_success "Watchdog script test passed"
    else
        print_error "Watchdog script test failed"
        return 1
    fi
    
    # Test health check (if backend is running)
    if "$WATCHDOG_SCRIPT" check >/dev/null 2>&1; then
        print_success "Health check test passed"
    else
        print_warning "Health check test failed (backend may not be running)"
    fi
}

# Function to display setup summary
display_summary() {
    echo ""
    echo -e "${GREEN}🎉 Watchdog Service Setup Summary${NC}"
    echo ""
    echo "📁 Configuration Files:"
    echo "  • Cron configuration: $CRON_FILE"
    echo "  • Watchdog script: $WATCHDOG_SCRIPT"
    echo "  • Systemd service: /etc/systemd/system/elkzone-watchdog.service"
    echo ""
    echo "⏰ Scheduled Tasks:"
    echo "  • Continuous checks: $CONTINUOUS_CHECK"
    echo "  • Hourly reports: $HOURLY_REPORT"
    echo "  • Daily summary: $DAILY_SUMMARY"
    echo ""
    echo "📝 Log Files:"
    echo "  • Main log: $LOG_DIR/watchdog.log"
    echo "  • Alerts log: $LOG_DIR/watchdog-alerts.log"
    echo "  • Cron log: $LOG_DIR/watchdog-cron.log"
    echo ""
    echo "🔧 Management Commands:"
    echo "  • Start service: $WATCHDOG_SCRIPT start"
    echo "  • Stop service: $WATCHDOG_SCRIPT stop"
    echo "  • Check status: $WATCHDOG_SCRIPT status"
    echo "  • Single check: $WATCHDOG_SCRIPT check"
    echo "  • Manual healing: $WATCHDOG_SCRIPT heal <service>"
    echo ""
    echo "🐳 Docker Integration:"
    echo "  • Compose file: $PROJECT_DIR/docker-compose.watchdog.yml"
    echo "  • Dockerfile: $PROJECT_DIR/Dockerfile.watchdog"
    echo "  • Start with: docker-compose -f docker-compose.watchdog.yml up -d"
    echo ""
    echo "☸️  Kubernetes Integration:"
    echo "  • Deployment: $PROJECT_DIR/k8s/federation/watchdog-deployment.yaml"
    echo "  • Apply with: kubectl apply -f $PROJECT_DIR/k8s/federation/watchdog-deployment.yaml"
    echo ""
    echo "📊 Monitoring Integration:"
    echo "  • Prometheus metrics: Available via /api/federation/status"
    echo "  • Grafana dashboard: Federation Health Dashboard"
    echo "  • AlertManager: Configure webhook to $SERVICE_URL"
    echo ""
}

# Main execution
main() {
    print_status "Setting up Federation AI Watchdog Service..."
    
    # Check if running as root for system-wide setup
    if [ "$EUID" -eq 0 ]; then
        validate_watchdog_script
        create_cron_config
        create_systemd_service
        test_watchdog_config
        
        # Start the watchdog service
        if systemctl start elkzone-watchdog.service; then
            print_success "Watchdog service started successfully"
        else
            print_warning "Failed to start watchdog service via systemd"
        fi
        
        print_success "System-wide watchdog setup completed"
    else
        print_warning "Not running as root, setting up user-level configurations..."
        create_docker_integration
        create_kubernetes_integration
        test_watchdog_config
        print_success "User-level setup completed"
    fi
    
    display_summary
    
    print_success "Federation AI Watchdog setup completed!"
}

# Handle command line arguments
case "${1:-}" in
    --docker-only)
        print_status "Setting up Docker integration only..."
        create_docker_integration
        ;;
    --k8s-only)
        print_status "Setting up Kubernetes integration only..."
        create_kubernetes_integration
        ;;
    --systemd-only)
        check_root
        print_status "Setting up systemd service only..."
        validate_watchdog_script
        create_systemd_service
        ;;
    --test)
        print_status "Testing existing configuration..."
        test_watchdog_config
        ;;
    --help|-h)
        echo "ELK.Zone 2.0 - Federation AI Watchdog Setup"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --docker-only    Setup Docker integration only"
        echo "  --k8s-only       Setup Kubernetes integration only"
        echo "  --systemd-only   Setup systemd service only (requires root)"
        echo "  --test           Test existing configuration"
        echo "  --help, -h       Show this help message"
        echo ""
        echo "Note: Run without options for full system setup (requires root)"
        ;;
    *)
        main
        ;;
esac