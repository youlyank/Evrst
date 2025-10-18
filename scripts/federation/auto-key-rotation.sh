#!/bin/bash

# ELK.Zone 2.0 - Auto Key Rotation System
# Periodic rotation of federation keys with backup and validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FEDERATION_DIR="$PROJECT_DIR/federation"
BACKUP_DIR="$PROJECT_DIR/backups/federation-keys"
LOG_FILE="$PROJECT_DIR/logs/key-otation.log"
ROTATION_INTERVAL_DAYS=${ROTATION_INTERVAL_DAYS:-90}
MAX_BACKUPS=${MAX_BACKUPS:-10}

# Service configuration
declare -A SERVICES=(
    ["akkoma"]="ActivityPub RSA 4096"
    ["matrix"]="Matrix Ed25519"
    ["peertube"]="PeerTube RSA 4096"
    ["jitsi"]="Jitsi ECDSA 256"
)

echo -e "${GREEN}🔄 ELK.Zone 2.0 - Auto Key Rotation System${NC}"
echo -e "${BLUE}Project Directory: ${PROJECT_DIR}${NC}"

# Function to print colored output
print_status() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[INFO]${NC} [$timestamp] $1" | tee -a "$LOG_FILE"
}

print_warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[WARNING]${NC} [$timestamp] $1" | tee -a "$LOG_FILE"
}

print_error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[ERROR]${NC} [$timestamp] $1" | tee -a "$LOG_FILE"
}

print_success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[SUCCESS]${NC} [$timestamp] $1" | tee -a "$LOG_FILE"
}

print_rotation() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${PURPLE}[ROTATION]${NC} [$timestamp] $1" | tee -a "$LOG_FILE"
}

# Function to initialize logging
setup_logging() {
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$BACKUP_DIR"
    
    print_status "Key rotation logging initialized"
    print_status "Log file: $LOG_FILE"
    print_status "Backup directory: $BACKUP_DIR"
}

# Function to check if rotation is needed
check_rotation_needed() {
    local service="$1"
    local key_file="$2"
    
    if [ ! -f "$key_file" ]; then
        print_warning "Key file not found for $service: $key_file"
        return 0  # Rotate if key doesn't exist
    fi
    
    local key_age_days=$(( ($(date +%s) - $(stat -c %Y "$key_file")) / 86400 ))
    
    if [ $key_age_days -ge $ROTATION_INTERVAL_DAYS ]; then
        print_rotation "$service key is $key_age_days days old (threshold: $ROTATION_INTERVAL_DAYS days)"
        return 0  # Rotation needed
    else
        print_status "$service key is $key_age_days days old (threshold: $ROTATION_INTERVAL_DAYS days) - no rotation needed"
        return 1  # No rotation needed
    fi
}

# Function to backup existing keys
backup_keys() {
    local service="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_service_dir="$BACKUP_DIR/$service/$timestamp"
    
    print_status "Creating backup for $service keys..."
    
    mkdir -p "$backup_service_dir"
    
    # Backup all key files for the service
    if [ -d "$FEDERATION_DIR/$service/keys" ]; then
        cp -r "$FEDERATION_DIR/$service/keys/"* "$backup_service_dir/" 2>/dev/null || true
    fi
    
    # Backup environment variables related to this service
    if [ -f "$PROJECT_DIR/.env.prod" ]; then
        grep -E "^(AKKOMA|MATRIX|PEERTUBE|JITSI)_.*_KEY" "$PROJECT_DIR/.env.prod" | grep -i "$service" > "$backup_service_dir/env_vars.txt" 2>/dev/null || true
    fi
    
    # Create backup metadata
    cat > "$backup_service_dir/metadata.json" << EOF
{
    "service": "$service",
    "backup_timestamp": "$(date -Iseconds)",
    "rotation_reason": "scheduled_rotation",
    "key_type": "${SERVICES[$service]}",
    "files": $(ls -la "$backup_service_dir" | grep -v '^total' | awk '{print "\""$9"\""}' | grep -v 'metadata.json' | tr '\n' ',' | sed 's/,$//' | sed 's/^/[/;s/$/]/')
}
EOF
    
    print_success "Backup created for $service: $backup_service_dir"
}

