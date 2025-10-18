#!/bin/bash

# ELK.Zone 2.0 - Federation Testing Script
# Tests federation handshakes and connectivity for all services

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
DOMAIN="elkzone.example.com"

echo -e "${GREEN}🔄 ELK.Zone 2.0 - Federation Testing${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"

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

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

# Function to check if file exists and is readable
check_file() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ] && [ -r "$file" ]; then
        print_success "✓ $description: $file"
        return 0
    else
        print_error "✗ $description: $file (missing or unreadable)"
        return 1
    fi
}

# Function to validate RSA key
validate_rsa_key() {
    local key_file="$1"
    local description="$2"
    
    print_test "Validating $description RSA key..."
    
    if openssl rsa -in "$key_file" -check -noout >/dev/null 2>&1; then
        print_success "✓ $description RSA key is valid"
        return 0
    elif openssl rsa -in "$key_file" -pubin -text -noout >/dev/null 2>&1; then
        print_success "✓ $description RSA public key is valid"
        return 0
    else
        print_error "✗ $description RSA key is invalid"
        return 1
    fi
}

# Function to validate Ed25519 key
validate_ed25519_key() {
    local key_file="$1"
    local description="$2"
    
    print_test "Validating $description Ed25519 key..."
    
    if openssl pkey -in "$key_file" -text -noout >/dev/null 2>&1; then
        print_success "✓ $description Ed25519 key is valid"
        return 0
    else
        print_error "✗ $description Ed25519 key is invalid"
        return 1
    fi
}

# Function to validate ECDSA key
validate_ecdsa_key() {
    local key_file="$1"
    local description="$2"
    
    print_test "Validating $description ECDSA key..."
    
    if openssl ec -in "$key_file" -check -noout >/dev/null 2>&1; then
        print_success "✓ $description ECDSA key is valid"
        return 0
    else
        print_error "✗ $description ECDSA key is invalid"
        return 1
    fi
}

# Function to test HTTP endpoint
test_http_endpoint() {
    local url="$1"
    local description="$2"
    local expected_status="${3:-200}"
    
    print_test "Testing $description endpoint..."
    
    if command -v curl >/dev/null 2>&1; then
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 5 || echo "000")
        
        if [ "$status_code" = "$expected_status" ]; then
            print_success "✓ $description: $url (HTTP $status_code)"
            return 0
        else
            print_error "✗ $description: $url (HTTP $status_code, expected $expected_status)"
            return 1
        fi
    else
        print_warning "⚠ curl not available, skipping $description test"
        return 0
    fi
}

# Function to test well-known file accessibility
test_well_known_file() {
    local path="$1"
    local description="$2"
    local url="https://$DOMAIN/.well-known/$path"
    
    print_test "Testing $description accessibility..."
    
    if [ -f "$FEDERATION_DIR/well-known/$path" ]; then
        print_success "✓ $description file exists: federation/well-known/$path"
        
        # Test if it's also in public directory
        if [ -f "$PROJECT_DIR/public/.well-known/$path" ]; then
            print_success "✓ $description file published: public/.well-known/$path"
        else
            print_warning "⚠ $description file not published to public directory"
        fi
        
        return 0
    else
        print_error "✗ $description file missing: federation/well-known/$path"
        return 1
    fi
}

# Function to test Akkoma federation
test_akkoma_federation() {
    print_status "Testing Akkoma (ActivityPub) federation..."
    
    local errors=0
    
    # Check key files
    check_file "$FEDERATION_DIR/akkoma/keys/private.pem" "Akkoma private key" || ((errors++))
    check_file "$FEDERATION_DIR/akkoma/keys/public.pem" "Akkoma public key" || ((errors++))
    
    # Validate keys
    if [ -f "$FEDERATION_DIR/akkoma/keys/private.pem" ]; then
        validate_rsa_key "$FEDERATION_DIR/akkoma/keys/private.pem" "Akkoma private" || ((errors++))
    fi
    
    if [ -f "$FEDERATION_DIR/akkoma/keys/public.pem" ]; then
        validate_rsa_key "$FEDERATION_DIR/akkoma/keys/public.pem" "Akkoma public" || ((errors++))
    fi
    
    # Test well-known files
    test_well_known_file "host-meta" "ActivityPub host-meta" || ((errors++))
    test_well_known_file "webfinger.json" "Webfinger" || ((errors++))
    
    # Test HTTP endpoints (if server is running)
    test_http_endpoint "https://$DOMAIN/.well-known/host-meta" "host-meta endpoint" || ((errors++))
    test_http_endpoint "https://$DOMAIN/.well-known/webfinger?resource=acct:system@$DOMAIN" "Webfinger endpoint" || ((errors++))
    
    if [ $errors -eq 0 ]; then
        print_success "✔ Akkoma federation handshake successful"
        return 0
    else
        print_error "✗ Akkoma federation has $errors issues"
        return 1
    fi
}

