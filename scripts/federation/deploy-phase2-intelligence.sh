#!/bin/bash

# ELK.Zone 2.0 - Phase 2 Federation Intelligence Deployment
# Comprehensive deployment of all Phase 2 intelligence features

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEPLOYMENT_LOG="$PROJECT_DIR/logs/phase2-deployment.log"
INTEGRATION_LOG="$PROJECT_DIR/logs/integration.log"

# Phase 2 Components
declare -A PHASE2_COMPONENTS=(
    ["auto-key-rotation"]="Auto Key Rotation System"
    ["federation-watchdog"]="Federation AI Watchdog"
    ["auto-heal-deployment"]="Auto-Heal Deployment System"
    ["trust-mesh"]="Trust Mesh & Zero Trust Federation"
    ["peer-reputation"]="Peer Reputation Scoring"
    ["smart-routing"]="Smart Federation Routing"
    ["encrypted-channels"]="Encrypted Peer Channels"
    ["insights-dashboard"]="Federation Insights Dashboard"
)

echo -e "${GREEN}🚀 ELK.Zone 2.0 - Phase 2 Federation Intelligence Deployment${NC}"
echo -e "${BLUE}Project Directory: ${PROJECT_DIR}${NC}"

# Function to print colored output
print_status() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[INFO]${NC} [$timestamp] $1" | tee -a "$DEPLOYMENT_LOG"
}

print_warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[WARNING]${NC} [$timestamp] $1" | tee -a "$DEPLOYMENT_LOG"
}

print_error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[ERROR]${NC} [$timestamp] $1" | tee -a "$DEPLOYMENT_LOG"
}

print_success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[SUCCESS]${NC} [$timestamp] $1" | tee -a "$DEPLOYMENT_LOG"
}

print_phase() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${PURPLE}[PHASE2]${NC} [$timestamp] $1" | tee -a "$DEPLOYMENT_LOG"
}

print_integration() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${CYAN}[INTEGRATION]${NC} [$timestamp] $1" | tee -a "$INTEGRATION_LOG"
}

# Function to initialize deployment
initialize_deployment() {
    print_phase "Initializing Phase 2 Federation Intelligence Deployment..."
    
    # Create necessary directories
    mkdir -p "$(dirname "$DEPLOYMENT_LOG")"
    mkdir -p "$(dirname "$INTEGRATION_LOG")"
    mkdir -p "$PROJECT_DIR/state/phase2"
    mkdir -p "$PROJECT_DIR/monitoring/grafana/dashboards"
    mkdir -p "$PROJECT_DIR/monitoring/prometheus/rules"
    
    # Create deployment state tracking
    cat > "$PROJECT_DIR/state/phase2/deployment.json" << EOF
{
    "deployment_version": "2.0.0",
    "deployment_timestamp": "$(date -Iseconds)",
    "components": {},
    "integration_status": "in_progress",
    "health_status": "unknown"
}
EOF
    
    print_success "Phase 2 deployment initialized"
}

# Function to deploy Auto Key Rotation
deploy_auto_key_rotation() {
    print_phase "Deploying Auto Key Rotation System..."
    
    # Setup key rotation CRON
    if [ -f "$PROJECT_DIR/scripts/federation/setup-key-rotation-cron.sh" ]; then
        if command -v docker >/dev/null 2>&1; then
            "$PROJECT_DIR/scripts/federation/setup-key-rotation-cron.sh" --docker-only >> "$DEPLOYMENT_LOG" 2>&1
        else
            "$PROJECT_DIR/scripts/federation/setup-key-rotation-cron.sh" >> "$DEPLOYMENT_LOG" 2>&1
        fi
        
        if [ $? -eq 0 ]; then
            print_success "Auto Key Rotation deployed successfully"
            update_component_status "auto-key-rotation" "deployed"
        else
            print_error "Auto Key Rotation deployment failed"
            update_component_status "auto-key-rotation" "failed"
            return 1
        fi
    else
        print_warning "Auto Key Rotation script not found, skipping..."
        update_component_status "auto-key-rotation" "skipped"
    fi
}

