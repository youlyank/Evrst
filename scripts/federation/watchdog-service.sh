#!/bin/bash

# ELK.Zone 2.0 - Federation AI Watchdog Service
# Intelligent monitoring and auto-healing for federation services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WATCHDOG_LOG="$PROJECT_DIR/logs/watchdog.log"
HEALTH_CACHE="$PROJECT_DIR/cache/health-status.json"
ALERT_LOG="$PROJECT_DIR/logs/watchdog-alerts.log"
SERVICE_URL="http://localhost:3000/api/federation/watchdog"

# Monitoring intervals
CHECK_INTERVAL=${CHECK_INTERVAL:-60}  # seconds
ALERT_COOLDOWN=${ALERT_COOLDOWN:-300}  # 5 minutes
MAX_FAILURES=${MAX_FAILURES:-3}  # consecutive failures before escalation

# Service configuration
declare -A SERVICES=(
    ["akkoma"]="ActivityPub"
    ["matrix"]="Matrix Homeserver"
    ["peertube"]="PeerTube"
    ["jitsi"]="Jitsi"
)

echo -e "${GREEN}🐕 ELK.Zone 2.0 - Federation AI Watchdog Service${NC}"
echo -e "${BLUE}Project Directory: ${PROJECT_DIR}${NC}"

# Function to print colored output
print_status() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[INFO]${NC} [$timestamp] $1" | tee -a "$WATCHDOG_LOG"
}

print_warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[WARNING]${NC} [$timestamp] $1" | tee -a "$WATCHDOG_LOG"
}

print_error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[ERROR]${NC} [$timestamp] $1" | tee -a "$WATCHDOG_LOG"
}

print_success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[SUCCESS]${NC} [$timestamp] $1" | tee -a "$WATCHDOG_LOG"
}

print_alert() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${PURPLE}[ALERT]${NC} [$timestamp] $1" | tee -a "$ALERT_LOG"
}

print_healing() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${CYAN}[HEALING]${NC} [$timestamp] $1" | tee -a "$WATCHDOG_LOG"
}

# Function to initialize watchdog environment
setup_watchdog() {
    print_status "Initializing Federation AI Watchdog Service..."
    
    # Create necessary directories
    mkdir -p "$(dirname "$WATCHDOG_LOG")"
    mkdir -p "$(dirname "$HEALTH_CACHE")"
    mkdir -p "$(dirname "$ALERT_LOG")"
    
    # Create PID file
    echo $$ > "$PROJECT_DIR/logs/watchdog.pid"
    
    # Setup signal handlers
    trap 'cleanup_watchdog' SIGTERM SIGINT
    
    print_success "Watchdog service initialized (PID: $$)"
}

# Function to cleanup watchdog
cleanup_watchdog() {
    print_status "Shutting down Federation AI Watchdog Service..."
    
    # Remove PID file
    rm -f "$PROJECT_DIR/logs/watchdog.pid"
    
    print_success "Watchdog service stopped"
    exit 0
}

# Function to check if service is running
is_service_running() {
    local service="$1"
    
    # Check if the service process is running
    if command -v docker >/dev/null 2>&1; then
        # Docker environment
        docker ps --format "table {{.Names}}" | grep -q "elkzone-$service" 2>/dev/null
    elif command -v systemctl >/dev/null 2>&1; then
        # Systemd environment
        systemctl is-active --quiet "elkzone-$service" 2>/dev/null
    else
        # Fallback: check if service port is listening
        local port=""
        case "$service" in
            "akkoma") port="4000" ;;
            "matrix") port="8008" ;;
            "peertube") port="9000" ;;
            "jitsi") port="4443" ;;
        esac
        
        if [ -n "$port" ]; then
            netstat -tlnp 2>/dev/null | grep -q ":$port "
        else
            return 1
        fi
    fi
}