# Function to rotate service keys
rotate_service_keys() {
    local service="$1"
    
    print_rotation "Starting key rotation for $service (${SERVICES[$service]})..."
    
    # Backup existing keys
    backup_keys "$service"
    
    case "$service" in
        "akkoma")
            rotate_akkoma_keys
            ;;
        "matrix")
            rotate_matrix_keys
            ;;
        "peertube")
            rotate_peertube_keys
            ;;
        "jitsi")
            rotate_jitsi_keys
            ;;
        *)
            print_error "Unknown service: $service"
            return 1
            ;;
    esac
    
    print_success "Key rotation completed for $service"
}

# Function to rotate Akkoma keys
rotate_akkoma_keys() {
    print_rotation "Rotating Akkoma RSA 4096 key pair..."
    
    local private_key_file="$FEDERATION_DIR/akkoma/keys/private.pem"
    local public_key_file="$FEDERATION_DIR/akkoma/keys/public.pem"
    
    # Generate new key pair
    openssl genrsa -out "$private_key_file.new" 4096
    openssl rsa -in "$private_key_file.new" -pubout -out "$public_key_file.new"
    
    # Validate new keys
    if ! openssl rsa -in "$private_key_file.new" -check -noout >/dev/null 2>&1; then
        print_error "Generated Akkoma private key is invalid"
        rm -f "$private_key_file.new" "$public_key_file.new"
        return 1
    fi
    
    # Set proper permissions
    chmod 600 "$private_key_file.new"
    chmod 644 "$public_key_file.new"
    
    # Atomically replace old keys
    mv "$private_key_file.new" "$private_key_file"
    mv "$public_key_file.new" "$public_key_file"
    
    # Update environment variables
    update_env_vars "AKKOMA" "$private_key_file" "$public_key_file"
    
    print_success "Akkoma keys rotated successfully"
}

# Function to rotate Matrix keys
rotate_matrix_keys() {
    print_rotation "Rotating Matrix Ed25519 key pair..."
    
    local private_key_file="$FEDERATION_DIR/matrix/keys/ed25519.key"
    local server_key_file="$FEDERATION_DIR/matrix/keys/server.key"
    
    # Generate new Ed25519 key
    openssl genpkey -algorithm Ed25519 -out "$private_key_file.new"
    
    # Generate new server signing key
    openssl genpkey -algorithm Ed25519 -out "$server_key_file.new"
    
    # Validate new keys
    if ! openssl pkey -in "$private_key_file.new" -check -noout >/dev/null 2>&1; then
        print_error "Generated Matrix private key is invalid"
        rm -f "$private_key_file.new" "$server_key_file.new"
        return 1
    fi
    
    # Set proper permissions
    chmod 600 "$private_key_file.new" "$server_key_file.new"
    
    # Atomically replace old keys
    mv "$private_key_file.new" "$private_key_file"
    mv "$server_key_file.new" "$server_key_file"
    
    # Update environment variables
    update_matrix_env_vars "$private_key_file" "$server_key_file"
    
    print_success "Matrix keys rotated successfully"
}

# Function to rotate PeerTube keys
rotate_peertube_keys() {
    print_rotation "Rotating PeerTube RSA 4096 key pair..."
    
    local private_key_file="$FEDERATION_DIR/peertube/keys/private.pem"
    local public_key_file="$FEDERATION_DIR/peertube/keys/public.pem"
    
    # Generate new key pair
    openssl genrsa -out "$private_key_file.new" 4096
    openssl rsa -in "$private_key_file.new" -pubout -out "$public_key_file.new"
    
    # Validate new keys
    if ! openssl rsa -in "$private_key_file.new" -check -noout >/dev/null 2>&1; then
        print_error "Generated PeerTube private key is invalid"
        rm -f "$private_key_file.new" "$public_key_file.new"
        return 1
    fi
    
    # Set proper permissions
    chmod 600 "$private_key_file.new"
    chmod 644 "$public_key_file.new"
    
    # Atomically replace old keys
    mv "$private_key_file.new" "$private_key_file"
    mv "$public_key_file.new" "$public_key_file"
    
    # Update environment variables
    update_env_vars "PEERTUBE" "$private_key_file" "$public_key_file"
    
    print_success "PeerTube keys rotated successfully"
}