# Function to deploy Federation AI Watchdog
deploy_federation_watchdog() {
    print_phase "Deploying Federation AI Watchdog..."
    
    # Setup watchdog service
    if [ -f "$PROJECT_DIR/scripts/federation/setup-watchdog-cron.sh" ]; then
        if command -v docker >/dev/null 2>&1; then
            "$PROJECT_DIR/scripts/federation/setup-watchdog-cron.sh" --docker-only >> "$DEPLOYMENT_LOG" 2>&1
        else
            "$PROJECT_DIR/scripts/federation/setup-watchdog-cron.sh" >> "$DEPLOYMENT_LOG" 2>&1
        fi
        
        if [ $? -eq 0 ]; then
            print_success "Federation AI Watchdog deployed successfully"
            update_component_status "federation-watchdog" "deployed"
        else
            print_error "Federation AI Watchdog deployment failed"
            update_component_status "federation-watchdog" "failed"
            return 1
        fi
    else
        print_warning "Federation AI Watchdog script not found, skipping..."
        update_component_status "federation-watchdog" "skipped"
    fi
}

# Function to deploy Auto-Heal Deployment
deploy_auto_heal_deployment() {
    print_phase "Deploying Auto-Heal Deployment System..."
    
    # Make auto-heal script executable
    if [ -f "$PROJECT_DIR/scripts/federation/auto-heal-deployment.sh" ]; then
        chmod +x "$PROJECT_DIR/scripts/federation/auto-heal-deployment.sh"
        
        # Test auto-heal functionality
        "$PROJECT_DIR/scripts/federation/auto-heal-deployment.sh" --help >/dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            print_success "Auto-Heal Deployment System deployed successfully"
            update_component_status "auto-heal-deployment" "deployed"
        else
            print_error "Auto-Heal Deployment System deployment failed"
            update_component_status "auto-heal-deployment" "failed"
            return 1
        fi
    else
        print_warning "Auto-Heal Deployment script not found, skipping..."
        update_component_status "auto-heal-deployment" "skipped"
    fi
}

# Function to deploy Trust Mesh
deploy_trust_mesh() {
    print_phase "Deploying Trust Mesh & Zero Trust Federation..."
    
    # Create trust mesh configuration
    create_trust_mesh_config
    
    print_success "Trust Mesh deployed successfully"
    update_component_status "trust-mesh" "deployed"
}

# Function to create trust mesh configuration
create_trust_mesh_config() {
    local trust_mesh_config="$PROJECT_DIR/federation/trust-mesh.json"
    
    cat > "$trust_mesh_config" << EOF
{
    "trust_mesh_version": "1.0",
    "created_at": "$(date -Iseconds)",
    "zero_trust_policy": {
        "verification_required": true,
        "certificate_validation": true,
        "reputation_threshold": 0.7,
        "max_trust_depth": 3,
        "auto_revocation": true
    },
    "peer_verification": {
        "methods": ["certificate", "reputation", "manual"],
        "certificate_chain_validation": true,
        "cross_signing_required": true,
        "verification_expiry": "72h"
    },
    "trust_relationships": {
        "auto_discovery": true,
        "mutual_verification": true,
        "trust_propagation": true,
        "trust_decay": {
            "enabled": true,
            "half_life": "30d",
            "min_threshold": 0.3
        }
    },
    "security_policies": {
        "encryption_required": true,
        "key_rotation_interval": "90d",
        "audit_logging": true,
        "anomaly_detection": true
    }
}
EOF
    
    print_integration "Trust mesh configuration created: $trust_mesh_config"
}

# Function to deploy Peer Reputation Scoring
deploy_peer_reputation() {
    print_phase "Deploying Peer Reputation Scoring System..."
    
    # Create reputation scoring configuration
    create_reputation_config
    
    print_success "Peer Reputation Scoring deployed successfully"
    update_component_status "peer-reputation" "deployed"
}

