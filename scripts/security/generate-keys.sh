#!/bin/bash

# ELK.Zone 2.0 - Key Generation Script
# Generates all required keys and secrets for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔑 ELK.Zone 2.0 - Key Generation Script${NC}"

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

# Function to generate JWT secret
generate_jwt_secret() {
    print_status "Generating JWT secret..."
    local jwt_secret=$(generate_secure_string 64)
    echo "JWT_SECRET=$jwt_secret"
    echo ""
}

# Function to generate database password
generate_db_password() {
    print_status "Generating database password..."
    local db_password=$(generate_secure_string 32)
    echo "POSTGRES_PASSWORD=$db_password"
    echo "DATABASE_URL=postgresql://elk:$db_password@postgres:5432/elkzone"
    echo ""
}

# Function to generate Redis password
generate_redis_password() {
    print_status "Generating Redis password..."
    local redis_password=$(generate_secure_string 32)
    echo "REDIS_PASSWORD=$redis_password"
    echo "REDIS_URL=redis://redis:6379"
    echo ""
}

# Function to generate ActivityPub key pair
generate_activitypub_keys() {
    print_status "Generating ActivityPub key pair..."
    
    # Create temporary directory for keys
    local temp_dir=$(mktemp -d)
    local private_key_file="$temp_dir/private.pem"
    local public_key_file="$temp_dir/public.pem"
    
    # Generate 4096-bit RSA key pair
    openssl genrsa -out "$private_key_file" 4096
    openssl rsa -in "$private_key_file" -pubout -out "$public_key_file"
    
    # Format for environment file
    echo "ACTIVITYPUB_PRIVATE_KEY='$(cat "$private_key_file")'"
    echo "ACTIVITYPUB_PUBLIC_KEY='$(cat "$public_key_file")'"
    echo ""
    
    # Generate base64 encoded versions for Kubernetes
    echo "# Base64 encoded for Kubernetes secrets:"
    echo "ACTIVITYPUB_PRIVATE_KEY_BASE64=$(cat "$private_key_file" | base64 -w 0)"
    echo "ACTIVITYPUB_PUBLIC_KEY_BASE64=$(cat "$public_key_file" | base64 -w 0)"
    echo ""
    
    # Cleanup
    rm -rf "$temp_dir"
}

# Function to generate Grafana password
generate_grafana_password() {
    print_status "Generating Grafana password..."
    local grafana_password=$(generate_secure_string 24)
    echo "GRAFANA_PASSWORD=$grafana_password"
    echo ""
}

# Function to generate all secrets and create .env file
generate_env_file() {
    print_status "Generating complete .env.prod file..."
    
<<<<<<< HEAD
    local env_file="/opt/elkzone/.env.prod.generated"
=======
    local env_file="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/.env.prod.generated"
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
    
    cat > "$env_file" << EOF
# ===========================================
# ELK.Zone 2.0 - Production Environment
# Generated on: $(date)
# ===========================================

# Database Configuration
POSTGRES_DB=elkzone
POSTGRES_USER=elk
POSTGRES_PASSWORD=$(generate_secure_string 32)
DATABASE_URL=postgresql://elk:$(generate_secure_string 32)@postgres:5432/elkzone

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=$(generate_secure_string 32)

# Application Configuration
JWT_SECRET=$(generate_secure_string 64)
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://elk.zone/api
NEXT_PUBLIC_WS_URL=wss://elk.zone
NEXT_PUBLIC_APP_URL=https://elk.zone

# Federation Services
MATRIX_URL=https://matrix.elk.zone
PEERTUBE_URL=https://videos.elk.zone
JITSI_URL=https://meet.elk.zone

# ActivityPub Configuration
ACTIVITYPUB_DOMAIN=elk.zone
ACTIVITYPUB_PRIVATE_KEY='$(openssl genrsa 4096)'
ACTIVITYPUB_PUBLIC_KEY='$(openssl genrsa 4096 | openssl rsa -pubout)'

# Monitoring
GRAFANA_PASSWORD=$(generate_secure_string 24)

# SSL Configuration
LETSENCRYPT_EMAIL=admin@elk.zone

# Cloudflare (optional)
# CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# AWS (optional)
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_DEFAULT_REGION=us-west-2
# AWS_S3_BUCKET=elkzone-backups
EOF
    
    print_success "Environment file generated: $env_file"
    print_warning "Please review and customize the file before use"
}