# Function to restart service
restart_service() {
    local service="$1"
    
    print_healing "Attempting to restart $service service..."
    
    if command -v docker >/dev/null 2>&1; then
        # Docker environment
        if docker ps --format "table {{.Names}}" | grep -q "elkzone-$service"; then
            docker restart "elkzone-$service" >/dev/null 2>&1
            print_success "Docker container $service restarted"
        else
            print_error "Docker container $service not found"
            return 1
        fi
    elif command -v systemctl >/dev/null 2>&1; then
        # Systemd environment
        systemctl restart "elkzone-$service" >/dev/null 2>&1
        print_success "Systemd service $service restarted"
    else
        # Fallback: try to start service manually
        print_warning "Manual service restart not implemented for $service"
        return 1
    fi
    
    # Wait for service to be ready
    local wait_time=0
    local max_wait=30
    
    while [ $wait_time -lt $max_wait ]; do
        if is_service_running "$service"; then
            print_success "Service $service is running after restart"
            return 0
        fi
        
        sleep 2
        wait_time=$((wait_time + 2))
    done
    
    print_error "Service $service failed to start within ${max_wait} seconds"
    return 1
}

# Function to clear service cache
clear_service_cache() {
    local service="$1"
    
    print_healing "Clearing cache for $service service..."
    
    case "$service" in
        "akkoma")
            # Clear Akkoma cache
            if command -v docker >/dev/null 2>&1; then
                docker exec "elkzone-akkoma" /bin/bash -c "rm -rf /var/lib/akkoma/cache/*" 2>/dev/null || true
            fi
            ;;
        "matrix")
            # Clear Synapse cache
            if command -v docker >/dev/null 2>&1; then
                docker exec "elkzone-matrix" /bin/bash -c "rm -rf /var/lib/synapse/cache/*" 2>/dev/null || true
            fi
            ;;
        "peertube")
            # Clear PeerTube cache
            if command -v docker >/dev/null 2>&1; then
                docker exec "elkzone-peertube" /bin/bash -c "rm -rf /var/lib/peertube/cache/*" 2>/dev/null || true
            fi
            ;;
        "jitsi")
            # Clear Jitsi cache
            if command -v docker >/dev/null 2>&1; then
                docker exec "elkzone-jitsi" /bin/bash -c "rm -rf /var/cache/jitsi/*" 2>/dev/null || true
            fi
            ;;
    esac
    
    print_success "Cache cleared for $service"
}

# Function to fix service configuration
fix_service_configuration() {
    local service="$1"
    
    print_healing "Checking and fixing configuration for $service service..."
    
    # Check for common configuration issues
    case "$service" in
        "akkoma")
            # Check Akkoma configuration
            if [ -f "$PROJECT_DIR/federation/akkoma/config.exs" ]; then
                # Validate configuration syntax
                if command -v elixir >/dev/null 2>&1; then
                    elixir -c "$PROJECT_DIR/federation/akkoma/config.exs" 2>/dev/null || {
                        print_error "Akkoma configuration has syntax errors"
                        return 1
                    }
                fi
            fi
            ;;
        "matrix")
            # Check Matrix configuration
            if [ -f "$PROJECT_DIR/federation/matrix/homeserver.yaml" ]; then
                # Validate YAML syntax
                if command -v python3 >/dev/null 2>&1; then
                    python3 -c "import yaml; yaml.safe_load(open('$PROJECT_DIR/federation/matrix/homeserver.yaml'))" 2>/dev/null || {
                        print_error "Matrix configuration has syntax errors"
                        return 1
                    }
                fi
            fi
            ;;
        "peertube")
            # Check PeerTube configuration
            if [ -f "$PROJECT_DIR/federation/peertube/config/production.yaml" ]; then
                # Validate YAML syntax
                if command -v python3 >/dev/null 2>&1; then
                    python3 -c "import yaml; yaml.safe_load(open('$PROJECT_DIR/federation/peertube/config/production.yaml'))" 2>/dev/null || {
                        print_error "PeerTube configuration has syntax errors"
                        return 1
                    }
                fi
            fi
            ;;
        "jitsi")
            # Check Jitsi configuration
            if [ -f "$PROJECT_DIR/federation/jitsi/sip-communicator.properties" ]; then
                # Basic validation
                grep -q "org.jitsi.videobridge" "$PROJECT_DIR/federation/jitsi/sip-communicator.properties" || {
                    print_warning "Jitsi configuration may be incomplete"
                }
            fi
            ;;
    esac
    
    print_success "Configuration validated for $service"
}

