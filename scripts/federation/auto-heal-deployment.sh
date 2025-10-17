#!/bin/bash

# ELK.Zone 2.0 - Auto-Heal Deployment System
# Automatically detects and fixes failed federation handshakes and deployments

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
HEAL_LOG="$PROJECT_DIR/logs/auto-heal.log"
DEPLOYMENT_LOG="$PROJECT_DIR/logs/deployment.log"
FEDERATION_TEST_LOG="$PROJECT_DIR/logs/federation-test.log"
BACKUP_DIR="$PROJECT_DIR/backups/auto-heal"
CONFIG_DIR="$PROJECT_DIR/federation"

# Healing thresholds
MAX_RETRY_ATTEMPTS=${MAX_RETRY_ATTEMPTS:-3}
HEAL_TIMEOUT=${HEAL_TIMEOUT:-300}  # 5 minutes
ROLLBACK_ENABLED=${ROLLBACK_ENABLED:-true}
HEALTH_CHECK_INTERVAL=${HEALTH_CHECK_INTERVAL:-30}

echo -e "${GREEN}🔧 ELK.Zone 2.0 - Auto-Heal Deployment System${NC}"
echo -e "${BLUE}Project Directory: ${PROJECT_DIR}${NC}"

# Function to print colored output
print_status() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[INFO]${NC} [$timestamp] $1" | tee -a "$HEAL_LOG"
}

print_warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[WARNING]${NC} [$timestamp] $1" | tee -a "$HEAL_LOG"
}

print_error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[ERROR]${NC} [$timestamp] $1" | tee -a "$HEAL_LOG"
}

print_success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[SUCCESS]${NC} [$timestamp] $1" | tee -a "$HEAL_LOG"
}

print_heal() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${CYAN}[HEAL]${NC} [$timestamp] $1" | tee -a "$HEAL_LOG"
}

print_rollback() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${PURPLE}[ROLLBACK]${NC} [$timestamp] $1" | tee -a "$HEAL_LOG"
}

# Federation services configuration
declare -A FEDERATION_SERVICES=(
    ["akkoma"]="ActivityPub"
    ["matrix"]="Matrix Homeserver"
    ["peertube"]="PeerTube"
    ["jitsi"]="Jitsi"
)

# Function to initialize auto-heal environment
setup_auto_heal() {
    print_status "Initializing Auto-Heal Deployment System..."
    
    # Create necessary directories
    mkdir -p "$(dirname "$HEAL_LOG")"
    mkdir -p "$(dirname "$DEPLOYMENT_LOG")"
    mkdir -p "$(dirname "$FEDERATION_TEST_LOG")"
    mkdir -p "$BACKUP_DIR"
    
    # Create healing state tracking
    mkdir -p "$PROJECT_DIR/state/healing"
    
    print_success "Auto-Heal system initialized"
}

# Function to backup current configuration
backup_configuration() {
    local service="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_service_dir="$BACKUP_DIR/$service/$timestamp"
    
    print_heal "Creating backup for $service configuration..."
    
    mkdir -p "$backup_service_dir"
    
    # Backup configuration files
    if [ -d "$CONFIG_DIR/$service" ]; then
        cp -r "$CONFIG_DIR/$service/"* "$backup_service_dir/" 2>/dev/null || true
    fi
    
    # Backup Docker containers if running
    if command -v docker >/dev/null 2>&1; then
        local container_name="elkzone-$service"
        if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
            # Export container configuration
            docker inspect "$container_name" > "$backup_service_dir/container-config.json" 2>/dev/null || true
            
            # Backup container image
            local image_name=$(docker inspect "$container_name" --format='{{.Config.Image}}' 2>/dev/null)
            if [ -n "$image_name" ]; then
                echo "$image_name" > "$backup_service_dir/container-image.txt"
            fi
        fi
    fi
    
    # Create backup metadata
    cat > "$backup_service_dir/metadata.json" << EOF
{
    "service": "$service",
    "backup_timestamp": "$(date -Iseconds)",
    "heal_reason": "auto_heal_backup",
    "service_type": "${FEDERATION_SERVICES[$service]}",
    "backup_type": "configuration",
    "created_by": "auto-heal-deployment.sh"
}
EOF
    
    # Create symlink to latest backup
    ln -sf "$backup_service_dir" "$BACKUP_DIR/$service/latest"
    
    print_success "Configuration backed up for $service: $backup_service_dir"
    echo "$backup_service_dir"
}

