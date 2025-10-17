#!/bin/bash

# ELK.Zone 2.0 - Simple Well-Known Files Creation Script
# Creates .well-known federation discovery files without sourcing problematic env

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
WELL_KNOWN_DIR="$FEDERATION_DIR/well-known"
PUBLIC_WELL_KNOWN_DIR="$PROJECT_DIR/public/.well-known"

# Use default domain
DOMAIN="elkzone.example.com"

echo -e "${GREEN}🌍 ELK.Zone 2.0 - Well-Known Files Creation${NC}"
echo -e "${BLUE}Project Directory: ${PROJECT_DIR}${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to create ActivityPub host-meta
create_host_meta() {
    local host_meta_file="$WELL_KNOWN_DIR/host-meta"
    
    print_status "Creating ActivityPub host-meta..."
    
    cat > "$host_meta_file" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
  <Link rel="lrdd" type="application/xrd+xml" template="https://$DOMAIN/.well-known/webfinger?resource={uri}"/>
  <Link rel="http://webfinger.net/rel/profile-page" type="text/html" template="https://$DOMAIN/@{uri}"/>
  <Link rel="self" type="application/activity+json" template="https://$DOMAIN/users/{uri}"/>
  <Property type="http://mastodon.social/schema/1.0">supported</Property>
</XRD>
EOF
    
    print_success "ActivityPub host-meta created"
}

# Function to create Webfinger response
create_webfinger() {
    local webfinger_file="$WELL_KNOWN_DIR/webfinger.json"
    
    print_status "Creating Webfinger template..."
    
    cat > "$webfinger_file" << EOF
{
  "subject": "acct:system@$DOMAIN",
  "aliases": [
    "https://$DOMAIN/@system",
    "https://$DOMAIN/users/system"
  ],
  "links": [
    {
      "rel": "http://webfinger.net/rel/profile-page",
      "type": "text/html",
      "href": "https://$DOMAIN/@system"
    },
    {
      "rel": "self",
      "type": "application/activity+json",
      "href": "https://$DOMAIN/users/system"
    },
    {
      "rel": "http://ostatus.org/schema/1.0/subscribe",
      "template": "https://$DOMAIN/authorize_interaction?uri={uri}"
    }
  ]
}
EOF
    
    print_success "Webfinger template created"
}

# Function to create Matrix server discovery
create_matrix_server() {
    local matrix_server_file="$WELL_KNOWN_DIR/matrix/server"
    
    print_status "Creating Matrix server discovery..."
    
    cat > "$matrix_server_file" << EOF
{
  "m.server": "matrix.$DOMAIN:443"
}
EOF
    
    print_success "Matrix server discovery created"
}

# Function to create Matrix client discovery
create_matrix_client() {
    local matrix_client_file="$WELL_KNOWN_DIR/matrix/client"
    
    print_status "Creating Matrix client discovery..."
    
    cat > "$matrix_client_file" << EOF
{
  "m.homeserver": {
    "base_url": "https://matrix.$DOMAIN"
  },
  "m.identity_server": {
    "base_url": "https://vector.im"
  },
  "org.matrix.msc3575.proxy": {
    "url": "https://matrix.$DOMAIN"
  },
  "m.tile_server": {
    "map_style_url": "https://api.maptiler.com/maps/streets/style.json?key=fU3vlMsMn4Jb6dnEIFsx"
  }
}
EOF
    
    print_success "Matrix client discovery created"
}

# Function to create Jitsi configuration
create_jitsi_config() {
    local jitsi_config_file="$WELL_KNOWN_DIR/jitsi-config.json"
    
    print_status "Creating Jitsi configuration..."
    
    cat > "$jitsi_config_file" << EOF
{
  "hosts": {
    "meet.$DOMAIN": {
      "domain": "meet.$DOMAIN",
      "bosh": "https://meet.$DOMAIN/http-bind",
      "websocket": "wss://meet.$DOMAIN/xmpp-websocket",
      "muc": "muc.meet.$DOMAIN",
      "focus": "focus.meet.$DOMAIN"
    }
  },
  "conference": {
    "domain": "muc.meet.$DOMAIN",
    "room_prefix": "__"
  },
  "bridge": {
    "enabled": true,
    "domain": "matrix.$DOMAIN"
  },
  "features": {
    "livestreaming": true,
    "recording": true,
    "transcription": true,
    "backgrounds": true
  },
  "security": {
    "turn": {
      "urls": [
        "turn:meet.$DOMAIN:443?transport=tcp",
        "turn:meet.$DOMAIN:443?transport=udp"
      ],
      "username": "turnuser",
      "credential": "turnpassword"
    }
  }
}
EOF
    
    print_success "Jitsi configuration created"
}

# Function to create NodeInfo
create_nodeinfo() {
    local nodeinfo_file="$WELL_KNOWN_DIR/nodeinfo.json"
    
    print_status "Creating NodeInfo..."
    
    cat > "$nodeinfo_file" << EOF
{
  "version": "2.0",
  "software": {
    "name": "elkzone",
    "version": "2.0.0",
    "repository": "https://github.com/your-org/elkzone-2.0",
    "homepage": "https://$DOMAIN"
  },
  "protocols": [
    "activitypub",
    "matrix",
    "peertube",
    "jitsi"
  ],
  "services": {
    "inbound": [
      "activitypub",
      "matrix",
      "peertube"
    ],
    "outbound": [
      "activitypub",
      "matrix",
      "peertube"
    ]
  },
  "openRegistrations": true,
  "usage": {
    "users": {
      "total": 0,
      "activeHalfyear": 0,
      "activeMonth": 0
    },
    "localPosts": 0,
    "localComments": 0
  },
  "metadata": {
    "nodeName": "ELK.Zone 2.0",
    "nodeDescription": "Federated social media platform combining the best of Twitter, Reddit, Discord, Instagram, and Twitch",
    "maintainer": {
      "name": "ELK.Zone Team",
      "email": "admin@$DOMAIN"
    },
    "federation": {
      "enabled": true,
      "services": [
        "akkoma",
        "matrix", 
        "peertube",
        "jitsi"
      ]
    }
  }
}
EOF
    
    print_success "NodeInfo created"
}