# Function to rotate Jitsi keys
rotate_jitsi_keys() {
    print_rotation "Rotating Jitsi ECDSA 256 key pair..."
    
    local private_key_file="$FEDERATION_DIR/jitsi/keys/private.pem"
    local public_key_file="$FEDERATION_DIR/jitsi/keys/public.pem"
    
    # Generate new ECDSA key pair
    openssl ecparam -name prime256v1 -genkey -noout -out "$private_key_file.new"
    openssl ec -in "$private_key_file.new" -pubout -out "$public_key_file.new"
    
    # Validate new keys
    if ! openssl ec -in "$private_key_file.new" -check -noout >/dev/null 2>&1; then
        print_error "Generated Jitsi private key is invalid"
        rm -f "$private_key_file.new" "$public_key_file.new"
        return 1
    fi
    
    # Set proper permissions
    chmod 600 "$private_key_file.new"
    chmod 644 "$public_key_file.new"
    
    # Atomically replace old keys
    mv "$private_key_file.new" "$private_key_file"
    mv "$public_key_file.new" "$public_key_file"
    
    # Update environment variables
    update_env_vars "JITSI" "$private_key_file" "$public_key_file"
    
    print_success "Jitsi keys rotated successfully"
}

# Function to update environment variables
update_env_vars() {
    local service="$1"
    local private_key_file="$2"
    local public_key_file="$3"
    
    local env_file="$PROJECT_DIR/.env.prod"
    local temp_file="$env_file.tmp"
    
    if [ ! -f "$env_file" ]; then
        print_warning "Environment file not found: $env_file"
        return 1
    fi
    
    # Extract key values
    local private_key=$(cat "$private_key_file")
    local public_key=$(cat "$public_key_file")
    
    # Update private key
    grep -v "^${service}_PRIVATE_KEY=" "$env_file" > "$temp_file"
    echo "${service}_PRIVATE_KEY='$private_key'" >> "$temp_file"
    
    # Update public key
    grep -v "^${service}_PUBLIC_KEY=" "$temp_file" > "$env_file"
    echo "${service}_PUBLIC_KEY='$public_key'" >> "$env_file"
    
    rm -f "$temp_file"
    
    print_status "Environment variables updated for $service"
}

# Function to update Matrix environment variables
update_matrix_env_vars() {
    local private_key_file="$1"
    local server_key_file="$2"
    
    local env_file="$PROJECT_DIR/.env.prod"
    local temp_file="$env_file.tmp"
    
    if [ ! -f "$env_file" ]; then
        print_warning "Environment file not found: $env_file"
        return 1
    fi
    
    # Extract key values
    local private_key=$(base64 -w 0 "$private_key_file")
    local server_key=$(base64 -w 0 "$server_key_file")
    
    # Update private key
    grep -v "^MATRIX_PRIVATE_KEY=" "$env_file" > "$temp_file"
    echo "MATRIX_PRIVATE_KEY=$private_key" >> "$temp_file"
    
    # Update server key
    grep -v "^MATRIX_SERVER_KEY=" "$temp_file" > "$env_file"
    echo "MATRIX_SERVER_KEY=$server_key" >> "$env_file"
    
    rm -f "$temp_file"
    
    print_status "Environment variables updated for Matrix"
}