# Function to restore configuration from backup
restore_configuration() {
    local service="$1"
    local backup_path="$2"
    
    print_rollback "Restoring $service configuration from backup..."
    
    if [ ! -d "$backup_path" ]; then
        print_error "Backup path not found: $backup_path"
        return 1
    fi
    
    # Validate backup
    if [ ! -f "$backup_path/metadata.json" ]; then
        print_error "Invalid backup: metadata.json not found"
        return 1
    fi
    
    # Stop the service first
    stop_service "$service"
    
    # Restore configuration files
    if [ -d "$backup_path" ] && [ "$(ls -A "$backup_path" 2>/dev/null)" ]; then
        cp -r "$backup_path/"* "$CONFIG_DIR/$service/" 2>/dev/null || true
    fi
    
    # Restart the service
    start_service "$service"
    
    print_success "Configuration restored for $service"
}

# Function to stop service
stop_service() {
    local service="$1"
    
    print_heal "Stopping $service service..."
    
    if command -v docker >/dev/null 2>&1; then
        local container_name="elkzone-$service"
        if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
            docker stop "$container_name" >/dev/null 2>&1 || true
            print_success "Docker container $container_name stopped"
        fi
    elif command -v systemctl >/dev/null 2>&1; then
        systemctl stop "elkzone-$service" >/dev/null 2>&1 || true
        print_success "Systemd service $service stopped"
    fi
    
    # Wait for service to stop
    sleep 5
}

# Function to start service
start_service() {
    local service="$1"
    
    print_heal "Starting $service service..."
    
    if command -v docker >/dev/null 2>&1; then
        local container_name="elkzone-$service"
        if docker ps -a --format "table {{.Names}}" | grep -q "$container_name"; then
            docker start "$container_name" >/dev/null 2>&1 || true
            print_success "Docker container $container_name started"
        else
            print_warning "Docker container $container_name not found, attempting to recreate..."
            recreate_service_container "$service"
        fi
    elif command -v systemctl >/dev/null 2>&1; then
        systemctl start "elkzone-$service" >/dev/null 2>&1 || true
        print_success "Systemd service $service started"
    fi
    
    # Wait for service to be ready
    sleep 10
}

# Function to recreate service container
recreate_service_container() {
    local service="$1"
    
    print_heal "Recreating $service container..."
    
    case "$service" in
        "akkoma")
            if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
                docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d akkoma >/dev/null 2>&1 || true
            fi
            ;;
        "matrix")
            if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
                docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d matrix >/dev/null 2>&1 || true
            fi
            ;;
        "peertube")
            if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
                docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d peertube >/dev/null 2>&1 || true
            fi
            ;;
        "jitsi")
            if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
                docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d jitsi >/dev/null 2>&1 || true
            fi
            ;;
    esac
    
    print_success "Container recreation attempted for $service"
}

# Function to test federation handshake
test_federation_handshake() {
    local service="$1"
    local remote_domain="$2"
    
    print_heal "Testing federation handshake for $service with $remote_domain..."
    
    case "$service" in
        "akkoma")
            test_akkoma_handshake "$remote_domain"
            ;;
        "matrix")
            test_matrix_handshake "$remote_domain"
            ;;
        "peertube")
            test_peertube_handshake "$remote_domain"
            ;;
        "jitsi")
            test_jitsi_handshake "$remote_domain"
            ;;
        *)
            print_error "Unknown service for handshake test: $service"
            return 1
            ;;
    esac
}

# Function to test Akkoma federation handshake
test_akkoma_handshake() {
    local remote_domain="$1"
    
    # Test webfinger discovery
    local webfinger_url="https://$remote_domain/.well-known/webfinger?resource=acct:test@$remote_domain"
    
    if command -v curl >/dev/null 2>&1; then
        local response=$(curl -s -w "%{http_code}" "$webfinger_url" 2>/dev/null)
        local http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            print_success "Akkoma webfinger test passed for $remote_domain"
            return 0
        else
            print_error "Akkoma webfinger test failed for $remote_domain (HTTP $http_code)"
            return 1
        fi
    else
        print_error "curl command not available for handshake testing"
        return 1
    fi
}

