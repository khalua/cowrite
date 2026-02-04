# CoWrite Deployment Guide

## Prerequisites

- Dokku installed on your DigitalOcean droplet
- PostgreSQL plugin installed: `dokku plugin:install https://github.com/dokku/dokku-postgres.git`
- Redis plugin (for Action Cable): `dokku plugin:install https://github.com/dokku/dokku-redis.git`

## Initial Setup on Dokku Server

SSH into your Dokku server and run:

```bash
# Create the app
dokku apps:create cowrite

# Create and link PostgreSQL
dokku postgres:create cowrite-db
dokku postgres:link cowrite-db cowrite

# Create and link Redis (for Action Cable)
dokku redis:create cowrite-redis
dokku redis:link cowrite-redis cowrite

# Set environment variables
dokku config:set cowrite RAILS_ENV=production
dokku config:set cowrite RAILS_LOG_TO_STDOUT=true
dokku config:set cowrite RAILS_SERVE_STATIC_FILES=true
dokku config:set cowrite SECRET_KEY_BASE=$(openssl rand -hex 64)

# Set super admin credentials
dokku config:set cowrite ADMIN_EMAIL=your-admin@email.com
dokku config:set cowrite ADMIN_PASSWORD=your-secure-password

# Set frontend URL for CORS
dokku config:set cowrite FRONTEND_URL=https://cowrite.your-domain.com

# Configure domain (optional)
dokku domains:add cowrite cowrite.your-domain.com

# Enable SSL with Let's Encrypt (optional but recommended)
dokku letsencrypt:enable cowrite
```

## Deploy from Local Machine

```bash
# Add Dokku remote (replace with your server IP)
git remote add dokku dokku@your-server-ip:cowrite

# Deploy
git push dokku main
```

## Post-Deployment

After first deploy, run seeds:

```bash
dokku run cowrite bin/rails db:seed
```

## Frontend Deployment

The React frontend should be built and served separately. Options:

### Option 1: Serve from same Dokku app (monorepo)

Update Dockerfile to build and serve frontend from Rails public folder.

### Option 2: Separate frontend deployment

Deploy frontend to:
- Vercel
- Netlify
- DigitalOcean App Platform
- Another Dokku app with nginx

Update `FRONTEND_URL` env var accordingly.

## Monitoring

```bash
# View logs
dokku logs cowrite -t

# Rails console
dokku run cowrite bin/rails console

# Check app status
dokku ps:report cowrite
```

## Scaling

```bash
# Scale web dynos
dokku ps:scale cowrite web=2
```

## Backups

```bash
# Export database
dokku postgres:export cowrite-db > backup.sql

# Import database
dokku postgres:import cowrite-db < backup.sql
```
