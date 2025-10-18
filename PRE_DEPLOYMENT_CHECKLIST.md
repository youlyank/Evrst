# ELK.Zone 2.0 - Pre-Deployment Checklist

## 🔑 CRITICAL: Replace All Placeholders Before Deployment

This checklist ensures all placeholder values are replaced with actual secrets before going live.

---

## 🚨 STOP - Do Not Deploy Until Complete

### ✅ Section 1: Environment Variables (.env.prod)

**File**: `/opt/elkzone/.env.prod`

**Status**: ❌ MUST BE COMPLETED

**Required Actions**:
- [ ] Copy `.env.prod.example` to `.env.prod`
- [ ] Replace `YOUR_DB_PASSWORD` with actual database password
- [ ] Replace `YOUR_SECURE_REDIS_PASSWORD` with actual Redis password  
- [ ] Replace `YOUR_SUPER_SECRET_JWT_KEY_AT_LEAST_32_CHARACTERS_LONG` with actual JWT secret
- [ ] Replace `YOUR_ACTUAL_4096_BIT_PRIVATE_KEY_HERE` with generated private key
- [ ] Replace `YOUR_ACTUAL_PUBLIC_KEY_HERE` with generated public key
- [ ] Replace `YOUR_SECURE_GRAFANA_PASSWORD` with actual Grafana password
- [ ] Replace `admin@elk.zone` with actual email for SSL
- [ ] Add Cloudflare API token if using CDN
- [ ] Add AWS credentials if using AWS services

**Generate with**: `./scripts/security/generate-keys.sh`

---

### ✅ Section 2: Kubernetes Secrets

**File**: `k8s/secrets.yaml`

**Status**: ❌ MUST BE COMPLETED

**Required Actions**:
- [ ] Replace `<BASE64_ENCODED_DATABASE_URL>` with actual base64-encoded database URL
- [ ] Replace `<BASE64_ENCODED_REDIS_URL>` with actual base64-encoded Redis URL
- [ ] Replace `<BASE64_ENCODED_JWT_SECRET_32_PLUS_CHARS>` with actual base64-encoded JWT secret
- [ ] Replace `<BASE64_ENCODED_ACTIVITYPUB_PRIVATE_KEY>` with actual base64-encoded private key
- [ ] Replace `<BASE64_ENCODED_ACTIVITYPUB_PUBLIC_KEY>` with actual base64-encoded public key
- [ ] Replace `<BASE64_ENCODED_GRAFANA_PASSWORD>` with actual base64-encoded Grafana password
- [ ] Repeat all replacements for staging section

**Generate with**: `./scripts/security/generate-keys.sh` (option 7 or 8)

---

### ✅ Section 3: API Route Fallbacks

**Files**: All API routes in `src/app/api/*/route.ts`

**Status**: ❌ MUST BE COMPLETED

**Required Actions**:
- [ ] Search for `REPLACE_WITH_ACTUAL_JWT_SECRET_BEFORE_DEPLOYMENT` in all API files
- [ ] Replace with actual JWT secret or remove fallback entirely
- [ ] Test that API routes fail gracefully without JWT secret

**Check with**: `grep -r "REPLACE_WITH_ACTUAL_JWT_SECRET" src/app/api/`

---

### ✅ Section 4: External Service Configuration

**Cloudflare** (if using):
- [ ] Set `CLOUDFLARE_API_TOKEN` environment variable
- [ ] Verify domain is added to Cloudflare account
- [ ] Test API access: `cloudflare zone list`

**AWS** (if using):
- [ ] Set `AWS_ACCESS_KEY_ID` environment variable
- [ ] Set `AWS_SECRET_ACCESS_KEY` environment variable
- [ ] Set `AWS_DEFAULT_REGION` environment variable
- [ ] Create S3 bucket for backups
- [ ] Test AWS access: `aws s3 ls`

**GitHub Actions** (if using):
- [ ] Add `GHCR_TOKEN` to repository secrets
- [ ] Add `KUBE_CONFIG_PRODUCTION` to repository secrets
- [ ] Add all other required secrets to repository

---

### ✅ Section 5: Domain and SSL

**Required Actions**:
- [ ] Point DNS A record to server IP
- [ ] Verify domain resolves: `nslookup elk.zone`
- [ ] Obtain SSL certificate: `certbot --nginx -d elk.zone`
- [ ] Test SSL: `curl -I https://elk.zone`
- [ ] Setup auto-renewal: `certbot renew --dry-run`

---

### ✅ Section 6: Database and Redis

**Required Actions**:
- [ ] Create PostgreSQL database with specified credentials
- [ ] Test database connection: `docker compose exec postgres pg_isready`
- [ ] Configure Redis with password
- [ ] Test Redis connection: `docker compose exec redis redis-cli`

---

### ✅ Section 7: Federation Services

**ActivityPub**:
- [ ] Generate 4096-bit RSA key pair
- [ ] Configure domain: `akkoma.elk.zone`
- [ ] Test federation endpoints

**Matrix**:
- [ ] Configure domain: `matrix.elk.zone`
- [ ] Generate Matrix signing keys
- [ ] Test federation

**PeerTube**:
- [ ] Configure domain: `videos.elk.zone`
- [ ] Generate PeerTube keys
- [ ] Test video upload

**Jitsi**:
- [ ] Configure domain: `meet.elk.zone`
- [ ] Generate Jitsi certificates
- [ ] Test video conference

---

## 🔍 Validation Commands

Run these commands to validate your configuration:

```bash
# Validate secrets
./scripts/security/validate-secrets.sh production

# Test Docker Compose configuration
docker compose -f docker-compose.prod.yml config

# Test Kubernetes configuration
kubectl apply --dry-run=client -f k8s/

# Test SSL certificate
curl -I https://elk.zone

# Test API endpoints
curl https://elk.zone/api/health
curl https://elk.zone/api/metrics

# Run smoke tests
./scripts/testing/smoke-test.sh
```

---

## 🚀 Final Deployment Steps

Only proceed after ALL items above are completed:

1. **Backup current configuration**
2. **Run smoke tests**: `./scripts/testing/smoke-test.sh`
3. **Run load tests**: `./scripts/testing/load-test.sh`
4. **Verify monitoring**: `./scripts/monitoring/verify-monitoring.sh`
5. **Setup CDN**: `./scripts/cdn/setup-cdn-ssl.sh`
6. **Deploy**: `./scripts/quick-deploy.sh` or `./scripts/k8s-deploy.sh`
7. **Post-deployment verification**

---

## 📞 Emergency Contacts

If you encounter issues during deployment:

- **Security Issues**: security@elk.zone
- **Technical Support**: support@elk.zone
- **Documentation**: Check `PLACEHOLDER_KEYS_GUIDE.md`

---

## ⚠️ Critical Warning

**NEVER commit actual secrets to version control**
**ALWAYS use strong, unique passwords**
**ALWAYS rotate keys regularly**
**ALWAYS limit access to secrets**

---

## ✅ Deployment Confirmation

I confirm that:
- [ ] All placeholder values have been replaced
- [ ] All secrets are properly generated
- [ ] All external services are configured
- [ ] All validation tests pass
- [ ] Security best practices are followed

**Signature**: _________________________
**Date**: _________________________
**Role**: _________________________