# Deployment Guide - Delivery Locations Map App

This guide covers deploying the Delivery Locations Map Shopify App to production.

## Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Deployment Methods](#deployment-methods)
- [Post-Deployment](#post-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring](#monitoring)

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No linter errors
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number bumped

### Database
- [ ] Migrations tested locally
- [ ] Backup strategy in place
- [ ] Migration rollback plan ready

### Configuration
- [ ] Environment variables configured
- [ ] App scopes correct
- [ ] API keys secured
- [ ] CORS settings verified

### Testing
- [ ] Manual testing complete
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Cross-browser testing done
- [ ] Mobile testing complete

### Assets
- [ ] Images optimized
- [ ] SVG files validated
- [ ] Static assets uploaded

## Environment Setup

### Production Environment Variables

Create a `.env.production` file:

```bash
# Shopify App Configuration
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret
SCOPES=write_products,write_files

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# App URL
HOST=https://your-app-domain.com

# Session Storage
SESSION_SECRET=your_secure_random_string

# Optional: Error Tracking
SENTRY_DSN=your_sentry_dsn
```

### Security Best Practices

1. **Never commit `.env` files**
   ```bash
   # Ensure .env is in .gitignore
   echo ".env*" >> .gitignore
   ```

2. **Use strong secrets**
   ```bash
   # Generate secure session secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Rotate credentials regularly**
   - Update API keys quarterly
   - Rotate session secrets monthly
   - Update database passwords regularly

## Database Setup

### PostgreSQL (Recommended for Production)

1. **Create Database**
   ```sql
   CREATE DATABASE delivery_map_app;
   CREATE USER app_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE delivery_map_app TO app_user;
   ```

2. **Update Prisma Schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify Connection**
   ```bash
   npx prisma db pull
   ```

### Database Backup

Set up automated backups:

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump delivery_map_app > backup_$DATE.sql
# Upload to S3 or backup service
```

## Deployment Methods

### Method 1: Shopify CLI Deploy

#### Step 1: Build the App
```bash
npm run build
```

#### Step 2: Deploy
```bash
npm run deploy
```

#### Step 3: Verify
- Check app in Shopify Partners dashboard
- Test in a production store
- Verify all features working

### Method 2: Docker Deployment

#### Step 1: Build Docker Image
```bash
docker build -t delivery-map-app:latest .
```

#### Step 2: Test Locally
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your_db_url" \
  -e SHOPIFY_API_KEY="your_key" \
  -e SHOPIFY_API_SECRET="your_secret" \
  delivery-map-app:latest
```

#### Step 3: Push to Registry
```bash
docker tag delivery-map-app:latest your-registry/delivery-map-app:latest
docker push your-registry/delivery-map-app:latest
```

#### Step 4: Deploy to Server
```bash
docker pull your-registry/delivery-map-app:latest
docker run -d \
  --name delivery-map-app \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  your-registry/delivery-map-app:latest
```

### Method 3: Cloud Platform Deployment

#### Heroku

1. **Create App**
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set SHOPIFY_API_KEY=your_key
   heroku config:set SHOPIFY_API_SECRET=your_secret
   heroku config:set SCOPES=write_products,write_files
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Run Migrations**
   ```bash
   heroku run npx prisma migrate deploy
   ```

#### AWS (Elastic Beanstalk)

1. **Initialize EB**
   ```bash
   eb init -p node.js delivery-map-app
   ```

2. **Create Environment**
   ```bash
   eb create production
   ```

3. **Set Environment Variables**
   ```bash
   eb setenv SHOPIFY_API_KEY=your_key
   eb setenv SHOPIFY_API_SECRET=your_secret
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

#### Google Cloud Platform (App Engine)

1. **Create `app.yaml`**
   ```yaml
   runtime: nodejs20
   env: standard
   
   env_variables:
     SHOPIFY_API_KEY: "your_key"
     SHOPIFY_API_SECRET: "your_secret"
   
   handlers:
   - url: /.*
     script: auto
     secure: always
   ```

2. **Deploy**
   ```bash
   gcloud app deploy
   ```

### Method 4: Custom Server

#### Using PM2

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create Ecosystem File**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'delivery-map-app',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
       },
       instances: 2,
       exec_mode: 'cluster',
       max_memory_restart: '500M',
     }]
   };
   ```

3. **Start App**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Monitor**
   ```bash
   pm2 monit
   pm2 logs
   ```

## Post-Deployment

### Verification Steps

1. **Health Check**
   ```bash
   curl https://your-app-domain.com/health
   ```

2. **Test Admin Routes**
   - Install app in test store
   - Access admin dashboard
   - Save settings
   - Verify database updates

3. **Test Storefront**
   - Add block to theme
   - Test toggle functionality
   - Verify maps load
   - Test on mobile

4. **Monitor Logs**
   ```bash
   # View application logs
   tail -f /var/log/app.log
   
   # Or with PM2
   pm2 logs delivery-map-app
   ```

### Update DNS (if needed)

1. **Point Domain to Server**
   ```
   A Record: your-app.com → server_ip_address
   ```

2. **Enable SSL**
   ```bash
   # Using Let's Encrypt
   certbot --nginx -d your-app.com
   ```

### Update Shopify App Settings

1. Go to Shopify Partners Dashboard
2. Navigate to your app
3. Update:
   - App URL: `https://your-app-domain.com`
   - Redirect URLs: `https://your-app-domain.com/api/auth`