# Function to execute healing action
execute_healing_action() {
    local service="$1"
    local action="$2"
    
    print_healing "Executing healing action: $action for $service"
    
    case "$action" in
        "restart_service")
            restart_service "$service"
            ;;
        "clear_cache")
            clear_service_cache "$service"
            ;;
        "fix_configuration")
            fix_service_configuration "$service"
            ;;
        *)
            print_error "Unknown healing action: $action"
            return 1
            ;;
    esac
}

# Function to fetch health status from API
fetch_health_status() {
    print_status "Fetching federation health status..."
    
    local response=""
    local http_code=""
    
    # Try to fetch from local API first
    if command -v curl >/dev/null 2>&1; then
        response=$(curl -s -w "%{http_code}" "$SERVICE_URL" 2>/dev/null)
        http_code="${response: -3}"
        response="${response%???}"
    else
        print_error "curl command not available"
        return 1
    fi
    
    if [ "$http_code" = "200" ]; then
        # Save health status to cache
        echo "$response" > "$HEALTH_CACHE"
        print_success "Health status fetched successfully"
        return 0
    else
        print_warning "Failed to fetch health status (HTTP $http_code)"
        
        # Try to use cached status if available
        if [ -f "$HEALTH_CACHE" ]; then
            local cache_age=$(($(date +%s) - $(stat -c %Y "$HEALTH_CACHE")))
            if [ $cache_age -lt 300 ]; then  # 5 minutes
                print_status "Using cached health status (${cache_age}s old)"
                response=$(cat "$HEALTH_CACHE")
                return 0
            else
                print_warning "Cached health status is too old (${cache_age}s)"
            fi
        fi
        
        return 1
    fi
}

# Function to analyze health status and trigger healing
analyze_and_heal() {
    local health_data="$1"
    
    # Parse health data (simplified JSON parsing with grep)
    local overall_status=$(echo "$health_data" | grep -o '"overall_status":"[^"]*"' | cut -d'"' -f4)
    
    print_status "Overall federation status: $overall_status"
    
    if [ "$overall_status" = "unhealthy" ]; then
        print_alert "Federation system is unhealthy - initiating auto-healing"
        
        # Extract unhealthy services
        local unhealthy_services=$(echo "$health_data" | grep -o '"service":"[^"]*","status":"unhealthy"' | cut -d'"' -f4)
        
        for service in $unhealthy_services; do
            print_healing "Processing unhealthy service: $service"
            
            # Try basic healing actions in order
            if execute_healing_action "$service" "clear_cache"; then
                sleep 5  # Wait for cache clear to take effect
            fi
            
            if execute_healing_action "$service" "fix_configuration"; then
                sleep 5  # Wait for config fix to take effect
            fi
            
            if execute_healing_action "$service" "restart_service"; then
                sleep 10  # Wait for service to start
            fi
        done
        
        # Re-check health after healing
        print_status "Re-checking health after healing actions..."
        sleep 5
        
        if fetch_health_status; then
            local new_health_data=$(cat "$HEALTH_CACHE")
            local new_status=$(echo "$new_health_data" | grep -o '"overall_status":"[^"]*"' | cut -d'"' -f4)
            
            if [ "$new_status" != "unhealthy" ]; then
                print_success "Auto-healing successful - status improved to $new_status"
            else
                print_alert "Auto-healing incomplete - status remains $new_status"
            fi
        fi
        
    elif [ "$overall_status" = "degraded" ]; then
        print_warning "Federation system is degraded - monitoring closely"
        
        # Extract degraded services
        local degraded_services=$(echo "$health_data" | grep -o '"service":"[^"]*","status":"degraded"' | cut -d'"' -f4)
        
        for service in $degraded_services; do
            print_status "Monitoring degraded service: $service"
            
            # For degraded services, try lighter healing actions
            execute_healing_action "$service" "clear_cache" || true
        done
    else
        print_success "Federation system is healthy"
    fi
}

# Function to send alerts
send_alert() {
    local message="$1"
    local severity="$2"  # info, warning, error, critical
    
    print_alert "ALERT [$severity]: $message"
    
    # Here you could integrate with various alerting systems:
    # - Email notifications
    # - Slack/ Discord webhooks
    # - SMS alerts
    # - PagerDuty
    # - Monitoring systems
    
    # Example: Send to webhook (if configured)
    if [ -n "$ALERT_WEBHOOK_URL" ]; then
        local payload=$(cat <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "severity": "$severity",
    "service": "elkzone-watchdog",
    "message": "$message",
    "hostname": "$(hostname)",
    "instance": "elkzone-federation"
}
EOF
        )
        
        curl -s -X POST "$ALERT_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "$payload" >/dev/null 2>&1 || true
    fi
}