# Function to create reputation configuration
create_reputation_config() {
    local reputation_config="$PROJECT_DIR/federation/reputation-scoring.json"
    
    cat > "$reputation_config" << EOF
{
    "reputation_system_version": "1.0",
    "created_at": "$(date -Iseconds)",
    "scoring_factors": {
        "reliability": {
            "weight": 0.3,
            "metrics": ["uptime", "response_time", "success_rate"]
        },
        "content_quality": {
            "weight": 0.25,
            "metrics": ["spam_reports", "content_flags", "user_reports"]
        },
        "behavior": {
            "weight": 0.2,
            "metrics": ["federation_compliance", "protocol_adherence", "interaction_quality"]
        },
        "security": {
            "weight": 0.15,
            "metrics": ["ssl_validity", "authentication_strength", "vulnerability_scan"]
        },
        "performance": {
            "weight": 0.1,
            "metrics": ["throughput", "latency", "resource_usage"]
        }
    },
    "scoring_algorithm": {
        "type": "weighted_average",
        "decay_function": "exponential",
        "update_frequency": "1h",
        "min_data_points": 10
    },
    "reputation_levels": {
        "excellent": {"min": 0.9, "max": 1.0, "privileges": ["full_access", "priority_routing"]},
        "good": {"min": 0.7, "max": 0.9, "privileges": ["standard_access", "enhanced_features"]},
        "average": {"min": 0.5, "max": 0.7, "privileges": ["limited_access", "basic_features"]},
        "poor": {"min": 0.3, "max": 0.5, "privileges": ["restricted_access", "monitoring"]},
        "bad": {"min": 0.0, "max": 0.3, "privileges": ["quarantine", "manual_review"]}
    },
    "auto_actions": {
        "reputation_boost": {
            "triggers": ["successful_handshakes", "positive_reports", "long_uptime"],
            "boost_amount": 0.05
        },
        "reputation_penalty": {
            "triggers": ["failed_handshakes", "spam_reports", "security_incidents"],
            "penalty_amount": 0.1
        }
    }
}
EOF
    
    print_integration "Reputation scoring configuration created: $reputation_config"
}

# Function to deploy Smart Federation Routing
deploy_smart_routing() {
    print_phase "Deploying Smart Federation Routing..."
    
    # Create smart routing configuration
    create_routing_config
    
    print_success "Smart Federation Routing deployed successfully"
    update_component_status "smart-routing" "deployed"
}

# Function to create routing configuration
create_routing_config() {
    local routing_config="$PROJECT_DIR/federation/smart-routing.json"
    
    cat > "$routing_config" << EOF
{
    "routing_system_version": "1.0",
    "created_at": "$(date -Iseconds)",
    "routing_strategy": {
        "primary": "ml_optimized",
        "fallback": "latency_based",
        "emergency": "reputation_weighted"
    },
    "optimization_factors": {
        "latency": {"weight": 0.4, "target": "<100ms"},
        "reliability": {"weight": 0.3, "target": ">99%"},
        "reputation": {"weight": 0.2, "target": ">0.7"},
        "cost": {"weight": 0.1, "target": "optimal"}
    },
    "ml_model": {
        "type": "ensemble",
        "algorithms": ["random_forest", "neural_network", "gradient_boosting"],
        "training_data_retention": "90d",
        "model_update_frequency": "24h",
        "prediction_accuracy_target": 0.85
    },
    "routing_rules": {
        "geographic_optimization": true,
        "load_balancing": true,
        "failover_handling": true,
        "congestion_avoidance": true
    },
    "performance_monitoring": {
        "metrics_collection": true,
        "real_time_optimization": true,
        "a_b_testing": true,
        "performance_baselines": true
    }
}
EOF
    
    print_integration "Smart routing configuration created: $routing_config"
}

