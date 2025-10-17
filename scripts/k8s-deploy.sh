#!/bin/bash

# ELK.Zone 2.0 - Kubernetes Deployment Script
# This script handles the complete deployment to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${1:-"elkzone-prod"}
ENVIRONMENT=${2:-"production"}
REGISTRY="ghcr.io/your-org/elkzone"

echo -e "${GREEN}🚀 Deploying ELK.Zone 2.0 to Kubernetes${NC}"
echo -e "${BLUE}Namespace: ${NAMESPACE}${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"

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

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

# Create namespace if it doesn't exist
print_status "Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply secrets (need to be created manually first)
print_status "Applying secrets..."
if [ -f "k8s/secrets.yaml" ]; then
    kubectl apply -f k8s/secrets.yaml -n $NAMESPACE
else
    print_warning "secrets.yaml not found. Please create secrets manually."
fi

# Apply ConfigMaps
print_status "Applying ConfigMaps..."
kubectl apply -f k8s/configmap.yaml -n $NAMESPACE

# Apply storage
print_status "Applying storage configuration..."
kubectl apply -f k8s/storage.yaml -n $NAMESPACE

# Deploy applications
print_status "Deploying backend..."
kubectl apply -f k8s/backend-deployment.yaml -n $NAMESPACE

print_status "Deploying frontend..."
kubectl apply -f k8s/frontend-deployment.yaml -n $NAMESPACE

# Apply ingress
print_status "Applying ingress configuration..."
kubectl apply -f k8s/ingress.yaml -n $NAMESPACE

# Apply monitoring
print_status "Applying monitoring configuration..."
kubectl apply -f k8s/monitoring.yaml -n $NAMESPACE

# Wait for deployments to be ready
print_status "Waiting for deployments to be ready..."
kubectl rollout status deployment/elkzone-backend -n $NAMESPACE --timeout=600s
kubectl rollout status deployment/elkzone-frontend -n $NAMESPACE --timeout=600s

# Wait for pods to be ready
print_status "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=elkzone-backend -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=elkzone-frontend -n $NAMESPACE --timeout=300s

# Health checks
print_status "Performing health checks..."

# Get service URLs
BACKEND_URL=$(kubectl get ingress elkzone-ingress -n $NAMESPACE -o jsonpath='{.spec.rules[0].host}')
FRONTEND_URL=$BACKEND_URL

# Test backend health
print_status "Testing backend health..."
kubectl port-forward svc/elkzone-backend 4000:4000 -n $NAMESPACE &
PF_PID=$!
sleep 10

if curl -f -s http://localhost:4000/api/health > /dev/null; then
    print_status "✅ Backend health check passed"
else
    print_error "❌ Backend health check failed"
fi

kill $PF_PID 2>/dev/null || true

# Display deployment information
echo ""
echo -e "${GREEN}🎉 ELK.Zone 2.0 deployment completed successfully!${NC}"
echo ""
echo "📊 Service URLs:"
echo "  • Frontend: https://$FRONTEND_URL"
echo "  • Backend API: https://$FRONTEND_URL/api"
echo ""
echo "🔧 Management Commands:"
echo "  • View pods: kubectl get pods -n $NAMESPACE"
echo "  • View logs: kubectl logs -f deployment/elkzone-backend -n $NAMESPACE"
echo "  • Scale deployment: kubectl scale deployment elkzone-backend --replicas=5 -n $NAMESPACE"
echo "  • Check ingress: kubectl get ingress -n $NAMESPACE"
echo ""
echo "📈 Monitoring:"
echo "  • Check HPA status: kubectl get hpa -n $NAMESPACE"
echo "  • Check metrics: kubectl top pods -n $NAMESPACE"
echo "  • View alerts: kubectl get prometheusrules -n $NAMESPACE"
echo ""

# Show current status
print_status "Current deployment status:"
kubectl get pods -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE
echo ""
kubectl get ingress -n $NAMESPACE
echo ""
kubectl get hpa -n $NAMESPACE

echo -e "${GREEN}✅ Deployment is ready for production use!${NC}"