# Function to test Matrix federation handshake
test_matrix_handshake() {
    local remote_domain="$1"
    
    # Test Matrix server discovery
    local server_url="https://$remote_domain/.well-known/matrix/server"
    
    if command -v curl >/dev/null 2>&1; then
        local response=$(curl -s -w "%{http_code}" "$server_url" 2>/dev/null)
        local http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            print_success "Matrix server discovery test passed for $remote_domain"
            return 0
        else
            print_error "Matrix server discovery test failed for $remote_domain (HTTP $http_code)"
            return 1
        fi
    else
        print_error "curl command not available for handshake testing"
        return 1
    fi
}

# Function to test PeerTube federation handshake
test_peertube_handshake() {
    local remote_domain="$1"
    
    # Test PeerTube nodeinfo
    local nodeinfo_url="https://$remote_domain/nodeinfo/2.0"
    
    if command -v curl >/dev/null 2>&1; then
        local response=$(curl -s -w "%{http_code}" "$nodeinfo_url" 2>/dev/null)
        local http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            print_success "PeerTube nodeinfo test passed for $remote_domain"
            return 0
        else
            print_error "PeerTube nodeinfo test failed for $remote_domain (HTTP $http_code)"
            return 1
        fi
    else
        print_error "curl command not available for handshake testing"
        return 1
    fi
}

# Function to test Jitsi federation handshake
test_jitsi_handshake() {
    local remote_domain="$1"
    
    # Test Jitsi configuration
    local config_url="https://$remote_domain/config.js"
    
    if command -v curl >/dev/null 2>&1; then
        local response=$(curl -s -w "%{http_code}" "$config_url" 2>/dev/null)
        local http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            print_success "Jitsi configuration test passed for $remote_domain"
            return 0
        else
            print_error "Jitsi configuration test failed for $remote_domain (HTTP $http_code)"
            return 1
        fi
    else
        print_error "curl command not available for handshake testing"
        return 1
    fi
}

# Function to fix common federation issues
fix_federation_issues() {
    local service="$1"
    
    print_heal "Fixing common federation issues for $service..."
    
    # Fix 1: Regenerate well-known files
    if [ -f "$PROJECT_DIR/scripts/federation/create-well-known-files.sh" ]; then
        print_heal "Regenerating well-known files..."
        "$PROJECT_DIR/scripts/federation/create-well-known-files.sh" >/dev/null 2>&1 || true
    fi
    
    # Fix 2: Check and fix DNS configuration
    fix_dns_configuration "$service"
    
    # Fix 3: Check and fix SSL certificates
    fix_ssl_certificates "$service"
    
    # Fix 4: Check and fix firewall rules
    fix_firewall_rules "$service"
    
    # Fix 5: Regenerate service keys if needed
    fix_service_keys "$service"
    
    print_success "Common federation issues addressed for $service"
}

# Function to fix DNS configuration
fix_dns_configuration() {
    local service="$1"
    
    print_heal "Checking DNS configuration for $service..."
    
    # Check if domain resolves
    local domain="elkzone.example.com"
    case "$service" in
        "akkoma") domain="social.elkzone.example.com" ;;
        "matrix") domain="matrix.elkzone.example.com" ;;
        "peertube") domain="videos.elkzone.example.com" ;;
        "jitsi") domain="meet.elkzone.example.com" ;;
    esac
    
    if command -v nslookup >/dev/null 2>&1; then
        if nslookup "$domain" >/dev/null 2>&1; then
            print_success "DNS resolution working for $domain"
        else
            print_warning "DNS resolution failed for $domain - manual intervention required"
        fi
    fi
}

