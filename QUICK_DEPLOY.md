# Quick Deployment Guide

## Option 1: Automated Setup (Recommended)

On your production server:

```bash
# 1. Pull latest code
git pull origin main

# 2. Run setup script (generates .env with random secrets)
./setup-production-env.sh

# 3. Deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Watch logs
docker compose logs -f hubble-traefik | grep -i acme
```

Done! Access https://hubble.noelvega.dev

---

## Option 2: Manual Setup

### Step 1: Create .env file

Copy the content from `env.production.template` and save as `.env`:

```bash
cat > .env << 'ENVEOF'
# Paste contents of env.production.template here
ENVIRONMENT=production
ADMIN_USERNAME=noel
ADMIN_PASSWORD=Spring120894$
# ... rest of the file
ENVEOF
```

### Step 2: Generate JWT Secrets

Replace the placeholder secrets:

```bash
# Generate secrets
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)"

# Update .env file with these values
```

### Step 3: Deploy

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Verify Deployment

```bash
# Check services
docker compose ps

# Check HTTPS
curl -I https://hubble.noelvega.dev

# Check certificate
openssl s_client -connect hubble.noelvega.dev:443 -servername hubble.noelvega.dev < /dev/null 2>&1 | grep "issuer"
# Should show: "issuer=C = US, O = Let's Encrypt"
```

---

## Files Reference

- `env.production.template` - Template with your production values (copy-paste ready)
- `setup-production-env.sh` - Automated script (generates .env with secrets)
- `PRE_DEPLOYMENT_CHECKLIST.md` - Detailed deployment guide
- `docker-compose.prod.yml` - Production HTTPS configuration
