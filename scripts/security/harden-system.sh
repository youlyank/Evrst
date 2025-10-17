#!/bin/bash

# ELK.Zone 2.0 - System Hardening Script
# Implements security best practices for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 ELK.Zone 2.0 - System Hardening${NC}"

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

# Function to configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    # Install UFW if not present
    if ! command -v ufw &> /dev/null; then
        sudo apt update && sudo apt install -y ufw
    fi
    
    # Reset firewall rules
    sudo ufw --force reset
    
    # Default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH (with rate limiting)
    sudo ufw limit ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Enable firewall
    sudo ufw --force enable
    
    print_success "Firewall configured and enabled"
}

# Function to secure SSH
secure_ssh() {
    print_status "Securing SSH configuration..."
    
    local sshd_config="/etc/ssh/sshd_config"
    local backup_config="/etc/ssh/sshd_config.backup"
    
    # Backup original config
    sudo cp "$sshd_config" "$backup_config"
    
    # SSH hardening settings
    sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' "$sshd_config"
    sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' "$sshd_config"
    sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' "$sshd_config"
    sudo sed -i 's/#PermitEmptyPasswords yes/PermitEmptyPasswords no/' "$sshd_config"
    sudo sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' "$sshd_config"
    
    # Restart SSH service
    sudo systemctl restart sshd
    
    print_success "SSH configuration secured"
}

# Function to configure fail2ban
configure_fail2ban() {
    print_status "Configuring fail2ban..."
    
    # Install fail2ban
    sudo apt update && sudo apt install -y fail2ban
    
    # Create local configuration
    sudo bash -c 'cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF'
    
    # Enable and start fail2ban
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    
    print_success "Fail2ban configured and started"
}

# Function to configure automatic updates
configure_auto_updates() {
    print_status "Configuring automatic security updates..."
    
    # Install unattended-upgrades
    sudo apt update && sudo apt install -y unattended-upgrades apt-listchanges
    
    # Configure automatic updates
    sudo bash -c 'cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}";
    "\${distro_id}:\${distro_codename}-security";
};

Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF'
    
    # Enable automatic updates
    sudo dpkg-reconfigure -f noninteractive unattended-upgrades
    
    print_success "Automatic security updates configured"
}

# Function to generate security report
generate_security_report() {
    local report_file="/opt/elkzone/security_hardening_report_$(date +%Y%m%d_%H%M%S).txt"
    
    print_status "Generating security hardening report..."
    
    cat > "$report_file" << EOF
ELK.Zone 2.0 - Security Hardening Report
Generated: $(date)

=== SYSTEM SECURITY STATUS ===

Firewall Status:
$(sudo ufw status verbose)

SSH Configuration:
$(sudo sshd -T | grep -E "(permitrootlogin|passwordauthentication|pubkeyauthentication)")

Fail2ban Status:
$(sudo fail2ban-client status)

=== SECURITY FEATURES ENABLED ===

✓ Firewall configured with UFW
✓ SSH hardening applied
✓ Fail2ban intrusion prevention
✓ Automatic security updates

=== RECOMMENDATIONS ===

1. Enable 2FA for all admin accounts
2. Regularly review security logs
3. Keep system and application updated
4. Monitor for unusual activity
5. Regular security audits

=== CONTACT ===

Security issues: security@elk.zone
EOF
    
    print_success "Security hardening report generated: $report_file"
}

# Main hardening process
print_status "Starting system hardening..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Execute hardening steps
configure_firewall
secure_ssh
configure_fail2ban
configure_auto_updates
generate_security_report

echo ""
echo -e "${GREEN}🎉 System hardening completed successfully!${NC}"
echo ""
echo "🔒 Security Features Enabled:"
echo "  • Firewall with UFW"
echo "  • SSH hardening"
echo "  • Fail2ban protection"
echo "  • Automatic security updates"
echo ""
echo -e "${GREEN}✅ System is now hardened and secure!${NC}"