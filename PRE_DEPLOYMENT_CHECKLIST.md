# Pre-Deployment Checklist for Production

Use this checklist before deploying Hubble to production (noelvega.dev).

## ✅ Verification Complete - Ready to Deploy!

### Local Testing Results
- [x] Development setup works (HTTP on localhost)
- [x] All services start successfully
- [x] Traefik routing verified for:
  - [x] Web UI: `http://hubble.localhost` → 200 OK
  - [x] API: `http://hubble.localhost/api/*` → Routes correctly
  - [x] Registry: `http://registry.localhost` → Auth working
- [x] Production config validated (HTTPS enabled)
- [x] docker-compose.prod.yml override verified
- [x] Platform tests pass

---

## Production Deployment Steps

### 1. DNS Configuration (BEFORE deployment)

Verify DNS records point to your server:

```bash
# Check from your local machine
dig hubble.noelvega.dev +short
dig registry.noelvega.dev +short

# Both should return your server IP
```

**Required DNS Records:**
```
A    hubble.noelvega.dev    → YOUR_SERVER_IP
A    registry.noelvega.dev  → YOUR_SERVER_IP
```

### 2. Server Preparation

SSH into your production server and navigate to the project:

```bash
ssh your-server
cd /path/to/hubble
git pull origin main
```

### 3. Environment Configuration

Create `.env` file for production:

```bash
cat > .env << 'EOF'
# Production Environment
ENVIRONMENT=production

# Admin Credentials
ADMIN_USERNAME=noel
ADMIN_PASSWORD=Spring120894$

# JWT Secrets (GENERATE NEW ONES!)
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Token Duration
ACCESS_TOKEN_DURATION=10m
REFRESH_TOKEN_DURATION=168h

# Projects
PROJECTS_ROOT_PATH=/projects

# Domain Configuration (REQUIRED for HTTPS)
HUBBLE_DOMAIN=noelvega.dev
HUBBLE_TRAEFIK_EMAIL=noelvegajr94@gmail.com

# Registry
HUBBLE_REGISTRY_DELETE_ENABLED=true
EOF
```

**IMPORTANT:** Generate new JWT secrets:
```bash
sed -i "s/JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=$(openssl rand -base64 32)/" .env
sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$(openssl rand -base64 32)/" .env
```

### 4. Pre-Deployment Checks

Run these commands to verify configuration:

```bash
# Verify environment variables
source .env && echo "Domain: $HUBBLE_DOMAIN" && echo "Email: $HUBBLE_TRAEFIK_EMAIL"

# Validate docker-compose config
docker compose -f docker-compose.yml -f docker-compose.prod.yml config --quiet
echo "✓ Config valid"

# Check ports are available
sudo netstat -tulpn | grep -E ':80|:443'
# Should show nothing or existing services you want to replace
```

### 5. Deploy Production Stack

```bash
# Stop any existing services
docker compose down

# Start with production configuration
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Watch the startup
docker compose logs -f
```

### 6. Monitor Let's Encrypt Certificate Generation

In a separate terminal, watch Traefik obtain certificates:

```bash
docker compose logs -f hubble-traefik | grep -i acme
```

You should see:
```
[acme] Trying to solve HTTP-01 challenge
[acme] The server validated our request
[acme] Certificates obtained for domains [hubble.noelvega.dev]
[acme] Certificates obtained for domains [registry.noelvega.dev]
```

This takes 30-60 seconds.

### 7. Verify Deployment

**From your local machine:**

```bash
# Test HTTPS (should show 200 OK with valid certificate)
curl -I https://hubble.noelvega.dev

# Test API
curl -I https://hubble.noelvega.dev/api/auth/refresh

# Test Registry
curl -I https://registry.noelvega.dev/v2/

# Check certificate
openssl s_client -connect hubble.noelvega.dev:443 -servername hubble.noelvega.dev < /dev/null 2>&1 | grep "subject\|issuer"
# Should show "issuer=C = US, O = Let's Encrypt"
```

**From browser:**
- Open https://hubble.noelvega.dev
- Check for 🔒 padlock (secure)
- Click padlock → Certificate should show "Let's Encrypt"

### 8. Test Docker Registry

```bash
# Login to your private registry
docker login registry.noelvega.dev -u noel -p Spring120894$

# Tag and push a test image
docker tag nginx:alpine registry.noelvega.dev/test-nginx:latest
docker push registry.noelvega.dev/test-nginx:latest

# Verify in registry
curl -u noel:Spring120894$ https://registry.noelvega.dev/v2/_catalog
# Should show: {"repositories":["test-nginx"]}
```

### 9. Verify All Services

```bash
# On server
docker compose ps

# All services should show "Up" status:
# - hubble-server
# - hubble-web  
# - hubble-traefik
# - hubble-registry
```

---

## Troubleshooting

### Certificate Not Generated

**Check DNS:**
```bash
dig hubble.noelvega.dev +short
# Must return your server IP
```

**Check Traefik logs:**
```bash
docker compose logs hubble-traefik | grep -i error
```

**Common issues:**
- DNS not propagated (wait 5-10 minutes)
- Firewall blocking ports 80/443
- Email not set in .env

### "Site Not Secure" in Browser

**Check certificate was generated:**
```bash
docker compose exec hubble-traefik cat /data/acme.json | jq '.letsencrypt.Certificates'
```

Should show certificates for your domains.

**If empty, check:**
```bash
# Verify email is set
docker compose exec hubble-traefik env | grep EMAIL

# Check Let's Encrypt is reachable
docker compose exec hubble-traefik wget -O- https://acme-v02.api.letsencrypt.org/directory
```

### Services Not Accessible

**Check Traefik routing:**
```bash
# From server
curl -H "Host: hubble.noelvega.dev" http://localhost
```

**Check service labels:**
```bash
docker inspect hubble-server | grep traefik
docker inspect hubble-web | grep traefik
docker inspect hubble-registry | grep traefik
```

---

## Rollback Plan

If deployment fails:

```bash
# Stop production stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Restart in development mode (if needed)
docker compose up -d
```

Data is preserved in Docker volumes:
- hubble-traefik-data (certificates)
- hubble-registry-data (images)
- hubble-projects (project files)

---

## Post-Deployment

### Monitor Logs
```bash
docker compose logs -f
```

### Check Resource Usage
```bash
docker stats
```

### Backup Certificates
```bash
docker compose exec hubble-traefik cat /data/acme.json > acme-backup-$(date +%Y%m%d).json
```

### Update DNS (if needed)
If migrating from another service, update DNS after verifying everything works.

---

## Success Criteria

✅ All services running (`docker compose ps` shows "Up")  
✅ HTTPS working (https://hubble.noelvega.dev shows padlock)  
✅ Let's Encrypt certificates obtained (check Traefik logs)  
✅ Registry login works (`docker login registry.noelvega.dev`)  
✅ Can push/pull images to registry  
✅ Web UI accessible and functional  

**Ready to deploy!** 🚀