# Function to create security.txt
create_security_txt() {
    local security_file="$WELL_KNOWN_DIR/security.txt"
    
    print_status "Creating security.txt..."
    
    cat > "$security_file" << EOF
# Our security policy and contact information
Contact: mailto:security@$DOMAIN
Contact: https://$DOMAIN/security
Expires: $(date -d "+1 year" -u +%Y-%m-%dT%H:%M:%S.000Z)

# Our security vulnerability disclosure policy
Policy: https://$DOMAIN/security-policy

# Our security key for verifying signed security documents
Canonical: https://$DOMAIN/.well-known/security.txt

# Preferred languages for security communications
Preferred-Languages: en, fr, de, es

# OpenPGP key for encrypted communications
Encryption: https://$DOMAIN/pgp-key.txt

# HackerOne program (if applicable)
# Thanks: https://hackerone.com/$DOMAIN
EOF
    
    print_success "security.txt created"
}

# Function to create robots.txt for federation
create_robots_txt() {
    local robots_file="$WELL_KNOWN_DIR/robots.txt"
    
    print_status "Creating robots.txt..."
    
    cat > "$robots_file" << EOF
# ELK.Zone 2.0 robots.txt
# Allow federation crawlers and bots

User-agent: *
Allow: /
Allow: /.well-known/
Allow: /nodeinfo
Allow: /users/
Allow: /@/
Allow: /tags/

# Disallow admin and sensitive areas
Disallow: /admin/
Disallow: /api/admin/
Disallow: /settings/
Disallow: /messages/

# Federation-specific rules
User-agent: Mastodon
Allow: /

User-agent: Pleroma
Allow: /

User-agent: Matrix-Synapse
Allow: /.well-known/matrix/

User-agent: PeerTube-Crawler
Allow: /
Crawl-delay: 1

# Sitemap
Sitemap: https://$DOMAIN/sitemap.xml
EOF
    
    print_success "robots.txt created"
}

# Function to copy files to public directory
copy_to_public() {
    print_status "Copying well-known files to public directory..."
    
    # Ensure public .well-known directory exists
    mkdir -p "$PUBLIC_WELL_KNOWN_DIR"
    
    # Copy all well-known files
    cp -r "$WELL_KNOWN_DIR"/* "$PUBLIC_WELL_KNOWN_DIR/"
    
    # Create proper structure for Matrix
    mkdir -p "$PUBLIC_WELL_KNOWN_DIR/matrix"
    mv "$PUBLIC_WELL_KNOWN_DIR/server" "$PUBLIC_WELL_KNOWN_DIR/matrix/" 2>/dev/null || true
    mv "$PUBLIC_WELL_KNOWN_DIR/client" "$PUBLIC_WELL_KNOWN_DIR/matrix/" 2>/dev/null || true
    
    print_success "Well-known files copied to public directory"
}

# Function to display summary
display_summary() {
    echo ""
    echo -e "${GREEN}🎉 Well-Known Files Creation Summary${NC}"
    echo ""
    echo "📁 Generated Files:"
    echo "  • federation/well-known/host-meta"
    echo "  • federation/well-known/webfinger.json"
    echo "  • federation/well-known/matrix/server"
    echo "  • federation/well-known/matrix/client"
    echo "  • federation/well-known/jitsi-config.json"
    echo "  • federation/well-known/nodeinfo.json"
    echo "  • federation/well-known/security.txt"
    echo "  • federation/well-known/robots.txt"
    echo ""
    echo "🌐 Public Directory:"
    echo "  • public/.well-known/ (copied for web access)"
    echo ""
    echo "🔍 Federation Endpoints:"
    echo "  • https://$DOMAIN/.well-known/host-meta"
    echo "  • https://$DOMAIN/.well-known/webfinger"
    echo "  • https://$DOMAIN/.well-known/matrix/server"
    echo "  • https://$DOMAIN/.well-known/matrix/client"
    echo "  • https://$DOMAIN/.well-known/jitsi-config.json"
    echo "  • https://$DOMAIN/nodeinfo/2.0"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. ./scripts/federation/test-federation.sh"
    echo "  2. Configure DNS records for federation subdomains"
    echo "  3. Test with remote federation instances"
    echo "  4. Set up reverse proxy for .well-known paths"
    echo ""
}

# Main execution
main() {
    print_status "Creating well-known federation files..."
    
    # Check if federation keys exist
    if [ ! -f "$FEDERATION_DIR/federation_keys_manifest.json" ]; then
        echo -e "${YELLOW}[WARNING]${NC} Federation keys manifest not found"
        print_status "Please run ./scripts/federation/generate-federation-keys.sh first"
    fi
    
    # Create well-known directory
    mkdir -p "$WELL_KNOWN_DIR"
    
    # Create all well-known files
    create_host_meta
    create_webfinger
    create_matrix_server
    create_matrix_client
    create_jitsi_config
    create_nodeinfo
    create_security_txt
    create_robots_txt
    
    # Copy to public directory
    copy_to_public
    
    # Display summary
    display_summary
    
    print_success "Well-known files creation completed successfully!"
}

# Run main function
main "$@"