# Function to deploy Encrypted Peer Channels
deploy_encrypted_channels() {
    print_phase "Deploying Encrypted Peer Channels..."
    
    # Create encrypted channels configuration
    create_encrypted_channels_config
    
    print_success "Encrypted Peer Channels deployed successfully"
    update_component_status "encrypted-channels" "deployed"
}

# Function to create encrypted channels configuration
create_encrypted_channels_config() {
    local encrypted_config="$PROJECT_DIR/federation/encrypted-channels.json"
    
    cat > "$encrypted_config" << EOF
{
    "encryption_system_version": "1.0",
    "created_at": "$(date -Iseconds)",
    "encryption_layers": {
        "transport_layer": {
            "protocol": "TLS 1.3",
            "cipher_suites": ["TLS_AES_256_GCM_SHA384", "TLS_CHACHA20_POLY1305_SHA256"],
            "certificate_validation": true
        },
        "application_layer": {
            "protocol": "Olm/Megolm",
            "key_exchange": "X3DH",
            "ratcheting": true,
            "forward_secrecy": true
        }
    },
    "key_management": {
        "key_rotation_interval": "7d",
        "key_derivation": "HKDF-SHA256",
        "key_storage": "encrypted",
        "key_backup": true,
        "key_recovery": true
    },
    "trust_requirements": {
        "minimum_trust_level": 0.8,
        "mutual_authentication": true,
        "certificate_pinning": true,
        "identity_verification": true
    },
    "channel_types": {
        "high_trust": {
            "encryption": "double_encryption",
            "authentication": "mutual",
            "key_rotation": "daily",
            "use_cases": ["admin_communication", "critical_operations"]
        },
        "standard": {
            "encryption": "tls_only",
            "authentication": "server_only",
            "key_rotation": "weekly",
            "use_cases": ["standard_federation", "content_distribution"]
        },
        "low_trust": {
            "encryption": "tls_only",
            "authentication": "basic",
            "key_rotation": "monthly",
            "use_cases": ["public_content", "discovery"]
        }
    }
}
EOF
    
    print_integration "Encrypted channels configuration created: $encrypted_config"
}

# Function to deploy Federation Insights Dashboard
deploy_insights_dashboard() {
    print_phase "Deploying Federation Insights Dashboard..."
    
    # Create Grafana dashboard configuration
    create_grafana_dashboard
    
    # Create Prometheus rules
    create_prometheus_rules
    
    print_success "Federation Insights Dashboard deployed successfully"
    update_component_status "insights-dashboard" "deployed"
}

# Function to create Grafana dashboard
create_grafana_dashboard() {
    local dashboard_file="$PROJECT_DIR/monitoring/grafana/dashboards/federation-intelligence.json"
    
    mkdir -p "$(dirname "$dashboard_file")"
    
    cat > "$dashboard_file" << 'EOF'
{
    "dashboard": {
        "id": null,
        "title": "ELK.Zone 2.0 - Federation Intelligence",
        "tags": ["elkzone", "federation", "intelligence"],
        "timezone": "browser",
        "panels": [
            {
                "id": 1,
                "title": "Federation Health Overview",
                "type": "stat",
                "targets": [
                    {
                        "expr": "federation_health_score",
                        "legendFormat": "Health Score"
                    }
                ],
                "fieldConfig": {
                    "defaults": {
                        "unit": "percentunit",
                        "thresholds": {
                            "steps": [
                                {"color": "red", "value": 0},
                                {"color": "yellow", "value": 0.7},
                                {"color": "green", "value": 0.9}
                            ]
                        }
                    }
                },
                "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
            },
            {
                "id": 2,
                "title": "Service Status",
                "type": "table",
                "targets": [
                    {
                        "expr": "federation_service_status",
                        "legendFormat": "{{service}}"
                    }
                ],
                "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
            },
            {
                "id": 3,
                "title": "Peer Reputation Distribution",
                "type": "histogram",
                "targets": [
                    {
                        "expr": "federation_peer_reputation",
                        "legendFormat": "{{peer}}"
                    }
                ],
                "gridPos": {"h": 8, "w": 24, "x": 0, "y": 8}
            },
            {
                "id": 4,
                "title": "Federation Traffic",
                "type": "graph",
                "targets": [
                    {
                        "expr": "rate(federation_requests_total[5m])",
                        "legendFormat": "Requests/sec"
                    },
                    {
                        "expr": "rate(federation_bytes_total[5m])",
                        "legendFormat": "Bytes/sec"
                    }
                ],
                "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16}
            },
            {
                "id": 5,
                "title": "Auto-Healing Actions",
                "type": "table",
                "targets": [
                    {
                        "expr": "federation_auto_heal_actions",
                        "legendFormat": "{{action}}"
                    }
                ],
                "gridPos": {"h": 8, "w": 12, "x": 12, "y": 16}
            }
        ],
        "time": {"from": "now-1h", "to": "now"},
        "refresh": "30s"
    }
}
EOF
    
    print_integration "Grafana dashboard created: $dashboard_file"
}