# Function to generate Kubernetes secrets file
generate_k8s_secrets() {
    print_status "Generating Kubernetes secrets file..."
    
<<<<<<< HEAD
    local secrets_file="/opt/elkzone/k8s/secrets.generated.yaml"
=======
    local secrets_file="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/k8s/secrets.generated.yaml"
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
    
    # Generate all secrets
    local db_password=$(generate_secure_string 32)
    local redis_password=$(generate_secure_string 32)
    local jwt_secret=$(generate_secure_string 64)
    local grafana_password=$(generate_secure_string 24)
    
    # Generate ActivityPub keys
    local temp_dir=$(mktemp -d)
    local private_key_file="$temp_dir/private.pem"
    local public_key_file="$temp_dir/public.pem"
    
    openssl genrsa -out "$private_key_file" 4096
    openssl rsa -in "$private_key_file" -pubout -out "$public_key_file"
    
    # Create secrets file
    cat > "$secrets_file" << EOF
# ===========================================
# ELK.Zone 2.0 - Kubernetes Secrets
# Generated on: $(date)
# ===========================================

apiVersion: v1
kind: Secret
metadata:
  name: elkzone-secrets
  namespace: elkzone-prod
type: Opaque
data:
  # Database Configuration
  DATABASE_URL: $(echo -n "postgresql://elk:$db_password@postgres:5432/elkzone" | base64 -w 0)
  POSTGRES_PASSWORD: $(echo -n "$db_password" | base64 -w 0)
  
  # Redis Configuration
  REDIS_URL: $(echo -n "redis://redis:6379" | base64 -w 0)
  REDIS_PASSWORD: $(echo -n "$redis_password" | base64 -w 0)
  
  # Application Configuration
  JWT_SECRET: $(echo -n "$jwt_secret" | base64 -w 0)
  
  # ActivityPub Configuration
  ACTIVITYPUB_PRIVATE_KEY: $(cat "$private_key_file" | base64 -w 0)
  ACTIVITYPUB_PUBLIC_KEY: $(cat "$public_key_file" | base64 -w 0)
  
  # Monitoring
  GRAFANA_PASSWORD: $(echo -n "$grafana_password" | base64 -w 0)

---
apiVersion: v1
kind: Secret
metadata:
  name: elkzone-secrets
  namespace: elkzone-staging
type: Opaque
data:
  # Database Configuration (staging)
  DATABASE_URL: $(echo -n "postgresql://elk:$(generate_secure_string 32)@postgres:5432/elkzone_staging" | base64 -w 0)
  POSTGRES_PASSWORD: $(echo -n "$(generate_secure_string 32)" | base64 -w 0)
  
  # Redis Configuration (staging)
  REDIS_URL: $(echo -n "redis://redis:6379" | base64 -w 0)
  REDIS_PASSWORD: $(echo -n "$(generate_secure_string 32)" | base64 -w 0)
  
  # Application Configuration (staging)
  JWT_SECRET: $(echo -n "$(generate_secure_string 64)" | base64 -w 0)
  
  # ActivityPub Configuration (staging)
  ACTIVITYPUB_PRIVATE_KEY: $(openssl genrsa 4096 | base64 -w 0)
  ACTIVITYPUB_PUBLIC_KEY: $(openssl genrsa 4096 | openssl rsa -pubout | base64 -w 0)
  
  # Monitoring (staging)
  GRAFANA_PASSWORD: $(echo -n "$(generate_secure_string 24)" | base64 -w 0)
EOF
    
    # Cleanup
    rm -rf "$temp_dir"
    
    print_success "Kubernetes secrets file generated: $secrets_file"
    print_warning "Please review and customize the file before use"
}

# Function to display key generation summary
display_summary() {
    echo ""
    echo -e "${GREEN}🎉 Key Generation Summary${NC}"
    echo ""
    echo "📋 Generated Files:"
    echo "  • Environment file: /opt/elkzone/.env.prod.generated"
    echo "  • Kubernetes secrets: /opt/elkzone/k8s/secrets.generated.yaml"
    echo ""
    echo "🔑 Keys Generated:"
    echo "  • JWT Secret (64 characters)"
    echo "  • Database Password (32 characters)"
    echo "  • Redis Password (32 characters)"
    echo "  • ActivityPub Key Pair (4096-bit RSA)"
    echo "  • Grafana Password (24 characters)"
    echo ""
    echo "📝 Next Steps:"
    echo "  1. Review generated files"
    echo "  2. Customize values as needed"
    echo "  3. Copy .env.prod.generated to .env.prod"
    echo "  4. Apply Kubernetes secrets: kubectl apply -f k8s/secrets.generated.yaml"
    echo "  5. Update any external service configurations"
    echo ""
    echo "🔒 Security Notes:"
    echo "  • Store these files securely"
    echo "  • Never commit secrets to version control"
    echo "  • Rotate keys regularly (every 90 days)"
    echo "  • Use different keys for production and staging"
    echo ""
}

# Main execution
echo "Choose what to generate:"
echo "1) JWT Secret only"
echo "2) Database Password only"
echo "3) Redis Password only"
echo "4) ActivityPub Key Pair only"
echo "5) Grafana Password only"
echo "6) All secrets (environment file)"
echo "7) All secrets (Kubernetes)"
echo "8) All secrets (both formats)"
echo ""
read -p "Enter your choice (1-8): " choice

case $choice in
    1)
        generate_jwt_secret
        ;;
    2)
        generate_db_password
        ;;
    3)
        generate_redis_password
        ;;
    4)
        generate_activitypub_keys
        ;;
    5)
        generate_grafana_password
        ;;
    6)
        generate_env_file
        ;;
    7)
        generate_k8s_secrets
        ;;
    8)
        generate_env_file
        generate_k8s_secrets
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

if [ "$choice" -ge 6 ]; then
    display_summary
fi