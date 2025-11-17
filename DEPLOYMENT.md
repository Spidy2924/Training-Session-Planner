# Deployment Guide - Training Session Planner

This guide covers deploying the Training Session Planner to production.

## Pre-Deployment Checklist

- [ ] All tests pass (see TESTING_CHECKLIST.md)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables are configured
- [ ] Database is set up and accessible
- [ ] Production secrets are generated

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security (MUST be changed from defaults)
JWT_SECRET=<generate-strong-random-secret>
CSRF_SECRET=<generate-strong-random-secret>

# Optional
NODE_ENV=production
```

### Generate Secure Secrets

```bash
# Generate random secrets (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Set Up Database**
   - Use Vercel Postgres, or
   - Use external PostgreSQL (Supabase, Railway, etc.)

3. **Configure Environment Variables**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Add all required variables

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Run Migrations**
   ```bash
   # After deployment, run migrations
   vercel env pull .env.production.local
   npm run db:push
   npm run db:seed
   ```

### Option 2: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/training_planner
         - JWT_SECRET=${JWT_SECRET}
         - CSRF_SECRET=${CSRF_SECRET}
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         - POSTGRES_DB=training_planner
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Option 3: Traditional VPS (Ubuntu)

1. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Set Up Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE training_planner;
   CREATE USER appuser WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE training_planner TO appuser;
   \q
   ```

3. **Deploy Application**
   ```bash
   # Clone or upload your code
   cd /var/www/training-planner
   
   # Install dependencies
   npm ci --only=production
   
   # Build application
   npm run build
   
   # Set up environment variables
   nano .env.local
   # Add your production variables
   
   # Run migrations
   npm run db:push
   npm run db:seed
   
   # Start with PM2
   pm2 start npm --name "training-planner" -- start
   pm2 save
   pm2 startup
   ```

4. **Set Up Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Database Migration

### Production Database Setup

```bash
# 1. Set production DATABASE_URL in .env.local

# 2. Push schema to production database
npm run db:push

# 3. Seed initial data (optional, or create manually)
npm run db:seed

# 4. Verify tables exist
npm run db:studio
```

## Security Hardening

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use strong, random secrets (32+ characters)
- Rotate secrets periodically

### 2. Database
- Use strong database passwords
- Enable SSL for database connections
- Restrict database access to application server only
- Regular backups

### 3. Application
- Keep dependencies updated: `npm audit fix`
- Enable HTTPS only
- Set secure cookie flags
- Implement rate limiting on all endpoints (not just bulk upload)

### 4. Server
- Enable firewall (UFW on Ubuntu)
- Keep system updated
- Use SSH keys instead of passwords
- Disable root login

## Monitoring

### Application Logs

```bash
# PM2 logs
pm2 logs training-planner

# View specific log
pm2 logs training-planner --lines 100
```

### Database Monitoring

```bash
# Check database size
psql -U postgres -d training_planner -c "SELECT pg_size_pretty(pg_database_size('training_planner'));"

# Check active connections
psql -U postgres -d training_planner -c "SELECT count(*) FROM pg_stat_activity;"
```

### Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

## Backup Strategy

### Database Backups

```bash
# Manual backup
pg_dump -U postgres training_planner > backup_$(date +%Y%m%d).sql

# Automated daily backup (cron)
0 2 * * * pg_dump -U postgres training_planner > /backups/training_planner_$(date +\%Y\%m\%d).sql
```

### Restore from Backup

```bash
psql -U postgres training_planner < backup_20250114.sql
```

## Scaling Considerations

### Database
- Add indexes for frequently queried columns
- Use connection pooling
- Consider read replicas for high traffic

### Application
- Use CDN for static assets
- Enable Next.js caching
- Consider horizontal scaling with load balancer

## Troubleshooting

### Application Won't Start
- Check logs: `pm2 logs`
- Verify environment variables
- Check database connection
- Ensure port 3000 is available

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Verify firewall rules
- Check database user permissions

### Performance Issues
- Check database query performance
- Monitor server resources (CPU, RAM)
- Review application logs for errors
- Consider caching strategies

## Post-Deployment

1. **Verify Deployment**
   - [ ] Application is accessible
   - [ ] Login works
   - [ ] CRUD operations work
   - [ ] Bulk upload works
   - [ ] All features functional

2. **Monitor**
   - [ ] Set up error tracking (Sentry, etc.)
   - [ ] Monitor server resources
   - [ ] Check logs regularly

3. **Maintain**
   - [ ] Regular security updates
   - [ ] Database backups
   - [ ] Performance monitoring
   - [ ] User feedback collection

## Support

For issues during deployment:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Review this guide's troubleshooting section