# Function to monitor continuously
monitor_continuously() {
    print_status "Starting continuous federation monitoring..."
    print_status "Check interval: ${CHECK_INTERVAL}s"
    print_status "Alert cooldown: ${ALERT_COOLDOWN}s"
    
    local consecutive_failures=0
    local last_alert_time=0
    
    while true; do
        local current_time=$(date +%s)
        
        if fetch_health_status; then
            local health_data=$(cat "$HEALTH_CACHE")
            analyze_and_heal "$health_data"
            
            # Reset failure counter on successful check
            consecutive_failures=0
            
        else
            consecutive_failures=$((consecutive_failures + 1))
            print_error "Health check failed (attempt $consecutive_failures/$MAX_FAILURES)"
            
            # Escalate if too many consecutive failures
            if [ $consecutive_failures -ge $MAX_FAILURES ]; then
                local time_since_last_alert=$((current_time - last_alert_time))
                
                if [ $time_since_last_alert -ge $ALERT_COOLDOWN ]; then
                    send_alert "Federation health check failed $consecutive_failures consecutive times" "critical"
                    last_alert_time=$current_time
                fi
            fi
        fi
        
        # Sleep until next check
        sleep $CHECK_INTERVAL
    done
}

# Function to run single health check
run_single_check() {
    print_status "Running single federation health check..."
    
    if fetch_health_status; then
        local health_data=$(cat "$HEALTH_CACHE")
        
        # Display health summary
        local overall_status=$(echo "$health_data" | grep -o '"overall_status":"[^"]*"' | cut -d'"' -f4)
        local timestamp=$(echo "$health_data" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)
        
        echo ""
        echo -e "${BLUE}📊 Federation Health Summary${NC}"
        echo -e "${BLUE}Timestamp: ${timestamp}${NC}"
        echo -e "${BLUE}Overall Status: ${overall_status}${NC}"
        echo ""
        
        # Display service status
        echo "$health_data" | grep -o '"service":"[^"]*","type":"[^"]*","status":"[^"]*"' | while IFS= read -r line; do
            local service=$(echo "$line" | cut -d'"' -f4)
            local type=$(echo "$line" | cut -d'"' -f8)
            local status=$(echo "$line" | cut -d'"' -f12)
            
            local status_color=""
            case "$status" in
                "healthy") status_color="${GREEN}" ;;
                "degraded") status_color="${YELLOW}" ;;
                "unhealthy") status_color="${RED}" ;;
            esac
            
            echo -e "  ${status_color}• $service ($type): $status${NC}"
        done
        
        echo ""
        
        # Analyze and heal if needed
        analyze_and_heal "$health_data"
        
        return 0
    else
        print_error "Failed to fetch health status"
        return 1
    fi
}

# Function to display watchdog status
display_status() {
    echo ""
    echo -e "${GREEN}🐕 Federation AI Watchdog Status${NC}"
    echo ""
    
    # Check if watchdog is running
    if [ -f "$PROJECT_DIR/logs/watchdog.pid" ]; then
        local pid=$(cat "$PROJECT_DIR/logs/watchdog.pid")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✅ Watchdog service is running (PID: $pid)${NC}"
        else
            echo -e "${RED}❌ Watchdog service is not running (stale PID file)${NC}"
            rm -f "$PROJECT_DIR/logs/watchdog.pid"
        fi
    else
        echo -e "${YELLOW}⚠️  Watchdog service is not running${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📁 Configuration:${NC}"
    echo "  • Check interval: ${CHECK_INTERVAL}s"
    echo "  • Alert cooldown: ${ALERT_COOLDOWN}s"
    echo "  • Max failures: $MAX_FAILURES"
    echo "  • Service URL: $SERVICE_URL"
    echo ""
    
    # Show recent logs
    if [ -f "$WATCHDOG_LOG" ]; then
        echo -e "${BLUE}📝 Recent Activity:${NC}"
        tail -n 10 "$WATCHDOG_LOG" | while IFS= read -r line; do
            echo "  $line"
        done
        echo ""
    fi
    
    # Show recent alerts
    if [ -f "$ALERT_LOG" ] && [ -s "$ALERT_LOG" ]; then
        echo -e "${PURPLE}🚨 Recent Alerts:${NC}"
        tail -n 5 "$ALERT_LOG" | while IFS= read -r line; do
            echo "  $line"
        done
        echo ""
    fi
}

