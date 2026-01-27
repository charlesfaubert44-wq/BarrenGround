# Dokploy Deployment Guide

This guide explains how to deploy Barren Ground Coffee to Dokploy.

## Prerequisites

- Dokploy server running (self-hosted or cloud)
- Git repository access
- Domain names configured (optional but recommended)

## Architecture Overview

The application consists of 4 services:

1. **PostgreSQL Database** - Data storage
2. **Backend API** - Node.js/Express REST API with WebSocket support
3. **Customer Frontend** - React SPA for customers to place orders
4. **Employee Dashboard** - React SPA for staff to manage orders

## Deployment Steps

### 1. Create Project in Dokploy

1. Log into your Dokploy dashboard
2. Create a new project named "barrenground-coffee"
3. Add a new "Docker Compose" application

### 2. Configure Environment Variables

In Dokploy, set the following environment variables:

#### Required Variables

```
# Database
DB_USER=postgres
DB_PASSWORD=<generate-secure-password>
DB_NAME=barrenground

# Security (CRITICAL - generate with: openssl rand -base64 32)
JWT_SECRET=<your-32-char-min-secret>

# URLs (update with your domains)
FRONTEND_URL=https://order.yourdomain.com
EMPLOYEE_DASHBOARD_URL=https://staff.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
ALLOWED_ORIGINS=https://order.yourdomain.com,https://staff.yourdomain.com

# Shop
VITE_SHOP_ID=barrenground
```

#### Optional Variables (for full functionality)

```
# Stripe Payments
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=orders@yourdomain.com

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

### 3. Configure Domains in Dokploy

Set up the following domains/ports:

| Service | Domain | Port |
|---------|--------|------|
| Backend API | api.yourdomain.com | 5000 |
| Customer Frontend | order.yourdomain.com | 8890 |
| Employee Dashboard | staff.yourdomain.com | 8889 |

### 4. Deploy

1. Push your code to the Git repository
2. In Dokploy, trigger a deployment
3. Dokploy will build and start all services

### 5. Initialize Database

After first deployment, run the database setup:

```bash
# SSH into your server or use Dokploy's terminal
docker exec -it barrenground-backend sh

# Run database migrations
cd /app
node dist/scripts/setupDatabase.js
```

Or use the npm scripts:
```bash
npm run db:setup
```

## SSL/TLS Configuration

Dokploy handles SSL certificates automatically via Let's Encrypt when you configure domains. Ensure:

1. Your domains point to the Dokploy server
2. Ports 80 and 443 are open
3. Domain verification can complete

## Scaling

To scale services, modify the `docker-compose.yml`:

```yaml
backend:
  deploy:
    replicas: 3
```

For the database, consider using a managed PostgreSQL service (like Supabase, Neon, or AWS RDS) for production.

## Monitoring

The backend exposes a health endpoint:
- `GET /health` - Returns `{"status":"ok","database":"connected"}`

Dokploy monitors container health automatically based on the HEALTHCHECK directives.

## Backup

Database backups should be configured:

```bash
# Manual backup
docker exec barrenground-db pg_dump -U postgres barrenground > backup.sql

# Restore
docker exec -i barrenground-db psql -U postgres barrenground < backup.sql
```

For production, set up automated backups using cron or a managed database service.

## Troubleshooting

### Container won't start
```bash
docker logs barrenground-backend
docker logs barrenground-customer
docker logs barrenground-employee
```

### Database connection issues
```bash
# Check if database is running
docker exec barrenground-db pg_isready

# Check connection from backend
docker exec barrenground-backend wget -qO- http://localhost:5000/health
```

### CORS errors
Ensure `ALLOWED_ORIGINS` includes all your frontend domains.

### WebSocket connection issues
Ensure your reverse proxy (Traefik in Dokploy) supports WebSocket upgrades.

## Updates

To update the application:

1. Push changes to Git
2. Trigger rebuild in Dokploy
3. Dokploy will perform rolling updates

## Environment Variables Reference

See `.env.production.example` for a complete list of all environment variables.
