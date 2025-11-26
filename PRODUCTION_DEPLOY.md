# Production Deployment Checklist

Use this checklist when deploying Hubble to your production server.

## Prerequisites

- [ ] Server with Docker and Docker Compose installed
- [ ] Domain name (e.g., `yourdomain.com`)
- [ ] DNS A records configured:
  - `hubble.yourdomain.com` → your server IP
  - `registry.yourdomain.com` → your server IP
- [ ] Ports 80 and 443 open on firewall
- [ ] Valid email address for Let's Encrypt

## Deployment Steps

### 1. SSH into Production Server

```bash
ssh user@your-server-ip
```

### 2. Clone Repository

```bash
git clone https://github.com/noel-vega/hubble
cd hubble
```

### 3. Configure Environment

```bash
# Use production template
cp .env.production .env

# Edit configuration
nano .env
```

**Required changes:**
- [ ] Update `ADMIN_PASSWORD` to a strong password (16+ chars)
- [ ] Generate `JWT_ACCESS_SECRET`: `openssl rand -base64 32`
- [ ] Generate `JWT_REFRESH_SECRET`: `openssl rand -base64 32`
- [ ] Set `HUBBLE_DOMAIN` to your domain (e.g., `yourdomain.com`)
- [ ] Set `HUBBLE_TRAEFIK_EMAIL` to your email
- [ ] Verify `HUBBLE_HTTPS_REDIRECT=https-redirect`
- [ ] Verify `HUBBLE_CERT_RESOLVER=letsencrypt`

### 4. Verify Configuration

```bash
# Check DNS is correct
dig +short hubble.yourdomain.com
dig +short registry.yourdomain.com
# Both should return your server's public IP

# Verify .env settings
grep HUBBLE_DOMAIN .env
grep HUBBLE_TRAEFIK_EMAIL .env
grep HUBBLE_HTTPS_REDIRECT .env
grep HUBBLE_CERT_RESOLVER .env
```

### 5. Start Services

```bash
docker compose up -d
```

### 6. Monitor Certificate Generation

```bash
docker compose logs -f hubble-traefik
```

Wait for these messages (takes 30-60 seconds):
```
[acme] Register...
[acme] Trying to solve HTTP-01
[acme] The server validated our request
```

Press `Ctrl+C` once you see successful certificate generation.

### 7. Verify HTTPS Works

```bash
# From your local machine (NOT the server)
curl -I https://hubble.yourdomain.com
curl -I https://registry.yourdomain.com
```

You should see `HTTP/2 200` or `HTTP/2 401` (authentication required for registry).

### 8. Test Login

Open your browser and visit:
```
https://hubble.yourdomain.com
```

Login with:
- Username: The `ADMIN_USERNAME` from your `.env`
- Password: The `ADMIN_PASSWORD` from your `.env`

## Post-Deployment

### Test Docker Registry

```bash
# From your local machine
docker login registry.yourdomain.com
# Username: <your ADMIN_USERNAME>
# Password: <your ADMIN_PASSWORD>

# Tag and push a test image
docker pull hello-world
docker tag hello-world registry.yourdomain.com/hello-world:latest
docker push registry.yourdomain.com/hello-world:latest
```

### Enable Firewall (if not already enabled)

```bash
# On the server
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Setup Automatic Backups

Backup these volumes:
```bash
docker volume ls | grep hubble
```

Example backup script:
```bash
#!/bin/bash
BACKUP_DIR=/backups/hubble/$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

docker run --rm -v hubble-projects:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/projects.tar.gz /data
docker run --rm -v hubble-registry-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/registry.tar.gz /data
docker run --rm -v hubble-traefik-data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/traefik.tar.gz /data
```

## Troubleshooting

### Certificate Generation Failed

Check Traefik logs:
```bash
docker compose logs hubble-traefik | grep -i error
```

Common issues:
- DNS not propagated yet (wait 5-10 minutes)
- Port 80 blocked by firewall
- Email not set in .env
- Wrong domain name

### "Site Not Secure" Warning

If using real domain and still seeing warnings:
1. Check `.env` has `HUBBLE_HTTPS_REDIRECT=https-redirect`
2. Check `.env` has `HUBBLE_CERT_RESOLVER=letsencrypt`
3. Check `HUBBLE_TRAEFIK_EMAIL` is set
4. Restart: `docker compose restart hubble-traefik`
5. Check logs: `docker compose logs hubble-traefik`

### Cannot Access Site

```bash
# Check all services are running
docker compose ps

# Check logs for errors
docker compose logs

# Verify DNS
dig hubble.yourdomain.com

# Test from server itself
curl -I http://localhost
```

## Updating Hubble

```bash
cd /path/to/hubble
git pull
docker compose pull
docker compose up -d
```

## Rolling Back

```bash
# Stop services
docker compose down

# Checkout previous version
git checkout <previous-commit>

# Restore .env if needed
cp .env.backup .env

# Restart
docker compose up -d
```

## Monitoring

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f hubble-server

# Last 100 lines
docker compose logs --tail=100
```

### Check Resource Usage

```bash
docker stats
```

### View Certificate Details

```bash
docker exec hubble-traefik cat /data/acme.json | jq '.letsencrypt.Certificates[0].domain'
```

## Security Recommendations

- [ ] Use strong passwords (16+ characters, mixed case, numbers, symbols)
- [ ] Never commit `.env` to git
- [ ] Keep `JWT_*_SECRET` values unique and random
- [ ] Enable UFW firewall
- [ ] Keep Docker and system updated
- [ ] Setup automatic security updates
- [ ] Monitor logs regularly
- [ ] Backup volumes regularly
- [ ] Use SSH keys instead of passwords
- [ ] Disable root SSH login

---

## Quick Reference

**Start:** `docker compose up -d`  
**Stop:** `docker compose down`  
**Logs:** `docker compose logs -f`  
**Restart:** `docker compose restart <service>`  
**Update:** `git pull && docker compose pull && docker compose up -d`