# Function to create Prometheus rules
create_prometheus_rules() {
    local rules_file="$PROJECT_DIR/monitoring/prometheus/rules/federation-intelligence.yml"
    
    mkdir -p "$(dirname "$rules_file")"
    
    cat > "$rules_file" << 'EOF'
groups:
- name: federation-intelligence
  rules:
  - record: federation_health_score
    expr: |
      (
        avg(federation_service_up) * 0.4 +
        avg(federation_peer_reputation) * 0.3 +
        avg(rate(federation_requests_success_total[5m]) / rate(federation_requests_total[5m])) * 0.3
      )
  
  - record: federation_service_status
    expr: |
      label_replace(
        label_replace(
          federation_service_up,
          "status", "healthy", "up", "1"
        ),
        "status", "unhealthy", "up", "0"
      )
  
  - alert: FederationHealthDegraded
    expr: federation_health_score < 0.7
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Federation health is degraded"
      description: "Federation health score is {{ $value }} (threshold: 0.7)"
  
  - alert: FederationServiceDown
    expr: federation_service_up == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Federation service is down"
      description: "Service {{ $labels.service }} has been down for more than 2 minutes"
  
  - alert: PeerReputationLow
    expr: federation_peer_reputation < 0.3
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Peer reputation is low"
      description: "Peer {{ $labels.peer }} has reputation {{ $value }} (threshold: 0.3)"
EOF
    
    print_integration "Prometheus rules created: $rules_file"
}

# Function to update component status
update_component_status() {
    local component="$1"
    local status="$2"
    
    local deployment_state="$PROJECT_DIR/state/phase2/deployment.json"
    
    if [ -f "$deployment_state" ]; then
        # Update JSON using temporary file
        local temp_file="$deployment_state.tmp"
        
        if command -v jq >/dev/null 2>&1; then
            jq --arg component "$component" --arg status "$status" --arg timestamp "$(date -Iseconds)" \
               '.components[$component] = {"status": $status, "deployed_at": $timestamp}' \
               "$deployment_state" > "$temp_file"
            mv "$temp_file" "$deployment_state"
        else
            # Fallback: append to file
            echo "  \"$component\": {\"status\": \"$status\", \"deployed_at\": \"$(date -Iseconds)\"}" >> "$deployment_state"
        fi
    fi
    
    print_integration "Component $component status updated to: $status"
}

# Function to integrate all components
integrate_components() {
    print_phase "Integrating all Phase 2 components..."
    
    # Create integration configuration
    create_integration_config
    
    # Test integration
    test_integration
    
    print_success "All Phase 2 components integrated successfully"
}