# Function to fix SSL certificates
fix_ssl_certificates() {
    local service="$1"
    
    print_heal "Checking SSL certificates for $service..."
    
    local domain="elkzone.example.com"
    case "$service" in
        "akkoma") domain="social.elkzone.example.com" ;;
        "matrix") domain="matrix.elkzone.example.com" ;;
        "peertube") domain="videos.elkzone.example.com" ;;
        "jitsi") domain="meet.elkzone.example.com" ;;
    esac
    
    if command -v openssl >/dev/null 2>&1; then
        if echo | openssl s_client -connect "$domain:443" -servername "$domain" >/dev/null 2>&1; then
            print_success "SSL certificate valid for $domain"
        else
            print_warning "SSL certificate issue detected for $domain"
            
            # Try to renew certificate if certbot is available
            if command -v certbot >/dev/null 2>&1; then
                print_heal "Attempting to renew SSL certificate for $domain..."
                certbot renew --cert-name "$domain" >/dev/null 2>&1 || true
            fi
        fi
    fi
}

# Function to fix firewall rules
fix_firewall_rules() {
    local service="$1"
    
    print_heal "Checking firewall rules for $service..."
    
    # Common federation ports
    local ports=""
    case "$service" in
        "akkoma") ports="80,443,4000" ;;
        "matrix") ports="80,443,8008,8448" ;;
        "peertube") ports="80,443,9000,1935" ;;
        "jitsi") ports="80,443,4443,10000" ;;
    esac
    
    # Check if firewall is blocking ports
    if command -v ufw >/dev/null 2>&1; then
        for port in ${ports//,/ }; do
            if ! ufw status | grep -q "$port"; then
                print_heal "Opening port $port for $service..."
                ufw allow "$port" >/dev/null 2>&1 || true
            fi
        done
    fi
}

# Function to fix service keys
fix_service_keys() {
    local service="$1"
    
    print_heal "Checking service keys for $service..."
    
    # Check if keys exist and are valid
    local key_file=""
    case "$service" in
        "akkoma") key_file="$CONFIG_DIR/akkoma/keys/private.pem" ;;
        "matrix") key_file="$CONFIG_DIR/matrix/keys/ed25519.key" ;;
        "peertube") key_file="$CONFIG_DIR/peertube/keys/private.pem" ;;
        "jitsi") key_file="$CONFIG_DIR/jitsi/keys/private.pem" ;;
    esac
    
    if [ -n "$key_file" ] && [ ! -f "$key_file" ]; then
        print_warning "Service keys missing for $service, regenerating..."
        
        if [ -f "$PROJECT_DIR/scripts/federation/generate-federation-keys.sh" ]; then
            "$PROJECT_DIR/scripts/federation/generate-federation-keys.sh" >/dev/null 2>&1 || true
        fi
    fi
}

# Function to heal failed federation handshake
heal_federation_handshake() {
    local service="$1"
    local remote_domain="$2"
    local attempt=1
    
    print_heal "Starting federation handshake healing for $service with $remote_domain..."
    
    # Create backup before making changes
    local backup_path=$(backup_configuration "$service")
    
    while [ $attempt -le $MAX_RETRY_ATTEMPTS ]; do
        print_heal "Healing attempt $attempt/$MAX_RETRY_ATTEMPTS for $service..."
        
        # Fix common issues
        fix_federation_issues "$service"
        
        # Restart service
        restart_service "$service"
        
        # Wait for service to be ready
        sleep $HEALTH_CHECK_INTERVAL
        
        # Test handshake again
        if test_federation_handshake "$service" "$remote_domain"; then
            print_success "Federation handshake healed successfully for $service with $remote_domain"
            return 0
        fi
        
        attempt=$((attempt + 1))
        
        if [ $attempt -le $MAX_RETRY_ATTEMPTS ]; then
            print_warning "Handshake test failed, retrying in 30 seconds..."
            sleep 30
        fi
    done
    
    # All attempts failed, consider rollback
    if [ "$ROLLBACK_ENABLED" = "true" ]; then
        print_rollback "All healing attempts failed, rolling back $service..."
        restore_configuration "$service" "$backup_path"
    else
        print_error "All healing attempts failed for $service, rollback disabled"
    fi
    
    return 1
}

# Function to restart service
restart_service() {
    local service="$1"
    
    print_heal "Restarting $service service..."
    
    stop_service "$service"
    sleep 5
    start_service "$service"
    
    print_success "Service $service restarted"
}

