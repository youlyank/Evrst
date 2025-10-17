# ELK.Zone 2.0 - Placeholder Keys Configuration Guide

This document lists all the places where you need to add your actual keys and secrets before deployment.

## 🔑 Required Keys and Secrets

### 1. Environment Variables (.env.prod)

**File**: `/opt/elkzone/.env.prod`

```bash
# Database Configuration
DATABASE_URL=postgresql://elk:YOUR_DB_PASSWORD@postgres:5432/elkzone
POSTGRES_PASSWORD=YOUR_SECURE_DB_PASSWORD

# Redis Configuration  
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=YOUR_SECURE_REDIS_PASSWORD

# Application Configuration
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_AT_LEAST_32_CHARACTERS_LONG

# Federation Services
MATRIX_URL=https://matrix.elk.zone
PEERTUBE_URL=https://videos.elk.zone
JITSI_URL=https://meet.elk.zone

# ActivityPub Configuration
ACTIVITYPUB_DOMAIN=elk.zone
ACTIVITYPUB_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
YOUR_ACTUAL_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----
ACTIVITYPUB_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
YOUR_ACTUAL_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----

# Monitoring
GRAFANA_PASSWORD=YOUR_SECURE_GRAFANA_PASSWORD

# SSL Configuration
LETSENCRYPT_EMAIL=admin@elk.zone
```

### 2. Kubernetes Secrets

**File**: `k8s/secrets.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: elkzone-secrets
  namespace: elkzone-prod
type: Opaque
data:
  # Base64 encoded values - replace with your actual encoded secrets
  DATABASE_URL: <BASE64_ENCODED_DATABASE_URL>
  REDIS_URL: <BASE64_ENCODED_REDIS_URL>
  JWT_SECRET: <BASE64_ENCODED_JWT_SECRET>
  ACTIVITYPUB_PRIVATE_KEY: <BASE64_ENCODED_ACTIVITYPUB_PRIVATE_KEY>
  ACTIVITYPUB_PUBLIC_KEY: <BASE64_ENCODED_ACTIVITYPUB_PUBLIC_KEY>
  GRAFANA_PASSWORD: <BASE64_ENCODED_GRAFANA_PASSWORD>
```

### 3. Cloudflare Configuration

**Environment Variables**:
```bash
CLOUDFLARE_API_TOKEN=YOUR_CLOUDFLARE_API_TOKEN
# OR
CLOUDFLARE_EMAIL=your-email@example.com
CLOUDFLARE_API_KEY=YOUR_CLOUDFLARE_API_KEY
```

### 4. AWS Configuration (if using AWS)

**Environment Variables**:
```bash
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_DEFAULT_REGION=us-west-2
```

### 5. GitHub Actions Secrets

**Repository Settings → Secrets and variables → Actions**:
```
GHCR_TOKEN=YOUR_GITHUB_CONTAINER_REGISTRY_TOKEN
KUBE_CONFIG_PRODUCTION=YOUR_BASE64_ENCODED_KUBECONFIG
DATABASE_URL=YOUR_DATABASE_URL
JWT_SECRET=YOUR_JWT_SECRET
REDIS_URL=YOUR_REDIS_URL
```

### 6. Monitoring Configuration

**AlertManager Configuration** (`/opt/elkzone/alertmanager/alertmanager.yml`):
```yaml
global:
  smtp_smarthost: 'your-smtp-server:587'
  smtp_from: 'alerts@elk.zone'
  smtp_auth_username: 'your-smtp-username'
  smtp_auth_password: 'your-smtp-password'
```

## 🔧 How to Generate Required Keys

### 1. JWT Secret
```bash
openssl rand -base64 64
```

### 2. ActivityPub Key Pair
```bash
# Generate private key
openssl genrsa -out activitypub_private.pem 4096

# Extract public key
openssl rsa -in activitypub_private.pem -pubout -out activitypub_public.pem

# Format for .env file
ACTIVITYPUB_PRIVATE_KEY=$(cat activitypub_private.pem)
ACTIVITYPUB_PUBLIC_KEY=$(cat activitypub_public.pem)
```

### 3. Database Password
```bash
openssl rand -base64 32
```

### 4. Redis Password
```bash
openssl rand -base64 32
```

### 5. Base64 Encoding for Kubernetes
```bash
echo -n "your-secret-value" | base64
```

## 🚨 Important Security Notes

1. **Never commit actual secrets to version control**
2. **Use strong, unique passwords for each service**
3. **Rotate keys regularly (every 90 days recommended)**
4. **Store secrets securely (AWS Secrets Manager, HashiCorp Vault, etc.)**
5. **Limit access to secrets to only necessary personnel**

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Replaced all placeholder values with actual secrets
- [ ] Generated strong ActivityPub key pair
- [ ] Configured Cloudflare API access
- [ ] Set up AWS credentials (if using AWS)
- [ ] Configured GitHub Actions secrets
- [ ] Set up SMTP for alerts
- [ ] Tested all key configurations
- [ ] Validated SSL certificates

## 🔍 Validation Script

Run the secrets validation script to check your configuration:

```bash
./scripts/security/validate-secrets.sh production
```

This will validate that all required secrets are properly configured and not using default/test values.