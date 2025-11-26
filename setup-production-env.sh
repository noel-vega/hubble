#!/bin/bash
# Quick script to generate production .env with proper secrets

set -e

echo "🔐 Generating production .env file..."
echo ""

# Generate random secrets
ACCESS_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << ENVEOF
# Production Environment Configuration for noelvega.dev
# Generated: $(date)

# Application Environment
ENVIRONMENT=production

# Admin User Credentials
ADMIN_USERNAME=noel
ADMIN_PASSWORD=Spring120894$

# JWT Secrets (Auto-generated)
JWT_ACCESS_SECRET=$ACCESS_SECRET
JWT_REFRESH_SECRET=$REFRESH_SECRET

# Token Duration
ACCESS_TOKEN_DURATION=10m
REFRESH_TOKEN_DURATION=168h

# Projects Configuration
PROJECTS_ROOT_PATH=/projects

# Platform Domain (REQUIRED for HTTPS)
HUBBLE_DOMAIN=noelvega.dev

# Traefik HTTPS Configuration (REQUIRED for Let's Encrypt)
HUBBLE_TRAEFIK_EMAIL=noelvegajr94@gmail.com

# Registry Configuration
HUBBLE_REGISTRY_DELETE_ENABLED=true

# External Registry (Optional - leave empty if not using)
REGISTRY_URL=
REGISTRY_USERNAME=
REGISTRY_PASSWORD=
ENVEOF

echo "✅ Production .env created with random JWT secrets"
echo ""
echo "📋 Configuration:"
echo "  Domain: noelvega.dev"
echo "  Email: noelvegajr94@gmail.com"
echo "  Admin: noel"
echo ""
echo "🔒 Secrets generated:"
echo "  JWT_ACCESS_SECRET: ${ACCESS_SECRET:0:20}..."
echo "  JWT_REFRESH_SECRET: ${REFRESH_SECRET:0:20}..."
echo ""
echo "Next steps:"
echo "  1. Review .env file"
echo "  2. Deploy: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo ""