# Function to run comprehensive federation health check
run_federation_health_check() {
    print_status "Running comprehensive federation health check..."
    
    local failed_services=()
    
    # Check each service
    for service in "${!FEDERATION_SERVICES[@]}"; do
        print_status "Checking $service service..."
        
        # Check if service is running
        if ! is_service_healthy "$service"; then
            print_warning "Service $service is not healthy"
            failed_services+=("$service")
            continue
        fi
        
        # Test federation handshake with known domains
        local test_domains=""
        case "$service" in
            "akkoma") test_domains="mastodon.social,mastodon.online" ;;
            "matrix") test_domains="matrix.org,librem.one" ;;
            "peertube") test_domains="peertube.tv,fedi.video" ;;
            "jitsi") test_domains="meet.jit.si,jitsi.riot.im" ;;
        esac
        
        for domain in ${test_domains//,/ }; do
            if ! test_federation_handshake "$service" "$domain"; then
                print_warning "Federation handshake failed for $service with $domain"
                failed_services+=("$service:$domain")
            fi
        done
    done
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        print_success "All federation services are healthy"
        return 0
    else
        print_warning "Found ${#failed_services[@]} federation issues"
        
        # Attempt to heal failed services
        for failed_service in "${failed_services[@]}"; do
            if [[ "$failed_service" == *":"* ]]; then
                local service="${failed_service%%:*}"
                local domain="${failed_service##*:}"
                heal_federation_handshake "$service" "$domain"
            else
                heal_service_deployment "$failed_service"
            fi
        done
        
        return 1
    fi
}

# Function to check if service is healthy
is_service_healthy() {
    local service="$1"
    
    # Check if service process is running
    if command -v docker >/dev/null 2>&1; then
        local container_name="elkzone-$service"
        if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
            # Check container health status
            local health_status=$(docker inspect "$container_name" --format='{{.State.Health.Status}}' 2>/dev/null)
            if [ "$health_status" = "healthy" ] || [ "$health_status" = "" ]; then
                return 0
            fi
        fi
    elif command -v systemctl >/dev/null 2>&1; then
        if systemctl is-active --quiet "elkzone-$service"; then
            return 0
        fi
    fi
    
    return 1
}

# Function to heal service deployment
heal_service_deployment() {
    local service="$1"
    
    print_heal "Healing deployment for $service service..."
    
    # Create backup
    local backup_path=$(backup_configuration "$service")
    
    # Fix common issues
    fix_federation_issues "$service"
    
    # Restart service
    restart_service "$service"
    
    # Wait and check health
    sleep $HEALTH_CHECK_INTERVAL
    
    if is_service_healthy "$service"; then
        print_success "Service deployment healed successfully for $service"
        return 0
    else
        print_error "Service deployment healing failed for $service"
        
        if [ "$ROLLBACK_ENABLED" = "true" ]; then
            restore_configuration "$service" "$backup_path"
        fi
        
        return 1
    fi
}

# Function to monitor and auto-heal continuously
monitor_and_heal() {
    print_status "Starting continuous federation monitoring and auto-healing..."
    print_status "Health check interval: ${HEALTH_CHECK_INTERVAL}s"
    print_status "Max retry attempts: $MAX_RETRY_ATTEMPTS"
    print_status "Heal timeout: ${HEAL_TIMEOUT}s"
    print_status "Rollback enabled: $ROLLBACK_ENABLED"
    
    while true; do
        run_federation_health_check
        sleep $HEALTH_CHECK_INTERVAL
    done
}