# Function to update federation manifest
update_federation_manifest() {
    print_status "Updating federation manifest..."
    
    local manifest_file="$FEDERATION_DIR/federation_keys_manifest.json"
    local temp_file="$manifest_file.tmp"
    
    if [ ! -f "$manifest_file" ]; then
        print_warning "Federation manifest not found, creating new one..."
        "$PROJECT_DIR/scripts/federation/generate-federation-keys.sh" --manifest-only
        return 0
    fi
    
    # Update manifest with new fingerprints and timestamps
    local domain=${FEDERATION_DOMAIN:-"elkzone.example.com"}
    
    # Use jq to update the manifest safely
    if command -v jq >/dev/null 2>&1; then
        jq --arg timestamp "$(date -Iseconds)" \
           --arg akkoma_fp "$(openssl rsa -in "$FEDERATION_DIR/akkoma/keys/public.pem" -pubin -pubout -outform DER | sha256sum | cut -d' ' -f1)" \
           --arg matrix_fp "$(openssl pkey -in "$FEDERATION_DIR/matrix/keys/ed25519.key" -outform DER | sha256sum | cut -d' ' -f1)" \
           --arg peertube_fp "$(openssl rsa -in "$FEDERATION_DIR/peertube/keys/public.pem" -pubin -pubout -outform DER | sha256sum | cut -d' ' -f1)" \
           --arg jitsi_fp "$(openssl ec -in "$FEDERATION_DIR/jitsi/keys/private.pem" -outform DER | sha256sum | cut -d' ' -f1)" \
           '.generated_at = $timestamp | 
            .federation_services.akkoma.fingerprint = $akkoma_fp |
            .federation_services.matrix.fingerprint = $matrix_fp |
            .federation_services.peertube.fingerprint = $peertube_fp |
            .federation_services.jitsi.fingerprint = $jitsi_fp' \
           "$manifest_file" > "$temp_file"
        
        mv "$temp_file" "$manifest_file"
    else
        print_warning "jq not found, manually updating manifest..."
        # Fallback: regenerate the entire manifest
        "$PROJECT_DIR/scripts/federation/generate-federation-keys.sh" --manifest-only
    fi
    
    print_success "Federation manifest updated"
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (keeping last $MAX_BACKUPS)..."
    
    for service in "${!SERVICES[@]}"; do
        local service_backup_dir="$BACKUP_DIR/$service"
        
        if [ -d "$service_backup_dir" ]; then
            local backup_count=$(ls -1 "$service_backup_dir" 2>/dev/null | wc -l)
            
            if [ $backup_count -gt $MAX_BACKUPS ]; then
                local backups_to_remove=$((backup_count - MAX_BACKUPS))
                print_status "Removing $backups_to_remove old backups for $service"
                
                ls -1t "$service_backup_dir" | tail -n $backups_to_remove | while read -r backup; do
                    rm -rf "$service_backup_dir/$backup"
                    print_status "Removed old backup: $service_backup_dir/$backup"
                done
            fi
        fi
    done
    
    print_success "Backup cleanup completed"
}

# Function to validate rotated keys
validate_rotated_keys() {
    print_status "Validating rotated keys..."
    
    local validation_failed=false
    
    # Validate Akkoma keys
    if [ -f "$FEDERATION_DIR/akkoma/keys/private.pem" ]; then
        if ! openssl rsa -in "$FEDERATION_DIR/akkoma/keys/private.pem" -check -noout >/dev/null 2>&1; then
            print_error "Akkoma private key validation failed"
            validation_failed=true
        fi
    fi
    
    # Validate Matrix keys
    if [ -f "$FEDERATION_DIR/matrix/keys/ed25519.key" ]; then
        if ! openssl pkey -in "$FEDERATION_DIR/matrix/keys/ed25519.key" -check -noout >/dev/null 2>&1; then
            print_error "Matrix private key validation failed"
            validation_failed=true
        fi
    fi
    
    # Validate PeerTube keys
    if [ -f "$FEDERATION_DIR/peertube/keys/private.pem" ]; then
        if ! openssl rsa -in "$FEDERATION_DIR/peertube/keys/private.pem" -check -noout >/dev/null 2>&1; then
            print_error "PeerTube private key validation failed"
            validation_failed=true
        fi
    fi
    
    # Validate Jitsi keys
    if [ -f "$FEDERATION_DIR/jitsi/keys/private.pem" ]; then
        if ! openssl ec -in "$FEDERATION_DIR/jitsi/keys/private.pem" -check -noout >/dev/null 2>&1; then
            print_error "Jitsi private key validation failed"
            validation_failed=true
        fi
    fi
    
    if [ "$validation_failed" = true ]; then
        print_error "Key validation failed after rotation"
        return 1
    else
        print_success "All keys validated successfully after rotation"
        return 0
    fi
}

# Function to send rotation notification
send_rotation_notification() {
    local rotated_services="$1"
    local status="$2"
    
    # This could be extended to send email, Slack, or other notifications
    print_status "Rotation notification: $status for services: $rotated_services"
    
    # Create rotation report
    local report_file="$PROJECT_DIR/logs/rotation-report-$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "rotation_timestamp": "$(date -Iseconds)",
    "rotated_services": [$rotated_services],
    "status": "$status",
    "rotation_interval_days": $ROTATION_INTERVAL_DAYS,
    "backup_location": "$BACKUP_DIR",
    "log_file": "$LOG_FILE"
}
EOF
    
    print_status "Rotation report created: $report_file"
}

# Function to test federation after rotation
test_federation_after_rotation() {
    print_status "Testing federation after key rotation..."
    
    if [ -f "$PROJECT_DIR/scripts/federation/test-federation.sh" ]; then
        if "$PROJECT_DIR/scripts/federation/test-federation.sh" --quick; then
            print_success "Federation tests passed after key rotation"
            return 0
        else
            print_warning "Federation tests failed after key rotation - manual intervention may be required"
            return 1
        fi
    else
        print_warning "Federation test script not found, skipping federation tests"
        return 0
    fi
}

