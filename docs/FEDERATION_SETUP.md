# ELK.Zone 2.0 - Federation Setup Guide

This guide provides comprehensive instructions for setting up and managing federation across ELK.Zone 2.0's integrated services: Akkoma (ActivityPub), Matrix (Synapse), PeerTube, and Jitsi.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Key Generation](#key-generation)
4. [Well-Known Files Configuration](#well-known-files-configuration)
5. [Service Configuration](#service-configuration)
6. [DNS Setup](#dns-setup)
7. [Testing Federation](#testing-federation)
8. [Monitoring and Health](#monitoring-and-health)
9. [Troubleshooting](#troubleshooting)
10. [Security Best Practices](#security-best-practices)

## Overview

ELK.Zone 2.0 supports full federation with the following protocols:

- **ActivityPub** (via Akkoma) - Social media federation
- **Matrix** (via Synapse) - Real-time messaging federation
- **PeerTube** - Video content federation
- **Jitsi** - Video conferencing integration

Each service uses cryptographic keys for secure identity verification and message signing.

## Prerequisites

### System Requirements

- Linux server with Docker and Docker Compose
- Minimum 4GB RAM, 8GB recommended
- 50GB storage, 100GB recommended
- Public IP address with proper DNS configuration
- SSL certificates (Let's Encrypt recommended)

### Domain Requirements

You'll need the following domains configured:

- `elkzone.example.com` - Main domain
- `matrix.elkzone.example.com` - Matrix server
- `videos.elkzone.example.com` - PeerTube instance
- `meet.elkzone.example.com` - Jitsi meet server

### Software Dependencies

```bash
# Required packages
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx openssl

# Node.js dependencies (included in Docker)
npm install -g pm2  # Optional for process management
```

## Key Generation

### Automated Key Generation

The federation keys can be generated automatically using the provided script:

```bash
# Generate all federation keys
./scripts/federation/generate-federation-keys.sh
```

This script creates:
- RSA 4096-bit keys for Akkoma and PeerTube
- Ed25519 keys for Matrix
- ECDSA 256-bit keys for Jitsi
- Updates `.env.prod` with key references
- Generates `federation_keys_manifest.json`

### Manual Key Generation

If you need to generate keys manually:

#### Akkoma (ActivityPub) RSA Keys

```bash
# Generate RSA 4096-bit key pair
openssl genrsa -out federation/akkoma/keys/private.pem 4096
openssl rsa -in federation/akkoma/keys/private.pem -pubout -out federation/akkoma/keys/public.pem

# Set proper permissions
chmod 600 federation/akkoma/keys/private.pem
chmod 644 federation/akkoma/keys/public.pem
```

#### Matrix Ed25519 Keys

```bash
# Generate Ed25519 signing key
openssl genpkey -algorithm Ed25519 -out federation/matrix/keys/ed25519.key

# Generate server key
openssl genpkey -algorithm Ed25519 -out federation/matrix/keys/server.key

# Set proper permissions
chmod 600 federation/matrix/keys/*.key
```

#### PeerTube RSA Keys

```bash
# Generate RSA 4096-bit key pair
openssl genrsa -out federation/peertube/keys/private.pem 4096
openssl rsa -in federation/peertube/keys/private.pem -pubout -out federation/peertube/keys/public.pem

# Set proper permissions
chmod 600 federation/peertube/keys/private.pem
chmod 644 federation/peertube/keys/public.pem
```

#### Jitsi ECDSA Keys

```bash
# Generate ECDSA P-256 key pair
openssl ecparam -name prime256v1 -genkey -noout -out federation/jitsi/keys/private.pem
openssl ec -in federation/jitsi/keys/private.pem -pubout -out federation/jitsi/keys/public.pem

# Set proper permissions
chmod 600 federation/jitsi/keys/private.pem
chmod 644 federation/jitsi/keys/public.pem
```

## Well-Known Files Configuration

### Automated Setup

```bash
# Generate all well-known files
./scripts/federation/create-well-known-files-simple.sh
```

### Manual Configuration

#### ActivityPub host-meta

Create `public/.well-known/host-meta`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
  <Link rel="lrdd" type="application/xrd+xml" template="https://elkzone.example.com/.well-known/webfinger?resource={uri}"/>
  <Link rel="http://webfinger.net/rel/profile-page" type="text/html" template="https://elkzone.example.com/@{uri}"/>
  <Link rel="self" type="application/activity+json" template="https://elkzone.example.com/users/{uri}"/>
  <Property type="http://mastodon.social/schema/1.0">supported</Property>
</XRD>
```

#### Webfinger Configuration

Create `public/.well-known/webfinger.json`:

```json
{
  "subject": "acct:system@elkzone.example.com",
  "aliases": [
    "https://elkzone.example.com/@system",
    "https://elkzone.example.com/users/system"
  ],
  "links": [
    {
      "rel": "http://webfinger.net/rel/profile-page",
      "type": "text/html",
      "href": "https://elkzone.example.com/@system"
    },
    {
      "rel": "self",
      "type": "application/activity+json",
      "href": "https://elkzone.example.com/users/system"
    },
    {
      "rel": "http://ostatus.org/schema/1.0/subscribe",
      "template": "https://elkzone.example.com/authorize_interaction?uri={uri}"
    }
  ]
}
```

#### Matrix Server Discovery

Create `public/.well-known/matrix/server`:

```json
{
  "m.server": "matrix.elkzone.example.com:443"
}
```

#### Matrix Client Discovery

Create `public/.well-known/matrix/client`:

```json
{
  "m.homeserver": {
    "base_url": "https://matrix.elkzone.example.com"
  },
  "m.identity_server": {
    "base_url": "https://vector.im"
  },
  "org.matrix.msc3575.proxy": {
    "url": "https://matrix.elkzone.example.com"
  }
}
```

#### Jitsi Configuration

Create `public/.well-known/jitsi-config.json`:

```json
{
  "hosts": {
    "meet.elkzone.example.com": {
      "domain": "meet.elkzone.example.com",
      "bosh": "https://meet.elkzone.example.com/http-bind",
      "websocket": "wss://meet.elkzone.example.com/xmpp-websocket",
      "muc": "muc.meet.elkzone.example.com",
      "focus": "focus.meet.elkzone.example.com"
    }
  },
  "conference": {
    "domain": "muc.meet.elkzone.example.com",
    "room_prefix": "__"
  },
  "bridge": {
    "enabled": true,
    "domain": "matrix.elkzone.example.com"
  }
}
```

## Service Configuration

### Akkoma Configuration

Configure Akkoma for federation in `config/prod.secret.exs`:

```elixir
# Federation configuration
config :pleroma, :instance,
  name: "ELK.Zone 2.0",
  email: "admin@elkzone.example.com",
  notify_email: "notify@elkzone.example.com",
  description: "Federated social media platform",
  limit: 5000,
  remote_limit: 100_000,
  upload_limit: 16_000_000,
  avatar_upload_limit: 2_000_000,
  background_upload_limit: 4_000_000,
  banner_upload_limit: 4_000_000

# ActivityPub configuration
config :pleroma, :activitypub,
  sign_object_age: 600,
  reject_deleted_objects: true

# Webfinger configuration
config :pleroma, :webfinger,
  domain: "elkzone.example.com"

# HTTP signatures
config :pleroma, :http_signatures,
  key_id: "https://elkzone.example.com/#main-key"
```

### Matrix Configuration

Configure Synapse in `matrix/homeserver.yaml`:

```yaml
# Server configuration
server_name: "elkzone.example.com"
public_baseurl: "https://matrix.elkzone.example.com/"

# Federation configuration
federation_domain_whitelist:
  - "elkzone.example.com"
  - "matrix.elkzone.example.com"

# Signing keys
signing_key_path: "/data/federation/matrix/keys/server.key"

# Database
database:
  name: "psycopg2"
  args:
    user: "synapse"
    password: "your_password"
    database: "synapse"
    host: "postgres"
    port: 5432
    cp_min: 5
    cp_max: 10

# Redis
redis:
  enabled: true
  host: "redis"
  port: 6379

# Federation settings
federation_rr_transactions_per_room_per_second: 50
federation_rc_concurrent: 100
federation_rc_reject_limit: 50
```

### PeerTube Configuration

Configure PeerTube in `peertube/config/production.yaml`:

```yaml
webserver:
  https: true
  hostname: 'videos.elkzone.example.com'
  port: 443

# Database configuration
database:
  hostname: 'postgres'
  port: 5432
  name: 'peertube'
  username: 'peertube'
  password: 'your_password'

# Redis configuration
redis:
  hostname: 'redis'
  port: 6377

# Federation configuration
federation:
  videos:
    # Federate with other instances
    federation: true
    # Allow remote videos
    remote_videos: true
    # Minimum interval between remote video checks
    remote_videos_check_interval: '1 hour'

# Security
secrets:
  peertube: 'your_peertube_secret'

# Instance settings
instance:
  name: 'ELK.Zone Videos'
  short_description: 'Video sharing platform'
  description: 'Part of the ELK.Zone federated network'
  terms: 'Terms of service'
  default_client_route: '/videos/popular'
```

### Jitsi Configuration

Configure Jitsi Meet in `.env`:

```bash
# Jitsi configuration
JITSI_DOMAIN=meet.elkzone.example.com
JITSI_AUTH_DOMAIN=auth.meet.elkzone.example.com
JITSI_XMPP_DOMAIN=meet.elkzone.example.com
JITSI_XMPP_SERVER=xmpp.meet.elkzone.example.com
JITSI_XMPP_BOSH_URL_BASE=http://xmpp.meet.elkzone.example.com:5280
JITSI_XMPP_HIDDEN_DOMAIN=guest.meet.elkzone.example.com

# Focus user
JICOFO_AUTH_USER=focus
JICOFO_AUTH_PASSWORD=your_focus_password

# Videobridge
JVB_AUTH_USER=videobridge
JVB_AUTH_PASSWORD=your_videobridge_password

# Etherpad
ETHERPAD_URL_BASE=http://etherpad.meet.elkzone.example.com:9001
```

## DNS Setup

### Required DNS Records

```dns
; Main domain
elkzone.example.com.      IN A     YOUR_SERVER_IP
*.elkzone.example.com.    IN A     YOUR_SERVER_IP

; Matrix SRV records
_matrix._tcp.elkzone.example.com.    IN SRV   10 5 443 matrix.elkzone.example.com.
_matrix._tcp.matrix.elkzone.example.com. IN SRV   10 5 443 matrix.elkzone.example.com.

; Video subdomain
videos.elkzone.example.com.          IN A     YOUR_SERVER_IP

; Jitsi subdomain
meet.elkzone.example.com.            IN A     YOUR_SERVER_IP

; SPF for email
elkzone.example.com.                 IN TXT   "v=spf1 mx -all"

; DMARC
_dmarc.elkzone.example.com.          IN TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@elkzone.example.com"
```

### Reverse Proxy Configuration

Configure Nginx for federation endpoints:

```nginx
# Main domain configuration
server {
    listen 80;
    listen [::]:80;
    server_name elkzone.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name elkzone.example.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/elkzone.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/elkzone.example.com/privkey.pem;
    
    # Well-known files
    location /.well-known/ {
        alias /var/www/elkzone/public/.well-known/;
        try_files $uri $uri/ =404;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Matrix configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name matrix.elkzone.example.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/matrix.elkzone.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/matrix.elkzone.example.com/privkey.pem;
    
    # Matrix federation
    location /_matrix/ {
        proxy_pass http://localhost:8008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Client-server API
    location / {
        proxy_pass http://localhost:8008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# PeerTube configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name videos.elkzone.example.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/videos.elkzone.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/videos.elkzone.example.com/privkey.pem;
    
    # PeerTube application
    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket for live streaming
    location /socket.io/ {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Jitsi configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name meet.elkzone.example.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/meet.elkzone.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meet.elkzone.example.com/privkey.pem;
    
    # Jitsi Meet
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # BOSH for XMPP
    location /http-bind {
        proxy_pass http://localhost:5280/http-bind;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Testing Federation

### Automated Testing

Run the comprehensive federation test suite:

```bash
# Test all federation services
./scripts/federation/test-federation.sh
```

This script verifies:
- Key file validity and permissions
- Well-known file accessibility
- Service health and connectivity
- Federation handshakes

### Manual Testing

#### ActivityPub Federation

```bash
# Test webfinger
curl -H "Accept: application/json" \
  "https://elkzone.example.com/.well-known/webfinger?resource=acct:system@elkzone.example.com"

# Test host-meta
curl -H "Accept: application/xrd+xml" \
  "https://elkzone.example.com/.well-known/host-meta"

# Test ActivityPub actor
curl -H "Accept: application/activity+json" \
  "https://elkzone.example.com/users/system"
```

#### Matrix Federation

```bash
# Test server discovery
curl "https://elkzone.example.com/.well-known/matrix/server"

# Test client discovery
curl "https://elkzone.example.com/.well-known/matrix/client"

# Test Matrix server version
curl "https://matrix.elkzone.example.com/_matrix/server/versions"

# Test federation endpoint
curl "https://matrix.elkzone.example.com/_matrix/federation/v1/version"
```

#### PeerTube Federation

```bash
# Test NodeInfo
curl "https://videos.elkzone.example.com/nodeinfo/2.0.json"

# Test webfinger
curl -H "Accept: application/json" \
  "https://videos.elkzone.example.com/.well-known/webfinger?resource=acct:peertube@videos.elkzone.example.com"

# Test API
curl "https://videos.elkzone.example.com/api/v1/config"
```

#### Jitsi Integration

```bash
# Test Jitsi configuration
curl "https://elkzone.example.com/.well-known/jitsi-config.json"

# Test Jitsi meet interface
curl -I "https://meet.elkzone.example.com/"
```

## Monitoring and Health

### Federation Status API

Monitor federation health via the API:

```bash
# Get current federation status
curl "https://elkzone.example.com/api/federation/status"
```

Response format:
```json
{
  "overall": "healthy",
  "lastUpdate": "2025-10-17T15:55:32.424Z",
  "services": {
    "akkoma": {
      "name": "Akkoma (ActivityPub)",
      "status": "online",
      "reachable": true,
      "lastCheck": "2025-10-17T15:55:31.094Z",
      "details": {
        "keys": { "private": true, "public": true },
        "wellKnown": { "hostMeta": true, "webfinger": true },
        "service": { "reachable": true }
      }
    }
  },
  "metrics": {
    "totalPeers": 5,
    "activeConnections": 12,
    "messagesExchanged": 156,
    "uptime": 86400
  }
}
```

### Grafana Dashboard

Set up monitoring with Grafana:

1. Import the federation dashboard
2. Configure Prometheus data source
3. Monitor key metrics:
   - Federation success rates
   - Message delivery times
   - Connection counts
   - Error rates

### Log Monitoring

Monitor important log files:

```bash
# Akkoma logs
docker logs -f akkoma

# Matrix logs
docker logs -f synapse

# PeerTube logs
docker logs -f peertube

# Jitsi logs
docker logs -f jicofo
docker logs -f jvb
```

## Troubleshooting

### Common Issues

#### Federation Keys Not Working

**Problem**: Services report invalid or missing keys.

**Solution**:
1. Verify key file permissions:
   ```bash
   chmod 600 federation/*/keys/*.pem
   chmod 600 federation/*/keys/*.key
   chmod 644 federation/*/keys/public.pem
   ```

2. Regenerate keys:
   ```bash
   ./scripts/federation/generate-federation-keys.sh
   ```

3. Check key format:
   ```bash
   openssl rsa -in federation/akkoma/keys/private.pem -check -noout
   openssl pkey -in federation/matrix/keys/ed25519.key -text -noout
   ```

#### Well-Known Files Not Accessible

**Problem**: External services can't access well-known files.

**Solution**:
1. Check file permissions:
   ```bash
   chmod 644 public/.well-known/*
   chmod 755 public/.well-known
   ```

2. Verify Nginx configuration:
   ```bash
   nginx -t
   systemctl reload nginx
   ```

3. Test accessibility:
   ```bash
   curl -I "https://elkzone.example.com/.well-known/host-meta"
   ```

#### Matrix Federation Failing

**Problem**: Matrix can't federate with other homeservers.

**Solution**:
1. Check server discovery:
   ```bash
   dig +short SRV _matrix._tcp.elkzone.example.com
   ```

2. Verify SSL certificates:
   ```bash
   openssl s_client -connect matrix.elkzone.example.com:443
   ```

3. Check Synapse configuration:
   ```bash
   docker exec synapse python -m synapse.app.homeserver \
     --config-path /data/homeserver.yaml \
     --keys-directory /data/
   ```

#### ActivityPub Delivery Failures

**Problem**: Posts not reaching federated instances.

**Solution**:
1. Check inbox endpoints:
   ```bash
   curl -H "Accept: application/activity+json" \
     "https://remote-instance.com/users/remote_user/inbox"
   ```

2. Verify HTTP signatures:
   ```bash
   # Check Akkoma logs for signature errors
   docker logs akkoma | grep -i signature
   ```

3. Test with known good instance:
   ```bash
   # Try following a Mastodon user
   curl -X POST "https://elkzone.example.com/api/v1/follows" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d "uri=user@remote-instance.com"
   ```

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Akkoma debug
export MIX_ENV=prod
export PLEROMA_CONFIG_PATH=/etc/pleroma/config.exs
mix phx.server

# Matrix debug
# Add to homeserver.yaml
log_config: "/data/matrix.log.config"
# Set log level to DEBUG

# PeerTube debug
export NODE_ENV=development
export PEERTUBE_LOG_LEVEL=debug

# Jitsi debug
# Set JICOFO_LOG_LEVEL=debug
# Set JVB_LOG_LEVEL=debug
```

## Security Best Practices

### Key Management

1. **Regular Key Rotation**: Rotate federation keys every 90 days
2. **Secure Storage**: Store private keys with restricted permissions
3. **Backup Keys**: Maintain encrypted backups of all keys
4. **Never Commit Keys**: Exclude private keys from version control

```bash
# Add to .gitignore
federation/*/keys/*.pem
federation/*/keys/*.key
.env.prod
```

### Network Security

1. **Firewall Configuration**:
   ```bash
   # Allow required ports
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 8448/tcp  # Matrix federation
   ufw allow 5349/tcp  # TURN server
   ufw allow 10000/udp # TURN/STUN
   ```

2. **Rate Limiting**: Configure rate limits for federation endpoints
3. **Fail2Ban**: Protect against brute force attacks

### SSL/TLS Configuration

1. **Strong Ciphers**: Use modern TLS configurations
2. **Certificate Monitoring**: Monitor certificate expiration
3. **HSTS**: Enable HTTP Strict Transport Security

```nginx
# Add to Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
```

### Access Control

1. **Admin Access**: Restrict admin interfaces to trusted IPs
2. **API Authentication**: Use strong authentication for admin APIs
3. **Audit Logging**: Enable comprehensive audit logging

## Maintenance

### Regular Tasks

1. **Daily**:
   - Check federation status
   - Monitor error logs
   - Verify SSL certificates

2. **Weekly**:
   - Update security patches
   - Review federation metrics
   - Clean up old logs

3. **Monthly**:
   - Rotate federation keys
   - Update documentation
   - Performance tuning

### Backup Strategy

```bash
# Backup federation keys
tar -czf federation-keys-$(date +%Y%m%d).tar.gz federation/*/keys/

# Backup configuration
tar -czf federation-config-$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  .env.prod \
  nginx/ \
  scripts/federation/

# Backup databases
docker exec postgres pg_dump -U postgres > db-backup-$(date +%Y%m%d).sql
```

### Recovery Procedures

1. **Key Recovery**: Restore from encrypted backup
2. **Service Recovery**: Use Docker Compose to restart services
3. **Data Recovery**: Restore from database backups

## Support

### Community Resources

- **Documentation**: `/docs/`
- **Issue Tracker**: GitHub Issues
- **Community Forum**: [Link to forum]
- **Matrix Room**: #elkzone:matrix.org

### Getting Help

1. Check this documentation first
2. Search existing issues
3. Provide detailed error reports
4. Include federation status output

---

This federation setup guide ensures your ELK.Zone 2.0 instance can securely communicate with other federated services across the ActivityPub, Matrix, PeerTube, and Jitsi networks.