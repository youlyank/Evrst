# ELK.Zone 2.0 - Deployment Guide

This guide provides complete deployment instructions for ELK.Zone 2.0, offering two production-ready deployment paths.

## 🚀 Quick Start

Choose your deployment path:

1. **Quick Production** - Single VM with Docker Compose (recommended for small teams, MVP, staging)
2. **Cloud Scale** - Kubernetes with auto-scaling (recommended for production growth)

---

## 📋 Prerequisites

### System Requirements

**Quick Production (Docker Compose):**
- CPU: 2+ cores
- RAM: 4GB+ (8GB+ recommended)
- Storage: 50GB+ SSD
- OS: Ubuntu 20.04+ or CentOS 8+
- Network: Public IP with ports 80, 443 open

**Cloud Scale (Kubernetes):**
- Managed Kubernetes cluster (EKS, GKE, AKS)
- Node pools: 3+ nodes (2 vCPU, 4GB RAM each)
- Storage: 100GB+ persistent storage
- Load balancer with public IP
- Container registry (GHCR, ECR, GCR)

### Domain & SSL

- Domain name (e.g., `elk.zone`)
- DNS A record pointing to your server/LoadBalancer
- SSL certificate (Let's Encrypt recommended)

### Required Tools

```bash
# For both deployments
git
docker
docker-compose (for Quick Production)
kubectl (for Cloud Scale)
aws-cli (if using AWS)
```

---

## 🏗️ Deployment Path 1: Quick Production (Docker Compose)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose

# Install additional tools
sudo apt install -y certbot python3-certbot-nginx git
```

### Step 2: Clone Repository

```bash
git clone https://github.com/your-org/elkzone-2.0.git
cd elkzone-2.0
```

<<<<<<< HEAD
### Step 3: Configure Environment

```bash
# Copy environment template
=======
### Step 3: Secrets Generation & Validation

**🔐 IMPORTANT: Security First - Generate Fresh Secrets**

ELK.Zone 2.0 includes automated security tools to ensure production-ready secrets:

```bash
# 1. Generate all production secrets
./scripts/security/generate-secrets-simple.sh

# 2. Validate the generated secrets
./scripts/security/validate-secrets.sh production

# 3. Review the generated .env.prod file
ls -la .env.prod  # Should show 600 permissions
```

**What gets generated:**
- JWT Secret (64 characters) - For authentication tokens
- Session Secret (64 characters) - For session management  
- Encryption Key (32 characters) - For sensitive data encryption
- Redis Password (32 characters) - For Redis authentication
- ActivityPub Key Pair (4096-bit RSA) - For federation security
- Grafana Password (24 characters) - For monitoring access

**Manual Configuration (if needed):**
```bash
# Or copy template and configure manually
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
cp .env.prod.example .env.prod

# Edit with your values
nano .env.prod
```

**Required `.env.prod` values:**
```bash
<<<<<<< HEAD
DATABASE_URL=postgresql://elk:your_secure_password@postgres:5432/elkzone
REDIS_URL=redis://redis:6379
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
POSTGRES_PASSWORD=your_secure_pg_password
REDIS_PASSWORD=your_secure_redis_password
NEXT_PUBLIC_API_URL=https://elk.zone/api
NEXT_PUBLIC_APP_URL=https://elk.zone
=======
# Security (auto-generated)
JWT_SECRET=your_super_secret_jwt_key_64_characters
SESSION_SECRET=your_super_secret_session_key_64_characters
ENCRYPTION_KEY=your_encryption_key_32_characters

# Database
DATABASE_URL="file:./db/elkzone.db"  # SQLite for production

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your_secure_redis_password

# Federation
ACTIVITYPUB_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----...'
ACTIVITYPUB_PUBLIC_KEY='-----BEGIN PUBLIC KEY-----...'
FEDERATION_DOMAIN=elkzone.example.com

# Application URLs
NEXT_PUBLIC_API_URL=https://api.elkzone.example.com
NEXT_PUBLIC_APP_URL=https://elkzone.example.com

# Monitoring
GRAFANA_ADMIN_PASSWORD=your_grafana_password
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
```

### Step 4: Deploy Application

```bash
# Make deploy script executable
chmod +x scripts/quick-deploy.sh

# Run deployment
./scripts/quick-deploy.sh
```

### Step 5: SSL Certificate

```bash
# Obtain Let's Encrypt certificate
sudo certbot --nginx -d elk.zone -d www.elk.zone

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet && docker compose -f /opt/elkzone/docker-compose.prod.yml restart nginx
```

### Step 6: Verify Deployment

```bash
# Check services
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Health check
curl https://elk.zone/api/health
```

---

## ☁️ Deployment Path 2: Cloud Scale (Kubernetes)

### Step 1: Prepare Kubernetes Cluster

```bash
# Create cluster (example for EKS)
aws eks create-cluster \
  --name elkzone-prod \
  --region us-west-2 \
  --kubernetes-version 1.28 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed

# Update kubeconfig
aws eks update-kubeconfig --region us-west-2 --name elkzone-prod
```

### Step 2: Install Required Components

```bash
# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Install cert-manager
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# Install Prometheus Stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

<<<<<<< HEAD
### Step 3: Configure Secrets
=======
### Step 3: Secrets Generation & Configuration

**🔐 Generate Production Secrets**

```bash
# 1. Generate all production secrets
./scripts/security/generate-keys.sh

# Choose option 8 for "All secrets (both formats)"

# 2. This creates:
# - .env.prod.generated (for Docker Compose)
# - k8s/secrets.generated.yaml (for Kubernetes)

# 3. Validate generated secrets
./scripts/security/validate-secrets.sh production
```

**Apply Kubernetes Secrets:**
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

<<<<<<< HEAD
# Create secrets (replace with your encoded values)
kubectl create secret generic elkzone-secrets \
  --from-literal=DATABASE_URL=$(echo -n "postgresql://..." | base64) \
  --from-literal=JWT_SECRET=$(echo -n "your-secret" | base64) \
  --from-literal=REDIS_URL=$(echo -n "redis://..." | base64) \
  -n elkzone-prod
```

=======
# Apply generated secrets
kubectl apply -f k8s/secrets.generated.yaml

# Or create secrets manually (replace with your encoded values)
kubectl create secret generic elkzone-secrets \
  --from-literal=DATABASE_URL=$(echo -n "file:./db/elkzone.db" | base64) \
  --from-literal=JWT_SECRET=$(echo -n "your-secret" | base64) \
  --from-literal=REDIS_URL=$(echo -n "redis://redis:6379" | base64) \
  --from-literal=ACTIVITYPUB_PRIVATE_KEY="$(cat activitypub-private.pem | base64 -w 0)" \
  --from-literal=ACTIVITYPUB_PUBLIC_KEY="$(cat activitypub-public.pem | base64 -w 0)" \
  -n elkzone-prod
```

**Secrets Template Reference:**
See `k8s/secrets.yaml` for complete template with all required placeholders:
- `<BASE64_ENCODED_DATABASE_URL>`
- `<BASE64_ENCODED_JWT_SECRET>`
- `<BASE64_ENCODED_REDIS_URL>`
- `<BASE64_ENCODED_ACTIVITYPUB_PRIVATE_KEY>`
- `<BASE64_ENCODED_ACTIVITYPUB_PUBLIC_KEY>`
- `<BASE64_ENCODED_GRAFANA_PASSWORD>`

>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
### Step 4: Deploy Application

```bash
# Deploy storage
kubectl apply -f k8s/storage.yaml -n elkzone-prod

# Deploy configuration
kubectl apply -f k8s/configmap.yaml -n elkzone-prod

# Deploy applications
kubectl apply -f k8s/backend-deployment.yaml -n elkzone-prod
kubectl apply -f k8s/frontend-deployment.yaml -n elkzone-prod

# Deploy ingress
kubectl apply -f k8s/ingress.yaml -n elkzone-prod

# Deploy monitoring
kubectl apply -f k8s/monitoring.yaml -n elkzone-prod
```

### Step 5: Setup CI/CD

```bash
# Configure GitHub Actions
# Add secrets to GitHub repository:
# - GHCR_TOKEN
# - KUBE_CONFIG_PRODUCTION
# - DATABASE_URL
# - JWT_SECRET
# - REDIS_URL

# Push to main branch to trigger deployment
git push origin main
```

### Step 6: Verify Deployment

```bash
# Check pods
kubectl get pods -n elkzone-prod

# Check services
kubectl get services -n elkzone-prod

# Check ingress
kubectl get ingress -n elkzone-prod

# Port-forward to test
kubectl port-forward svc/elkzone-backend 4000:4000 -n elkzone-prod
curl http://localhost:4000/api/health
```

---

## 🌐 Federation Services

### ActivityPub (Akkoma)

```bash
# Deploy Akkoma for ActivityPub federation
kubectl apply -f k8s/federation/akkoma-deployment.yaml -n elkzone-prod

# Configure domain: akkoma.elk.zone
# Setup federation keys in ELK.Zone settings
```

### Matrix (Synapse)

```bash
# Deploy Matrix for chat federation
kubectl apply -f k8s/federation/matrix-deployment.yaml -n elkzone-prod

# Configure domain: matrix.elk.zone
# Setup federation bridge in ELK.Zone backend
```

### PeerTube (Video)

```bash
# Deploy PeerTube for video federation
kubectl apply -f k8s/federation/peertube-deployment.yaml -n elkzone-prod

# Configure domain: videos.elk.zone
# Setup API integration in ELK.Zone
```

### Jitsi (Video Conferencing)

```bash
# Deploy Jitsi for video calls
kubectl apply -f k8s/federation/jitsi-deployment.yaml -n elkzone-prod

# Configure domain: meet.elk.zone
# Integration via iFrame in ELK.Zone
```

---

## 📊 Monitoring & Observability

### Health Endpoints

- **Health Check**: `GET /api/health`
- **Metrics**: `GET /api/metrics`
- **Detailed Health**: `GET /api/health?detailed=true`

### Monitoring Stack

**Quick Production:**
- Grafana: `https://elk.zone:3001`
- Prometheus: `https://elk.zone:9090`
- Kibana: `https://elk.zone:5601`

**Cloud Scale:**
- Access via Kubernetes services
- Grafana: `kubectl port-forward svc/grafana 3000:80 -n monitoring`
- Prometheus: `kubectl port-forward svc/prometheus 9090:9090 -n monitoring`

### Key Metrics to Monitor

- Application response time
- Database connection count
- Memory and CPU usage
- Error rates
- Active users
- Federation service health

---

## 💾 Backup & Recovery

### Automated Backups

```bash
# Setup automated backups (cron)
0 2 * * * /opt/elkzone/scripts/backup.sh production

# Manual backup
./scripts/backup.sh production
```

### Disaster Recovery

```bash
# List available backups
./scripts/restore.sh production

# Restore from specific backup
./scripts/restore.sh production 20231201_020000

# Full disaster recovery
./scripts/disaster-recovery.sh production full
```

### Backup Locations

- **Local**: `/opt/backups/elkzone/`
- **Cloud**: `s3://elkzone-backups/production/`

---

## 🔧 Management Commands

### Docker Compose

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Update application
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build

# Scale services
docker compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Kubernetes

```bash
# View pods
kubectl get pods -n elkzone-prod

# View logs
kubectl logs -f deployment/elkzone-backend -n elkzone-prod

# Scale deployments
kubectl scale deployment elkzone-backend --replicas=5 -n elkzone-prod

# Update image
kubectl set image deployment/elkzone-backend backend=ghcr.io/your-org/elkzone-backend:latest -n elkzone-prod

# Check resource usage
kubectl top pods -n elkzone-prod
```

---

## 🔒 Security Considerations

### Network Security

- Configure firewall rules (UFW/Security Groups)
- Use WAF (Web Application Firewall)
- Enable DDoS protection
- Regular security updates

### Application Security

- Rotate secrets regularly
- Use strong passwords
- Enable rate limiting
- Monitor for suspicious activity
- Regular security audits

### SSL/TLS

- Use Let's Encrypt for free certificates
- Enable HSTS headers
- Configure secure ciphers
- Regular certificate renewal

---

## 🚨 Troubleshooting

### Common Issues

**Application not starting:**
```bash
# Check logs
docker compose logs backend
kubectl logs deployment/elkzone-backend -n elkzone-prod

# Check environment variables
docker compose exec backend env
kubectl exec deployment/elkzone-backend -n elkzone-prod -- env
```

**Database connection issues:**
```bash
# Test database connection
docker compose exec postgres pg_isready -U elk
kubectl exec deployment/elkzone-postgres -n elkzone-prod -- pg_isready -U elk

# Check database logs
docker compose logs postgres
kubectl logs deployment/elkzone-postgres -n elkzone-prod
```

**High memory usage:**
```bash
# Check memory usage
docker stats
kubectl top pods -n elkzone-prod

# Restart services
docker compose restart backend
kubectl rollout restart deployment/elkzone-backend -n elkzone-prod
```

### Performance Optimization

- Enable Redis caching
- Optimize database queries
- Use CDN for static assets
- Implement connection pooling
- Monitor and tune resource limits

---

## 📞 Support

### Documentation

- [API Documentation](./API.md)
- [Federation Guide](./FEDERATION.md)
- [Monitoring Guide](./MONITORING.md)

### Community

- GitHub Issues: [Report bugs](https://github.com/your-org/elkzone-2.0/issues)
- Discussions: [Community forum](https://github.com/your-org/elkzone-2.0/discussions)
- Matrix: [#elkzone:matrix.elk.zone](https://matrix.to/#/#elkzone:matrix.elk.zone)

### Emergency Contacts

- Technical Lead: [contact@elk.zone](mailto:contact@elk.zone)
- Security Issues: [security@elk.zone](mailto:security@elk.zone)

---

## 🎯 Next Steps

1. **Monitor Performance**: Set up alerts and dashboards
2. **Test Federation**: Verify ActivityPub and Matrix integration
3. **User Testing**: Conduct thorough user acceptance testing
4. **Load Testing**: Test system under heavy load
5. **Security Audit**: Perform security assessment
6. **Documentation**: Update internal documentation
7. **Launch**: Go live with user onboarding

---

🎉 **Congratulations! Your ELK.Zone 2.0 instance is now deployed and ready for production use!**