# Function to display healing status
display_healing_status() {
    echo ""
    echo -e "${GREEN}🔧 Auto-Heal Deployment Status${NC}"
    echo ""
    
    # Show recent healing activities
    if [ -f "$HEAL_LOG" ]; then
        echo -e "${BLUE}📝 Recent Healing Activity:${NC}"
        tail -n 20 "$HEAL_LOG" | grep -E "\[HEAL\]|\[ROLLBACK\]|\[SUCCESS\]|\[ERROR\]" | while IFS= read -r line; do
            echo "  $line"
        done
        echo ""
    fi
    
    # Show backup status
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${BLUE}💾 Backup Status:${NC}"
        for service in "${!FEDERATION_SERVICES[@]}"; do
            if [ -L "$BACKUP_DIR/$service/latest" ]; then
                local latest_backup=$(readlink "$BACKUP_DIR/$service/latest")
                local backup_time=$(stat -c %Y "$latest_backup" 2>/dev/null)
                local backup_age=$(( ($(date +%s) - backup_time) / 60 ))  # minutes
                
                echo -e "  ${GREEN}✅ $service: Backup available (${backup_age}m old)${NC}"
            else
                echo -e "  ${YELLOW}⚠️  $service: No backup found${NC}"
            fi
        done
        echo ""
    fi
    
    # Show service health
    echo -e "${BLUE}🏥 Service Health:${NC}"
    for service in "${!FEDERATION_SERVICES[@]}"; do
        if is_service_healthy "$service"; then
            echo -e "  ${GREEN}✅ $service: Healthy${NC}"
        else
            echo -e "  ${RED}❌ $service: Unhealthy${NC}"
        fi
    done
    echo ""
}

# Main execution
main() {
    setup_auto_heal
    
    case "${1:-monitor}" in
        "monitor")
            monitor_and_heal
            ;;
        "check")
            run_federation_health_check
            ;;
        "heal")
            if [ -z "$2" ]; then
                print_error "Service name required for heal command"
                echo "Usage: $0 heal <service> [remote_domain]"
                echo "Services: ${!FEDERATION_SERVICES[@]}"
                exit 1
            fi
            
            local service="$2"
            local remote_domain="$3"
            
            if [[ ! " ${!FEDERATION_SERVICES[@]} " =~ " $service " ]]; then
                print_error "Unknown service: $service"
                echo "Valid services: ${!FEDERATION_SERVICES[@]}"
                exit 1
            fi
            
            if [ -n "$remote_domain" ]; then
                heal_federation_handshake "$service" "$remote_domain"
            else
                heal_service_deployment "$service"
            fi
            ;;
        "status")
            display_healing_status
            ;;
        "backup")
            if [ -z "$2" ]; then
                print_error "Service name required for backup command"
                echo "Usage: $0 backup <service>"
                echo "Services: ${!FEDERATION_SERVICES[@]}"
                exit 1
            fi
            
            local service="$2"
            if [[ ! " ${!FEDERATION_SERVICES[@]} " =~ " $service " ]]; then
                print_error "Unknown service: $service"
                exit 1
            fi
            
            backup_configuration "$service"
            ;;
        "restore")
            if [ -z "$2" ] || [ -z "$3" ]; then
                print_error "Service name and backup path required for restore command"
                echo "Usage: $0 restore <service> <backup_path>"
                exit 1
            fi
            
            restore_configuration "$2" "$3"
            ;;
        "--help"|"-h")
            echo "ELK.Zone 2.0 - Auto-Heal Deployment System"
            echo ""
            echo "Usage: $0 [COMMAND] [OPTIONS]"
            echo ""
            echo "Commands:"
            echo "  monitor                     Start continuous monitoring and auto-healing"
            echo "  check                       Run comprehensive federation health check"
            echo "  heal <service> [domain]     Heal service deployment or federation handshake"
            echo "  backup <service>            Create backup of service configuration"
            echo "  restore <service> <path>    Restore service from backup"
            echo "  status                      Display healing status and statistics"
            echo ""
            echo "Services: ${!FEDERATION_SERVICES[@]}"
            echo ""
            echo "Environment Variables:"
            echo "  MAX_RETRY_ATTEMPTS         Maximum retry attempts (default: 3)"
            echo "  HEAL_TIMEOUT               Healing timeout in seconds (default: 300)"
            echo "  ROLLBACK_ENABLED           Enable rollback on failure (default: true)"
            echo "  HEALTH_CHECK_INTERVAL      Health check interval in seconds (default: 30)"
            echo ""
            echo "Examples:"
            echo "  $0 monitor                  # Start continuous monitoring"
            echo "  $0 check                    # Run health check"
            echo "  $0 heal akkoma              # Heal Akkoma deployment"
            echo "  $0 heal matrix mastodon.social  # Heal Matrix handshake with mastodon.social"
            echo "  $0 backup peertube           # Backup PeerTube configuration"
            echo "  MAX_RETRY_ATTEMPTS=5 $0 heal akkoma  # Heal with 5 retry attempts"
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