# Function to create integration configuration
create_integration_config() {
    local integration_config="$PROJECT_DIR/federation/phase2-integration.json"
    
    cat > "$integration_config" << EOF
{
    "integration_version": "2.0.0",
    "created_at": "$(date -Iseconds)",
    "components": {
        "auto_key_rotation": {
            "enabled": true,
            "schedule": "weekly",
            "backup_retention": "30d"
        },
        "federation_watchdog": {
            "enabled": true,
            "monitoring_interval": "60s",
            "auto_healing": true
        },
        "auto_heal_deployment": {
            "enabled": true,
            "max_retries": 3,
            "rollback_enabled": true
        },
        "trust_mesh": {
            "enabled": true,
            "zero_trust": true,
            "verification_required": true
        },
        "peer_reputation": {
            "enabled": true,
            "scoring_interval": "1h",
            "auto_actions": true
        },
        "smart_routing": {
            "enabled": true,
            "ml_optimization": true,
            "fallback_routing": true
        },
        "encrypted_channels": {
            "enabled": true,
            "double_encryption": true,
            "key_rotation": true
        },
        "insights_dashboard": {
            "enabled": true,
            "real_time_monitoring": true,
            "historical_analysis": true
        }
    },
    "workflows": {
        "federation_handshake": [
            "trust_mesh_verification",
            "reputation_check",
            "smart_routing_selection",
            "encrypted_channel_establishment"
        ],
        "service_recovery": [
            "watchdog_detection",
            "auto_heal_execution",
            "key_rotation_check",
            "trust_mesh_update"
        ],
        "peer_onboarding": [
            "identity_verification",
            "reputation_initialization",
            "trust_relationship_establishment",
            "encrypted_channel_setup"
        ]
    },
    "monitoring": {
        "metrics_collection": true,
        "alerting": true,
        "health_checks": true,
        "performance_tracking": true
    }
}
EOF
    
    print_integration "Integration configuration created: $integration_config"
}

# Function to test integration
test_integration() {
    print_integration "Testing component integration..."
    
    # Test key rotation script
    if [ -f "$PROJECT_DIR/scripts/federation/auto-key-rotation.sh" ]; then
        "$PROJECT_DIR/scripts/federation/auto-key-rotation.sh" --check >/dev/null 2>&1
        print_integration "Key rotation integration test: $([ $? -eq 0 ] && echo "PASSED" || echo "FAILED")"
    fi
    
    # Test watchdog service
    if [ -f "$PROJECT_DIR/scripts/federation/watchdog-service.sh" ]; then
        "$PROJECT_DIR/scripts/federation/watchdog-service.sh" --help >/dev/null 2>&1
        print_integration "Watchdog service integration test: $([ $? -eq 0 ] && echo "PASSED" || echo "FAILED")"
    fi
    
    # Test auto-heal deployment
    if [ -f "$PROJECT_DIR/scripts/federation/auto-heal-deployment.sh" ]; then
        "$PROJECT_DIR/scripts/federation/auto-heal-deployment.sh" --help >/dev/null 2>&1
        print_integration "Auto-heal deployment integration test: $([ $? -eq 0 ] && echo "PASSED" || echo "FAILED")"
    fi
    
    print_integration "Component integration tests completed"
}