4. Save changes

### Notify Stakeholders

- [ ] Inform team of deployment
- [ ] Update documentation
- [ ] Announce new version (if applicable)
- [ ] Update status page

## Rollback Procedures

### Quick Rollback

#### Using Git
```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

#### Using Docker
```bash
# Stop current container
docker stop delivery-map-app

# Start previous version
docker run -d \
  --name delivery-map-app \
  your-registry/delivery-map-app:previous-tag
```

#### Using PM2
```bash
# Rollback to previous version
pm2 reload ecosystem.config.js --update-env
```

### Database Rollback

```bash
# Rollback last migration
npx prisma migrate rollback

# Or restore from backup
psql delivery_map_app < backup_20250128.sql
```

### Rollback Checklist

- [ ] Stop new deployments
- [ ] Revert code to stable version
- [ ] Rollback database if needed
- [ ] Clear caches
- [ ] Verify app functionality
- [ ] Monitor error logs
- [ ] Notify team
- [ ] Document incident

## Monitoring

### Application Monitoring

#### Error Tracking (Sentry)

1. **Install Sentry**
   ```bash
   npm install @sentry/node
   ```

2. **Configure**
   ```javascript
   // app/entry.server.jsx
   import * as Sentry from "@sentry/node";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

#### Performance Monitoring

1. **Response Times**
   - Monitor API endpoint response times
   - Alert if > 1 second average

2. **Database Queries**
   - Track slow queries
   - Optimize as needed

3. **Memory Usage**
   - Monitor memory consumption
   - Alert if > 80% usage

### Health Checks

Create a health check endpoint:

```javascript
// app/routes/health.jsx
export const loader = async () => {
  // Check database connection
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'ok', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Configure alerts for:
- App downtime
- Slow response times
- SSL certificate expiration

### Log Management

#### Centralized Logging

1. **Using Winston**
   ```javascript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
     ],
   });
   ```

2. **Log Aggregation**
   - Use services like Loggly, Papertrail, or ELK Stack
   - Set up log rotation
   - Configure retention policies

### Metrics Dashboard

Track key metrics:
- Request rate (req/min)
- Error rate (%)
- Response time (ms)
- Active users
- Database connections
- Memory usage
- CPU usage

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      env:
        SHOPIFY_API_KEY: ${{ secrets.SHOPIFY_API_KEY }}
        SHOPIFY_API_SECRET: ${{ secrets.SHOPIFY_API_SECRET }}
      run: npm run deploy
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Distribute traffic across multiple instances
   - Use Nginx or cloud load balancers

2. **Database Replication**
   - Set up read replicas
   - Use connection pooling

3. **Caching**
   - Implement Redis for session storage
   - Cache API responses

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Use CDN for static assets

## Troubleshooting

### Common Issues

#### App Not Loading
- Check server is running
- Verify DNS settings
- Check SSL certificate
- Review error logs

#### Database Connection Errors
- Verify DATABASE_URL
- Check database server status
- Review connection limits

#### Theme Block Not Appearing
- Verify extension is deployed
- Check app is installed
- Review theme compatibility

## Support

### Deployment Support
- Documentation: [Link]
- Support Email: support@example.com
- Emergency Hotline: [Number]

---

**Remember**: Always test deployments in a staging environment before production!