# Function to test Matrix federation
test_matrix_federation() {
    print_status "Testing Matrix (Synapse) federation..."
    
    local errors=0
    
    # Check key files
    check_file "$FEDERATION_DIR/matrix/keys/ed25519.key" "Matrix Ed25519 key" || ((errors++))
    check_file "$FEDERATION_DIR/matrix/keys/server.key" "Matrix server key" || ((errors++))
    
    # Validate keys
    if [ -f "$FEDERATION_DIR/matrix/keys/ed25519.key" ]; then
        validate_ed25519_key "$FEDERATION_DIR/matrix/keys/ed25519.key" "Matrix Ed25519" || ((errors++))
    fi
    
    if [ -f "$FEDERATION_DIR/matrix/keys/server.key" ]; then
        validate_ed25519_key "$FEDERATION_DIR/matrix/keys/server.key" "Matrix server" || ((errors++))
    fi
    
    # Test well-known files
    test_well_known_file "matrix/server" "Matrix server discovery" || ((errors++))
    test_well_known_file "matrix/client" "Matrix client discovery" || ((errors++))
    
    # Test HTTP endpoints
    test_http_endpoint "https://$DOMAIN/.well-known/matrix/server" "Matrix server discovery" || ((errors++))
    test_http_endpoint "https://$DOMAIN/.well-known/matrix/client" "Matrix client discovery" || ((errors++))
    
    if [ $errors -eq 0 ]; then
        print_success "✔ Matrix homeserver discovery OK"
        return 0
    else
        print_error "✗ Matrix federation has $errors issues"
        return 1
    fi
}

# Function to test PeerTube federation
test_peertube_federation() {
    print_status "Testing PeerTube federation..."
    
    local errors=0
    
    # Check key files
    check_file "$FEDERATION_DIR/peertube/keys/private.pem" "PeerTube private key" || ((errors++))
    check_file "$FEDERATION_DIR/peertube/keys/public.pem" "PeerTube public key" || ((errors++))
    
    # Validate keys
    if [ -f "$FEDERATION_DIR/peertube/keys/private.pem" ]; then
        validate_rsa_key "$FEDERATION_DIR/peertube/keys/private.pem" "PeerTube private" || ((errors++))
    fi
    
    if [ -f "$FEDERATION_DIR/peertube/keys/public.pem" ]; then
        validate_rsa_key "$FEDERATION_DIR/peertube/keys/public.pem" "PeerTube public" || ((errors++))
    fi
    
    # Test well-known files
    test_well_known_file "webfinger.json" "PeerTube Webfinger" || ((errors++))
    
    # Test HTTP endpoints (PeerTube typically runs on subdomain)
    test_http_endpoint "https://videos.$DOMAIN/.well-known/webfinger?resource=acct:peertube@videos.$DOMAIN" "PeerTube Webfinger" || ((errors++))
    
    if [ $errors -eq 0 ]; then
        print_success "✔ PeerTube federation reachable"
        return 0
    else
        print_error "✗ PeerTube federation has $errors issues"
        return 1
    fi
}

# Function to test Jitsi federation
test_jitsi_federation() {
    print_status "Testing Jitsi federation..."
    
    local errors=0
    
    # Check key files
    check_file "$FEDERATION_DIR/jitsi/keys/private.pem" "Jitsi private key" || ((errors++))
    check_file "$FEDERATION_DIR/jitsi/keys/public.pem" "Jitsi public key" || ((errors++))
    
    # Validate keys
    if [ -f "$FEDERATION_DIR/jitsi/keys/private.pem" ]; then
        validate_ecdsa_key "$FEDERATION_DIR/jitsi/keys/private.pem" "Jitsi private" || ((errors++))
    fi
    
    if [ -f "$FEDERATION_DIR/jitsi/keys/public.pem" ]; then
        validate_ecdsa_key "$FEDERATION_DIR/jitsi/keys/public.pem" "Jitsi public" || ((errors++))
    fi
    
    # Test well-known files
    test_well_known_file "jitsi-config.json" "Jitsi configuration" || ((errors++))
    
    # Test HTTP endpoints
    test_http_endpoint "https://$DOMAIN/.well-known/jitsi-config.json" "Jitsi configuration" || ((errors++))
    test_http_endpoint "https://meet.$DOMAIN/" "Jitsi meet interface" || ((errors++))
    
    if [ $errors -eq 0 ]; then
        print_success "✔ Jitsi configuration valid"
        return 0
    else
        print_error "✗ Jitsi federation has $errors issues"
        return 1
    fi
}

