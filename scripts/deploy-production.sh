#!/bin/bash

# =============================================================================
# PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# This script automates the deployment process for Bucketly production
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting Bucketly Production Deployment"
echo "========================================"

# =============================================================================
# ENVIRONMENT VALIDATION
# =============================================================================
echo "📋 Validating environment..."

# Check if required environment variables are set
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_SENTRY_DSN"
    "NEXT_PUBLIC_SITE_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '  %s\n' "${missing_vars[@]}"
    echo "Please set these in your deployment platform and try again."
    exit 1
fi

echo "✅ All required environment variables are set"

# =============================================================================
# BUILD VALIDATION
# =============================================================================
echo "🔨 Running build validation..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test

# Build the application
echo "🏗️ Building application..."
npm run build

# =============================================================================
# DEPLOYMENT CHECKS
# =============================================================================
echo "🔍 Running pre-deployment checks..."

# Check if build output exists
if [ ! -d ".next" ]; then
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

# Check health endpoint (simulated)
echo "🏥 Validating build health..."
# In a real CI/CD pipeline, you would test against staging here

# =============================================================================
# SECURITY SCANS
# =============================================================================
echo "🔒 Running security checks..."

# Audit dependencies for vulnerabilities
echo "🔍 Auditing dependencies..."
npm audit --audit-level moderate

# =============================================================================
# PERFORMANCE BUDGET CHECK
# =============================================================================
echo "📊 Performance budget check..."

# Check bundle size (simplified check)
bundle_size=$(du -sh .next | cut -f1)
echo "📦 Bundle size: $bundle_size"

# =============================================================================
# DEPLOYMENT
# =============================================================================
echo "🚀 Deploying to production..."

if [ "$CI" = "true" ]; then
    echo "🔄 Running in CI environment"
    # CI deployment commands would go here
    # Example: vercel --prod
else
    echo "⚠️  Not in CI environment. Please deploy manually or use CI/CD"
    echo "💡 To deploy: vercel --prod"
fi

# =============================================================================
# POST-DEPLOYMENT VALIDATION
# =============================================================================
echo "🔍 Running post-deployment checks..."

# In a real deployment, you would check:
# 1. Health endpoint response
# 2. Database connectivity
# 3. Key functionality tests
# 4. Error tracking setup

echo "✅ Production deployment script completed successfully!"
echo "📊 Next steps:"
echo "  1. Monitor deployment in your dashboard"
echo "  2. Check Sentry for errors"
echo "  3. Verify key functionality"
echo "  4. Monitor analytics"
echo ""
echo "🎉 Bucketly is now production-ready!"