# Main rotation function
main() {
    print_status "Starting automatic key rotation process..."
    
    # Setup logging and directories
    setup_logging
    
    local rotated_services=""
    local rotation_failed=false
    
    # Check each service for rotation needs
    for service in "${!SERVICES[@]}"; do
        local key_file=""
        
        case "$service" in
            "akkoma")
                key_file="$FEDERATION_DIR/akkoma/keys/private.pem"
                ;;
            "matrix")
                key_file="$FEDERATION_DIR/matrix/keys/ed25519.key"
                ;;
            "peertube")
                key_file="$FEDERATION_DIR/peertube/keys/private.pem"
                ;;
            "jitsi")
                key_file="$FEDERATION_DIR/jitsi/keys/private.pem"
                ;;
        esac
        
        if check_rotation_needed "$service" "$key_file"; then
            print_rotation "Rotating keys for $service..."
            
            if rotate_service_keys "$service"; then
                rotated_services="$rotated_services \"$service\""
            else
                print_error "Failed to rotate keys for $service"
                rotation_failed=true
            fi
        fi
    done
    
    # Update federation manifest if any keys were rotated
    if [ -n "$rotated_services" ]; then
        update_federation_manifest
        
        # Validate rotated keys
        if validate_rotated_keys; then
            # Test federation after rotation
            test_federation_after_rotation
            
            # Send success notification
            send_rotation_notification "$rotated_services" "success"
            
            # Cleanup old backups
            cleanup_old_backups
            
            print_success "Key rotation completed successfully for: $rotated_services"
        else
            send_rotation_notification "$rotated_services" "validation_failed"
            print_error "Key rotation validation failed"
            rotation_failed=true
        fi
    else
        print_status "No keys required rotation"
    fi
    
    if [ "$rotation_failed" = true ]; then
        print_error "Key rotation process completed with errors"
        exit 1
    else
        print_success "Key rotation process completed successfully"
    fi
}

# Handle command line arguments
case "${1:-}" in
    --force)
        print_warning "Force rotation mode enabled - rotating all keys regardless of age"
        ROTATION_INTERVAL_DAYS=0
        main
        ;;
    --service)
        if [ -z "$2" ]; then
            print_error "Service name required when using --service option"
            exit 1
        fi
        
        if [[ ! " ${!SERVICES[@]} " =~ " $2 " ]]; then
            print_error "Invalid service: $2. Valid services: ${!SERVICES[@]}"
            exit 1
        fi
        
        print_status "Rotating keys for specific service: $2"
        setup_logging
        rotate_service_keys "$2"
        update_federation_manifest
        validate_rotated_keys
        test_federation_after_rotation
        ;;
    --check)
        print_status "Checking key ages without rotating..."
        setup_logging
        
        for service in "${!SERVICES[@]}"; do
            local key_file=""
            case "$service" in
                "akkoma") key_file="$FEDERATION_DIR/akkoma/keys/private.pem" ;;
                "matrix") key_file="$FEDERATION_DIR/matrix/keys/ed25519.key" ;;
                "peertube") key_file="$FEDERATION_DIR/peertube/keys/private.pem" ;;
                "jitsi") key_file="$FEDERATION_DIR/jitsi/keys/private.pem" ;;
            esac
            
            check_rotation_needed "$service" "$key_file"
        done
        ;;
    --cleanup)
        print_status "Running backup cleanup only..."
        setup_logging
        cleanup_old_backups
        ;;
    --help|-h)
        echo "ELK.Zone 2.0 - Auto Key Rotation System"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --force         Force rotation of all keys regardless of age"
        echo "  --service NAME  Rotate keys for specific service only"
        echo "  --check         Check key ages without rotating"
        echo "  --cleanup       Cleanup old backups only"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "Services: ${!SERVICES[@]}"
        echo ""
        echo "Environment Variables:"
        echo "  ROTATION_INTERVAL_DAYS  Key rotation interval in days (default: 90)"
        echo "  MAX_BACKUPS            Maximum number of backups to keep (default: 10)"
        echo "  FEDERATION_DOMAIN      Federation domain (default: elkzone.example.com)"
        ;;
    *)
        main
        ;;
esac