# Main execution
main() {
    case "${1:-start}" in
        "start")
            if [ -f "$PROJECT_DIR/logs/watchdog.pid" ]; then
                local existing_pid=$(cat "$PROJECT_DIR/logs/watchdog.pid")
                if kill -0 "$existing_pid" 2>/dev/null; then
                    print_error "Watchdog service is already running (PID: $existing_pid)"
                    exit 1
                else
                    print_warning "Removing stale PID file"
                    rm -f "$PROJECT_DIR/logs/watchdog.pid"
                fi
            fi
            
            setup_watchdog
            monitor_continuously
            ;;
        "check")
            run_single_check
            ;;
        "status")
            display_status
            ;;
        "stop")
            if [ -f "$PROJECT_DIR/logs/watchdog.pid" ]; then
                local pid=$(cat "$PROJECT_DIR/logs/watchdog.pid")
                if kill -0 "$pid" 2>/dev/null; then
                    print_status "Stopping watchdog service (PID: $pid)..."
                    kill "$pid"
                    
                    # Wait for graceful shutdown
                    local wait_time=0
                    while [ $wait_time -lt 10 ] && kill -0 "$pid" 2>/dev/null; do
                        sleep 1
                        wait_time=$((wait_time + 1))
                    done
                    
                    if kill -0 "$pid" 2>/dev/null; then
                        print_warning "Force killing watchdog service"
                        kill -9 "$pid"
                    fi
                    
                    print_success "Watchdog service stopped"
                else
                    print_warning "Watchdog service was not running"
                fi
                
                rm -f "$PROJECT_DIR/logs/watchdog.pid"
            else
                print_warning "Watchdog service is not running"
            fi
            ;;
        "restart")
            $0 stop
            sleep 2
            $0 start
            ;;
        "heal")
            if [ -z "$2" ]; then
                print_error "Service name required for heal command"
                echo "Usage: $0 heal <service> [action]"
                echo "Services: ${!SERVICES[@]}"
                echo "Actions: restart_service, clear_cache, fix_configuration"
                exit 1
            fi
            
            local service="$2"
            local action="${3:-restart_service}"
            
            if [[ ! " ${!SERVICES[@]} " =~ " $service " ]]; then
                print_error "Unknown service: $service"
                echo "Valid services: ${!SERVICES[@]}"
                exit 1
            fi
            
            execute_healing_action "$service" "$action"
            ;;
        "--help"|"-h")
            echo "ELK.Zone 2.0 - Federation AI Watchdog Service"
            echo ""
            echo "Usage: $0 [COMMAND] [OPTIONS]"
            echo ""
            echo "Commands:"
            echo "  start           Start the watchdog service (default)"
            echo "  stop            Stop the watchdog service"
            echo "  restart         Restart the watchdog service"
            echo "  check           Run a single health check"
            echo "  status          Display watchdog status"
            echo "  heal <service>  Manually trigger healing for a service"
            echo ""
            echo "Healing Actions:"
            echo "  restart_service     Restart the service (default)"
            echo "  clear_cache         Clear service caches"
            echo "  fix_configuration   Fix configuration issues"
            echo ""
            echo "Services: ${!SERVICES[@]}"
            echo ""
            echo "Environment Variables:"
            echo "  CHECK_INTERVAL     Health check interval in seconds (default: 60)"
            echo "  ALERT_COOLDOWN     Alert cooldown in seconds (default: 300)"
            echo "  MAX_FAILURES       Max consecutive failures before escalation (default: 3)"
            echo "  ALERT_WEBHOOK_URL  Webhook URL for alert notifications"
            echo ""
            echo "Examples:"
            echo "  $0 start                    # Start continuous monitoring"
            echo "  $0 check                    # Run single health check"
            echo "  $0 heal akkoma              # Restart Akkoma service"
            echo "  $0 heal matrix clear_cache  # Clear Matrix service cache"
            echo "  CHECK_INTERVAL=30 $0 start  # Start with 30s check interval"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"