#!/bin/bash

# 🚀 AI SEO Chat App - Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting AI SEO Chat App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the ai-seo-chat directory"
    exit 1
fi

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Shopify CLI is installed
if ! command -v shopify &> /dev/null; then
    print_warning "Shopify CLI not found. Installing..."
    npm install -g @shopify/cli @shopify/theme
fi

print_success "Prerequisites check completed"

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 3: Run tests
print_status "Running pre-deployment tests..."

# Test database connection
print_status "Testing database connection..."
if npm run test:database; then
    print_success "Database connection test passed"
else
    print_error "Database connection test failed"
    exit 1
fi

# Test Redis connection
print_status "Testing Redis connection..."
if npm run test:redis; then
    print_success "Redis connection test passed"
else
    print_error "Redis connection test failed"
    exit 1
fi

# Test Supabase connection
print_status "Testing Supabase connection..."
if npm run test:supabase; then
    print_success "Supabase connection test passed"
else
    print_error "Supabase connection test failed"
    exit 1
fi

print_success "All pre-deployment tests passed"

# Step 4: Build the app
print_status "Building the app..."
npm run build
print_success "App built successfully"

# Step 5: Deploy to Shopify
print_status "Deploying to Shopify..."
npm run deploy
print_success "App deployed to Shopify!"

# Step 6: Post-deployment checks
print_status "Running post-deployment checks..."

# Check if app is accessible
print_status "Checking app accessibility..."
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL" | grep -q "200\|302"; then
    print_success "App is accessible"
else
    print_warning "App accessibility check failed - this might be normal during deployment"
fi

print_success "Deployment completed successfully! 🎉"

echo ""
echo "📋 Next Steps:"
echo "1. Visit your Shopify Partners dashboard"
echo "2. Install the app on a development store"
echo "3. Test all features thoroughly"
echo "4. Configure the chat widget"
echo "5. Monitor performance and logs"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo "🐛 For troubleshooting, see the troubleshooting section in the guide"
echo ""
echo "🚀 Your AI SEO Chat app is now live!"
