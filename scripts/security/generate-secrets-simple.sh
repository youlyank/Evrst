#!/bin/bash

# ELK.Zone 2.0 - Simple Secret Generation Script
# Non-interactive generation of all required secrets

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo -e "${GREEN}🔑 ELK.Zone 2.0 - Secret Generation${NC}"
echo -e "${BLUE}Project Directory: ${PROJECT_DIR}${NC}"

# Function to generate secure random string
generate_secure_string() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

echo "Generating production secrets..."

# Generate all secrets
JWT_SECRET=$(generate_secure_string 64)
SESSION_SECRET=$(generate_secure_string 64)
ENCRYPTION_KEY=$(generate_secure_string 32)
REDIS_PASSWORD=$(generate_secure_string 32)
GRAFANA_ADMIN_PASSWORD=$(generate_secure_string 24)

# Generate ActivityPub key pair
TEMP_DIR=$(mktemp -d)
PRIVATE_KEY_FILE="$TEMP_DIR/private.pem"
PUBLIC_KEY_FILE="$TEMP_DIR/public.pem"

openssl genrsa -out "$PRIVATE_KEY_FILE" 4096
openssl rsa -in "$PRIVATE_KEY_FILE" -pubout -out "$PUBLIC_KEY_FILE"

ACTIVITYPUB_PRIVATE_KEY=$(cat "$PRIVATE_KEY_FILE")
ACTIVITYPUB_PUBLIC_KEY=$(cat "$PUBLIC_KEY_FILE")

# Cleanup
rm -rf "$TEMP_DIR"

# Create .env.prod file
cat > "$PROJECT_DIR/.env.prod" << EOF
# ELK.Zone 2.0 - Production Environment Configuration
# Generated on: $(date)

# Application Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Application URLs
NEXT_PUBLIC_APP_URL=https://elkzone.example.com
NEXT_PUBLIC_API_URL=https://api.elkzone.example.com

# Security & Authentication
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
SESSION_SECRET=$SESSION_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Database Configuration
DATABASE_URL="file:./db/elkzone.db"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_SESSION_TTL=86400

# Federation & ActivityPub
ACTIVITYPUB_PRIVATE_KEY='$ACTIVITYPUB_PRIVATE_KEY'
ACTIVITYPUB_PUBLIC_KEY='$ACTIVITYPUB_PUBLIC_KEY'
FEDERATION_DOMAIN=elkzone.example.com

# Matrix Configuration
MATRIX_HOMESERVER=https://matrix.elkzone.example.com
MATRIX_ACCESS_TOKEN=YOUR_MATRIX_ACCESS_TOKEN
MATRIX_ADMIN_TOKEN=YOUR_MATRIX_ADMIN_TOKEN

# Monitoring & Observability
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Feature Flags
FEATURE_FEDERATION=true
FEATURE_MATRIX=true
FEATURE_LIVE_STREAMING=true

# Security Headers
CSP_ENABLED=true
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_STORAGE_PATH=/backups

# Performance Configuration
CACHE_TTL=3600
CACHE_MAX_SIZE=100
MAX_CONCURRENT_USERS=1000
MAX_REQUEST_SIZE=10485760

# Compliance & Privacy
GDPR_ENABLED=true
DATA_RETENTION_DAYS=365
PRIVACY_POLICY_URL=https://elkzone.example.com/privacy
TERMS_OF_SERVICE_URL=https://elkzone.example.com/terms
EOF

# Set secure permissions
chmod 600 "$PROJECT_DIR/.env.prod"

echo -e "${GREEN}✅ Production secrets generated successfully!${NC}"
echo "📁 File created: $PROJECT_DIR/.env.prod"
echo "🔒 Permissions set to 600"
echo ""
echo "🔑 Generated Secrets:"
echo "  • JWT Secret: 64 characters"
echo "  • Session Secret: 64 characters"
echo "  • Encryption Key: 32 characters"
echo "  • Redis Password: 32 characters"
echo "  • Grafana Password: 24 characters"
echo "  • ActivityPub Key Pair: 4096-bit RSA"
echo ""
echo "⚠️  Important Notes:"
echo "  • Store this file securely"
echo "  • Never commit to version control"
echo "  • Replace remaining YOUR_* placeholders as needed"
echo "  • Update example.com with your actual domain"