# Function to test NodeInfo
test_nodeinfo() {
    print_status "Testing NodeInfo..."
    
    local errors=0
    
    # Check well-known file
    test_well_known_file "nodeinfo.json" "NodeInfo" || ((errors++))
    
    # Test HTTP endpoint
    test_http_endpoint "https://$DOMAIN/nodeinfo/2.0" "NodeInfo endpoint" || ((errors++))
    
    if [ $errors -eq 0 ]; then
        print_success "✔ NodeInfo accessible"
        return 0
    else
        print_error "✗ NodeInfo has $errors issues"
        return 1
    fi
}

# Function to test overall federation health
test_federation_health() {
    print_status "Testing overall federation health..."
    
    # Check manifest file
    if check_file "$FEDERATION_DIR/federation_keys_manifest.json" "Federation manifest"; then
        # Validate manifest JSON
        if python3 -m json.tool "$FEDERATION_DIR/federation_keys_manifest.json" >/dev/null 2>&1; then
            print_success "✓ Federation manifest JSON is valid"
        else
            print_error "✗ Federation manifest JSON is invalid"
            return 1
        fi
    else
        return 1
    fi
    
    # Check directory permissions
    local dirs=("akkoma/keys" "matrix/keys" "peertube/keys" "jitsi/keys" "well-known")
    for dir in "${dirs[@]}"; do
        if [ -d "$FEDERATION_DIR/$dir" ]; then
            local perms=$(stat -c "%a" "$FEDERATION_DIR/$dir" 2>/dev/null || echo "unknown")
            print_status "Directory $FEDERATION_DIR/$dir permissions: $perms"
        else
            print_error "✗ Directory missing: $FEDERATION_DIR/$dir"
            return 1
        fi
    done
    
    print_success "✔ Federation health check passed"
    return 0
}

# Function to display summary
display_summary() {
    echo ""
    echo -e "${GREEN}🎉 Federation Testing Summary${NC}"
    echo ""
    echo "📊 Test Results:"
    echo "  • Akkoma (ActivityPub): $([ $akkoma_status -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
    echo "  • Matrix (Synapse): $([ $matrix_status -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
    echo "  • PeerTube: $([ $peertube_status -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
    echo "  • Jitsi: $([ $jitsi_status -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
    echo "  • NodeInfo: $([ $nodeinfo_status -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
    echo "  • Overall Health: $([ $health_status -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
    echo ""
    
    local total_status=$((akkoma_status + matrix_status + peertube_status + jitsi_status + nodeinfo_status + health_status))
    
    if [ $total_status -eq 0 ]; then
        echo -e "${GREEN}🎊 ALL TESTS PASSED! Federation is ready for production.${NC}"
        echo ""
        echo "📋 Next Steps:"
        echo "  1. Configure DNS records for federation subdomains"
        echo "  2. Set up reverse proxy for .well-known paths"
        echo "  3. Test with remote federation instances"
        echo "  4. Monitor federation traffic and health"
        echo ""
    else
        echo -e "${RED}⚠️  SOME TESTS FAILED! Please fix issues before production.${NC}"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "  1. Check file permissions in federation/ directories"
        echo "  2. Verify key files are not corrupted"
        echo "  3. Ensure well-known files are accessible via HTTP"
        echo "  4. Test network connectivity to federation endpoints"
        echo ""
    fi
}

# Main execution
main() {
    print_status "Starting federation tests..."
    
    # Initialize status variables
    akkoma_status=0
    matrix_status=0
    peertube_status=0
    jitsi_status=0
    nodeinfo_status=0
    health_status=0
    
    # Run all tests
    test_federation_health || ((health_status++))
    test_akkoma_federation || ((akkoma_status++))
    test_matrix_federation || ((matrix_status++))
    test_peertube_federation || ((peertube_status++))
    test_jitsi_federation || ((jitsi_status++))
    test_nodeinfo || ((nodeinfo_status++))
    
    # Display summary
    display_summary
    
    # Exit with appropriate code
    local total_status=$((akkoma_status + matrix_status + peertube_status + jitsi_status + nodeinfo_status + health_status))
    exit $total_status
}

# Run main function
main "$@"