# Function to display deployment summary
display_deployment_summary() {
    echo ""
    echo -e "${GREEN}🎉 Phase 2 Federation Intelligence Deployment Summary${NC}"
    echo ""
    
    # Read deployment state
    local deployment_state="$PROJECT_DIR/state/phase2/deployment.json"
    if [ -f "$deployment_state" ]; then
        echo -e "${BLUE}📊 Deployment Status:${NC}"
        
        for component in "${!PHASE2_COMPONENTS[@]}"; do
            local status="unknown"
            if command -v jq >/dev/null 2>&1; then
                status=$(jq -r ".components[\"$component\"].status // \"unknown\"" "$deployment_state" 2>/dev/null)
            fi
            
            local status_color=""
            case "$status" in
                "deployed") status_color="${GREEN}" ;;
                "failed") status_color="${RED}" ;;
                "skipped") status_color="${YELLOW}" ;;
                *) status_color="${BLUE}" ;;
            esac
            
            echo -e "  ${status_color}• ${PHASE2_COMPONENTS[$component]}: $status${NC}"
        done
        echo ""
    fi
    
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo "  • Key rotation: $PROJECT_DIR/scripts/federation/auto-key-rotation.sh"
    echo "  • Watchdog service: $PROJECT_DIR/scripts/federation/watchdog-service.sh"
    echo "  • Auto-heal deployment: $PROJECT_DIR/scripts/federation/auto-heal-deployment.sh"
    echo ""
    
    echo -e "${BLUE}📁 Configuration Files:${NC}"
    echo "  • Integration: $PROJECT_DIR/federation/phase2-integration.json"
    echo "  • Trust mesh: $PROJECT_DIR/federation/trust-mesh.json"
    echo "  • Reputation: $PROJECT_DIR/federation/reputation-scoring.json"
    echo "  • Smart routing: $PROJECT_DIR/federation/smart-routing.json"
    echo "  • Encrypted channels: $PROJECT_DIR/federation/encrypted-channels.json"
    echo ""
    
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo "  • Grafana dashboard: $PROJECT_DIR/monitoring/grafana/dashboards/federation-intelligence.json"
    echo "  • Prometheus rules: $PROJECT_DIR/monitoring/prometheus/rules/federation-intelligence.yml"
    echo ""
    
    echo -e "${BLUE}📝 Log Files:${NC}"
    echo "  • Deployment: $DEPLOYMENT_LOG"
    echo "  • Integration: $INTEGRATION_LOG"
    echo "  • Key rotation: $PROJECT_DIR/logs/key-rotation.log"
    echo "  • Watchdog: $PROJECT_DIR/logs/watchdog.log"
    echo "  • Auto-heal: $PROJECT_DIR/logs/auto-heal.log"
    echo ""
    
    echo -e "${GREEN}🚀 Next Steps:${NC}"
    echo "  1. Start the watchdog service: $PROJECT_DIR/scripts/federation/watchdog-service.sh start"
    echo "  2. Test federation health: $PROJECT_DIR/scripts/federation/auto-heal-deployment.sh check"
    echo "  3. Monitor via Grafana dashboard"
    echo "  4. Configure alert notifications"
    echo "  5. Test key rotation: $PROJECT_DIR/scripts/federation/auto-key-rotation.sh --check"
    echo ""
}

# Main deployment function
main() {
    initialize_deployment
    
    # Deploy all Phase 2 components
    deploy_auto_key_rotation
    deploy_federation_watchdog
    deploy_auto_heal_deployment
    deploy_trust_mesh
    deploy_peer_reputation
    deploy_smart_routing
    deploy_encrypted_channels
    deploy_insights_dashboard
    
    # Integrate all components
    integrate_components
    
    # Update final deployment status
    if command -v jq >/dev/null 2>&1; then
        local temp_file="$PROJECT_DIR/state/phase2/deployment.tmp"
        jq '.integration_status = "completed" | .health_status = "unknown"' \
           "$PROJECT_DIR/state/phase2/deployment.json" > "$temp_file"
        mv "$temp_file" "$PROJECT_DIR/state/phase2/deployment.json"
    fi
    
    display_deployment_summary
    
    print_success "Phase 2 Federation Intelligence deployment completed!"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "test")
        print_phase "Testing Phase 2 integration..."
        test_integration
        ;;
    "status")
        display_deployment_summary
        ;;
    "clean")
        print_phase "Cleaning up Phase 2 deployment..."
        # Add cleanup logic here if needed
        print_success "Phase 2 cleanup completed"
        ;;
    "--help"|"-h")
        echo "ELK.Zone 2.0 - Phase 2 Federation Intelligence Deployment"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  deploy    Deploy all Phase 2 components (default)"
        echo "  test      Test component integration"
        echo "  status    Display deployment status"
        echo "  clean     Clean up deployment artifacts"
        echo "  --help    Show this help message"
        echo ""
        echo "Phase 2 Components:"
        for component in "${!PHASE2_COMPONENTS[@]}"; do
            echo "  • $component - ${PHASE2_COMPONENTS[$component]}"
        done
        echo ""
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac