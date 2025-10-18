#!/bin/bash

# ELK.Zone 2.0 - Federation Keys Generation Script
# Generates identity keys for all federation services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FEDERATION_DIR="$PROJECT_DIR/federation"
ENV_FILE="$PROJECT_DIR/.env.prod"

echo -e "${GREEN}🔑 ELK.Zone 2.0 - Federation Keys Generation${NC}"
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

# Function to generate secure random string
generate_secure_string() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to create directory structure
create_federation_structure() {
    print_status "Creating federation directory structure..."
    
    mkdir -p "$FEDERATION_DIR"/{akkoma,matrix,peertube,jitsi}/keys
    mkdir -p "$FEDERATION_DIR"/well-known
    
    print_success "Federation directory structure created"
}

# Function to safely add environment variable
add_env_var() {
    local key="$1"
    local value="$2"
    local temp_file="$ENV_FILE.tmp"
    
    # Remove existing key if present
    if grep -q "^${key}=" "$ENV_FILE"; then
        grep -v "^${key}=" "$ENV_FILE" > "$temp_file"
    else
        cp "$ENV_FILE" "$temp_file"
    fi
    
    # Add new key
    echo "${key}=${value}" >> "$temp_file"
    mv "$temp_file" "$ENV_FILE"
}

# Function to generate Akkoma (ActivityPub) keys
generate_akkoma_keys() {
    print_status "Generating Akkoma (ActivityPub) RSA 4096 key pair..."
    
    local private_key_file="$FEDERATION_DIR/akkoma/keys/private.pem"
    local public_key_file="$FEDERATION_DIR/akkoma/keys/public.pem"
    
    # Generate 4096-bit RSA key pair
    openssl genrsa -out "$private_key_file" 4096
    openssl rsa -in "$private_key_file" -pubout -out "$public_key_file"
    
    # Set proper permissions
    chmod 600 "$private_key_file"
    chmod 644 "$public_key_file"
    
    # Extract key values for environment
    local private_key=$(cat "$private_key_file")
    local public_key=$(cat "$public_key_file")
    
    # Update environment file safely
    add_env_var "AKKOMA_PRIVATE_KEY" "'$private_key'"
    add_env_var "AKKOMA_PUBLIC_KEY" "'$public_key'"
    
    print_success "Akkoma keys generated and configured"
}

# Function to generate Matrix (Synapse) keys
generate_matrix_keys() {
    print_status "Generating Matrix (Synapse) Ed25519 key pair..."
    
    local private_key_file="$FEDERATION_DIR/matrix/keys/ed25519.key"
    local server_key_file="$FEDERATION_DIR/matrix/keys/server.key"
    
    # Generate Ed25519 key for Matrix
    openssl genpkey -algorithm Ed25519 -out "$private_key_file"
    
    # Generate server signing key
    openssl genpkey -algorithm Ed25519 -out "$server_key_file"
    
    # Set proper permissions
    chmod 600 "$private_key_file" "$server_key_file"
    
    # Extract key values
    local private_key=$(base64 -w 0 "$private_key_file")
    local server_key=$(base64 -w 0 "$server_key_file")
    
    # Update environment file safely
    add_env_var "MATRIX_PRIVATE_KEY" "$private_key"
    add_env_var "MATRIX_SERVER_KEY" "$server_key"
    
    print_success "Matrix keys generated and configured"
}

# Function to generate PeerTube keys
generate_peertube_keys() {
    print_status "Generating PeerTube RSA 4096 key pair..."
    
    local private_key_file="$FEDERATION_DIR/peertube/keys/private.pem"
    local public_key_file="$FEDERATION_DIR/peertube/keys/public.pem"
    
    # Generate 4096-bit RSA key pair
    openssl genrsa -out "$private_key_file" 4096
    openssl rsa -in "$private_key_file" -pubout -out "$public_key_file"
    
    # Set proper permissions
    chmod 600 "$private_key_file"
    chmod 644 "$public_key_file"
    
    # Extract key values
    local private_key=$(cat "$private_key_file")
    local public_key=$(cat "$public_key_file")
    
    # Update environment file safely
    add_env_var "PEERTUBE_PRIVATE_KEY" "'$private_key'"
    add_env_var "PEERTUBE_PUBLIC_KEY" "'$public_key'"
    
    print_success "PeerTube keys generated and configured"
}

# Function to generate Jitsi keys
generate_jitsi_keys() {
    print_status "Generating Jitsi ECDSA 256 key pair..."
    
    local private_key_file="$FEDERATION_DIR/jitsi/keys/private.pem"
    local public_key_file="$FEDERATION_DIR/jitsi/keys/public.pem"
    
    # Generate ECDSA P-256 key pair
    openssl ecparam -name prime256v1 -genkey -noout -out "$private_key_file"
    openssl ec -in "$private_key_file" -pubout -out "$public_key_file"
    
    # Set proper permissions
    chmod 600 "$private_key_file"
    chmod 644 "$public_key_file"
    
    # Extract key values
    local private_key=$(cat "$private_key_file")
    local public_key=$(cat "$public_key_file")
    
    # Update environment file safely
    add_env_var "JITSI_PRIVATE_KEY" "'$private_key'"
    add_env_var "JITSI_PUBLIC_KEY" "'$public_key'"
    
    print_success "Jitsi keys generated and configured"
}

# Function to create federation keys manifest
create_federation_manifest() {
    print_status "Creating federation keys manifest..."
    
    local manifest_file="$FEDERATION_DIR/federation_keys_manifest.json"
    
    # Get current domain from environment or use default
    local domain=${FEDERATION_DOMAIN:-"elkzone.example.com"}
    
    cat > "$manifest_file" << EOF
{
  "manifest_version": "1.0",
  "generated_at": "$(date -Iseconds)",
  "domain": "$domain",
  "federation_services": {
    "akkoma": {
      "service": "ActivityPub",
      "key_type": "RSA 4096",
      "key_files": {
        "private": "federation/akkoma/keys/private.pem",
        "public": "federation/akkoma/keys/public.pem"
      },
      "endpoints": {
        "webfinger": "https://$domain/.well-known/webfinger",
        "host_meta": "https://$domain/.well-known/host-meta",
        "nodeinfo": "https://$domain/nodeinfo/2.0"
      },
      "fingerprint": "$(openssl rsa -in "$FEDERATION_DIR/akkoma/keys/public.pem" -pubin -pubout -outform DER | sha256sum | cut -d' ' -f1)"
    },
    "matrix": {
      "service": "Matrix Homeserver",
      "key_type": "Ed25519",
      "key_files": {
        "private": "federation/matrix/keys/ed25519.key",
        "server": "federation/matrix/keys/server.key"
      },
      "endpoints": {
        "server": "https://matrix.$domain",
        "well_known": "https://$domain/.well-known/matrix/server",
        "client": "https://$domain/.well-known/matrix/client"
      },
      "fingerprint": "$(openssl pkey -in "$FEDERATION_DIR/matrix/keys/ed25519.key" -outform DER | sha256sum | cut -d' ' -f1)"
    },
    "peertube": {
      "service": "PeerTube Video Federation",
      "key_type": "RSA 4096",
      "key_files": {
        "private": "federation/peertube/keys/private.pem",
        "public": "federation/peertube/keys/public.pem"
      },
      "endpoints": {
        "webfinger": "https://videos.$domain/.well-known/webfinger",
        "nodeinfo": "https://videos.$domain/nodeinfo/2.0",
        "activitypub": "https://videos.$domain/accounts/peertube"
      },
      "fingerprint": "$(openssl rsa -in "$FEDERATION_DIR/peertube/keys/public.pem" -pubin -pubout -outform DER | sha256sum | cut -d' ' -f1)"
    },
    "jitsi": {
      "service": "Jitsi Video Conferencing",
      "key_type": "ECDSA 256",
      "key_files": {
        "private": "federation/jitsi/keys/private.pem",
        "public": "federation/jitsi/keys/public.pem"
      },
      "endpoints": {
        "meet": "https://meet.$domain",
        "config": "https://$domain/.well-known/jitsi-config.json",
        "turn": "turn:meet.$domain:443"
      },
      "fingerprint": "$(openssl ec -in "$FEDERATION_DIR/jitsi/keys/private.pem" -outform DER | sha256sum | cut -d' ' -f1)"
    }
  },
  "security_notes": [
    "All private keys are stored with 600 permissions",
    "Public keys are stored with 644 permissions",
    "Keys should be rotated every 90 days",
    "Backup keys securely in offline storage",
    "Never commit private keys to version control"
  ],
  "next_steps": [
    "Configure well-known files for federation discovery",
    "Test federation handshakes with remote instances",
    "Update DNS records for federation subdomains",
    "Configure firewalls for federation ports",
    "Monitor federation traffic and health"
  ]
}
EOF
    
    print_success "Federation manifest created: $manifest_file"
}

# Function to display summary
display_summary() {
    echo ""
    echo -e "${GREEN}🎉 Federation Keys Generation Summary${NC}"
    echo ""
    echo "📁 Generated Files:"
    echo "  • Akkoma keys: federation/akkoma/keys/"
    echo "  • Matrix keys: federation/matrix/keys/"
    echo "  • PeerTube keys: federation/peertube/keys/"
    echo "  • Jitsi keys: federation/jitsi/keys/"
    echo "  • Manifest: federation/federation_keys_manifest.json"
    echo ""
    echo "🔑 Keys Generated:"
    echo "  • Akkoma: RSA 4096-bit (ActivityPub)"
    echo "  • Matrix: Ed25519 (Homeserver)"
    echo "  • PeerTube: RSA 4096-bit (Video Federation)"
    echo "  • Jitsi: ECDSA 256-bit (Video Signing)"
    echo ""
    echo "📝 Environment Variables Updated:"
    echo "  • AKKOMA_PRIVATE_KEY / AKKOMA_PUBLIC_KEY"
    echo "  • MATRIX_PRIVATE_KEY / MATRIX_SERVER_KEY"
    echo "  • PEERTUBE_PRIVATE_KEY / PEERTUBE_PUBLIC_KEY"
    echo "  • JITSI_PRIVATE_KEY / JITSI_PUBLIC_KEY"
    echo ""
    echo "🔒 Security Status:"
    echo "  • Private keys: 600 permissions"
    echo "  • Public keys: 644 permissions"
    echo "  • Environment file: Updated with secure keys"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. ./scripts/federation/create-well-known-files.sh"
    echo "  2. ./scripts/federation/test-federation.sh"
    echo "  3. Configure DNS records for federation subdomains"
    echo "  4. Test with remote federation instances"
    echo ""
}

# Main execution
main() {
    print_status "Starting federation keys generation..."
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file not found: $ENV_FILE"
        print_status "Please run ./scripts/security/generate-secrets-simple.sh first"
        exit 1
    fi
    
    # Create directory structure
    create_federation_structure
    
    # Generate keys for each service
    generate_akkoma_keys
    generate_matrix_keys
    generate_peertube_keys
    generate_jitsi_keys
    
    # Create manifest
    create_federation_manifest
    
    # Display summary
    display_summary
    
    print_success "Federation keys generation completed successfully!"
}

# Run main function
main "$@"