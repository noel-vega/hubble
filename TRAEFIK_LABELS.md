# Traefik Labels Support

## Overview
Services can now be configured with Docker labels, enabling automatic Traefik reverse proxy configuration.

## Quick Example

```bash
curl -X POST http://localhost:5000/projects/my-app/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "blog",
    "image": "registry.noelvega.dev/blog:main",
    "container_name": "app-blog",
    "networks": ["infra"],
    "labels": [
      "hubble.app=blog",
      "traefik.enable=true",
      "traefik.http.routers.blog.rule=Host(`blog.noelvega.dev`)",
      "traefik.http.routers.blog.entrypoints=websecure",
      "traefik.http.routers.blog.tls.certresolver=letsencrypt",
      "traefik.http.services.blog.loadbalancer.server.port=80"
    ],
    "restart": "unless-stopped"
  }'
```

## Common Traefik Label Patterns

### Basic HTTP Service
```json
{
  "labels": [
    "traefik.enable=true",
    "traefik.http.routers.myapp.rule=Host(`app.example.com`)",
    "traefik.http.services.myapp.loadbalancer.server.port=80"
  ]
}
```

### HTTPS with Let's Encrypt
```json
{
  "labels": [
    "traefik.enable=true",
    "traefik.http.routers.myapp.rule=Host(`app.example.com`)",
    "traefik.http.routers.myapp.entrypoints=websecure",
    "traefik.http.routers.myapp.tls.certresolver=letsencrypt",
    "traefik.http.services.myapp.loadbalancer.server.port=80"
  ]
}
```

### Multiple Domains
```json
{
  "labels": [
    "traefik.enable=true",
    "traefik.http.routers.myapp.rule=Host(`app.example.com`) || Host(`www.example.com`)",
    "traefik.http.routers.myapp.entrypoints=websecure",
    "traefik.http.routers.myapp.tls.certresolver=letsencrypt",
    "traefik.http.services.myapp.loadbalancer.server.port=80"
  ]
}
```

### Path-based Routing
```json
{
  "labels": [
    "traefik.enable=true",
    "traefik.http.routers.api.rule=Host(`example.com`) && PathPrefix(`/api`)",
    "traefik.http.routers.api.entrypoints=websecure",
    "traefik.http.routers.api.tls.certresolver=letsencrypt",
    "traefik.http.services.api.loadbalancer.server.port=3000"
  ]
}
```

### With Middleware (Auth, CORS, etc.)
```json
{
  "labels": [
    "traefik.enable=true",
    "traefik.http.routers.admin.rule=Host(`admin.example.com`)",
    "traefik.http.routers.admin.entrypoints=websecure",
    "traefik.http.routers.admin.tls.certresolver=letsencrypt",
    "traefik.http.routers.admin.middlewares=auth@file",
    "traefik.http.services.admin.loadbalancer.server.port=8080"
  ]
}
```

## Generated docker-compose.yml

The above example generates:

```yaml
services:
  blog:
    container_name: app-blog
    image: registry.noelvega.dev/blog:main
    labels:
      - hubble.app=blog
      - traefik.enable=true
      - traefik.http.routers.blog.rule=Host(`blog.noelvega.dev`)
      - traefik.http.routers.blog.entrypoints=websecure
      - traefik.http.routers.blog.tls.certresolver=letsencrypt
      - traefik.http.services.blog.loadbalancer.server.port=80
    networks:
      - infra
    restart: unless-stopped
```

## Field Reference

- `labels` - Array of string labels in `key=value` format
- `container_name` - Optional custom container name

## Notes

- Labels are written to docker-compose.yml exactly as provided
- Traefik must be running and connected to the same Docker network
- The `infra` network in examples should match your Traefik network name
- Router names (e.g., `blog` in `traefik.http.routers.blog...`) should match service name for clarity

## Resources

- [Traefik Docker Labels Documentation](https://doc.traefik.io/traefik/routing/providers/docker/)
- [Let's Encrypt with Traefik](https://doc.traefik.io/traefik/https/acme/)
