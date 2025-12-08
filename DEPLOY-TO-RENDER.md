# 🚀 Deploy to Render.com (No Credit Card Required)

Render.com offers a **truly free tier** without requiring credit card details, making it perfect for testing and small-scale deployments.

## ✅ What You Get (Free)

- ✅ **No credit card required**
- ✅ 512MB RAM web service
- ✅ PostgreSQL database (90 days data retention)
- ✅ 750 hours/month (enough for 24/7 with one app)
- ✅ 100GB bandwidth/month
- ✅ Auto-deploy from GitHub
- ✅ Free SSL certificates
- ✅ Custom domains

## ⚠️ Limitations

- Apps **sleep after 15 minutes** of inactivity
- **Cold start** takes ~30 seconds on first request
- Database data retained for 90 days only (free tier)

**Solution for sleeping:** Use a free uptime monitor to keep it awake (see step 6).

---

## 📋 Prerequisites

1. GitHub account
2. Render.com account (sign up with GitHub - no credit card)
3. Your app code ready

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Code

Ensure your `package.json` has the correct scripts:

```json
{
  "scripts": {
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js",
    "docker-start": "npm run setup && npm run start",
    "setup": "prisma generate && prisma migrate deploy"
  }
}
```

### Step 2: Update Prisma Schema for PostgreSQL

Copy the production schema:

```bash
cp prisma/schema-production.prisma prisma/schema.prisma
```

Or manually change `datasource db`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Render deployment"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/wdm-delivery-map-app.git
git branch -M main
git push -u origin main
```

### Step 4: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (no credit card required)
4. Authorize Render to access your repositories

### Step 5: Create PostgreSQL Database

1. In Render Dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name:** `wdm-delivery-map-db`
   - **Database:** `wdm_delivery_map`
   - **User:** `wdm_user` (auto-generated)
   - **Region:** Choose nearest to you
   - **Plan:** **Free**
4. Click "Create Database"
5. Wait for database to be created (~2 minutes)
6. **Copy the "Internal Database URL"** (you'll need this)

### Step 6: Create Web Service

1. Click "New +" → "Web Service"
2. Click "Connect a repository"
3. Find and select your `wdm-delivery-map-app` repo
4. Configure:

   **Basic Settings:**
   - **Name:** `wdm-delivery-map-app`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Runtime:** `Node`
   
   **Build & Deploy:**
   - **Build Command:** 
     ```bash
     npm install && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run docker-start
     ```
   
   **Plan:** **Free**

5. Click "Advanced" to add environment variables

### Step 7: Add Environment Variables

Click "Add Environment Variable" for each:

| Key | Value | Where to Get |
|-----|-------|--------------|
| `DATABASE_URL` | (Paste Internal Database URL from Step 5) | Render database page |
| `SHOPIFY_API_KEY` | Your Shopify Client ID | Partner Dashboard → App → Client credentials |
| `SHOPIFY_API_SECRET` | Your Shopify Client Secret | Partner Dashboard → App → Client credentials |
| `SCOPES` | `write_products,write_files` | Fixed value |
| `HOST` | `wdm-delivery-map-app.onrender.com` | Your Render app URL |
| `NODE_ENV` | `production` | Fixed value |

### Step 8: Deploy

1. Click "Create Web Service"
2. Render will:
   - Clone your repo
   - Install dependencies
   - Run build
   - Start your app
   - Run database migrations

**This takes ~5-10 minutes.**

### Step 9: Get Your App URL

Once deployed, your app will be at:

```
https://wdm-delivery-map-app.onrender.com
```

### Step 10: Update Shopify Configuration

Edit `shopify.app.toml`:

```toml
application_url = "https://wdm-delivery-map-app.onrender.com"

[auth]
redirect_urls = [ "https://wdm-delivery-map-app.onrender.com/api/auth" ]

[app_proxy]
url = "https://wdm-delivery-map-app.onrender.com"
subpath = "delivery-map"
prefix = "apps"
```

### Step 11: Deploy to Shopify

```bash
shopify app deploy
```

### Step 12: Install on Your Store

1. Go to https://partners.shopify.com
2. Click your app
3. Click "Select store"
4. Choose your store
5. Click "Install app"

---

## 🔄 Keep Your App Awake (Prevent Sleeping)

Render's free tier sleeps apps after 15 minutes of inactivity. To keep it awake:

### Option 1: UptimeRobot (Recommended)

1. Go to https://uptimerobot.com (free, no credit card)
2. Sign up for free account
3. Click "Add New Monitor"
4. Configure:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** WDM Delivery Map
   - **URL:** `https://wdm-delivery-map-app.onrender.com/healthcheck`
   - **Monitoring Interval:** 5 minutes
5. Click "Create Monitor"

**This will ping your app every 5 minutes to keep it awake!**

### Option 2: Cron-Job.org

1. Go to https://cron-job.org (free)
2. Sign up
3. Create a cron job to hit your `/healthcheck` endpoint every 5 minutes

### Option 3: GitHub Actions (Free)

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Alive

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  keep-alive:
    runs-on: ubuntu-latest
    steps:
      - name: Ping health check
        run: curl https://wdm-delivery-map-app.onrender.com/healthcheck
```

---

## 🔍 Monitoring & Logs

### View Logs

1. Go to Render Dashboard
2. Click your web service
3. Click "Logs" tab
4. View real-time logs

### Check Status

1. Dashboard shows service status
2. Green = running
3. Yellow = deploying
4. Red = error

### Manual Restart

If needed:
1. Go to service page
2. Click "Manual Deploy" → "Deploy latest commit"

---

## 🔄 Deploying Updates

Render auto-deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Render automatically deploys!
```

**Manual deploy:**
1. Render Dashboard → Your service
2. "Manual Deploy" → "Deploy latest commit"

---

## 🗄️ Database Management

### Access Database

1. Render Dashboard → Your database
2. Click "Connect" → Copy connection string
3. Use with any PostgreSQL client

### Run Migrations

```bash
# From Render Shell
# Dashboard → Service → Shell tab
npm run setup
```

### Backup Database

**Free tier:** 90-day data retention only

**Upgrade to paid:** $7/month for permanent storage + backups

---

## 💰 Cost Breakdown

| Resource | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Web Service | 512MB RAM, sleeps after 15min | $7/mo, always on |
| PostgreSQL | 1GB, 90-day retention | $7/mo, permanent + backups |
| Bandwidth | 100GB/month | Unlimited |
| **Total** | **$0/month** | **$14/month** (if upgraded) |

---

## ⚡ Performance Tips

### 1. Reduce Cold Starts

- Use UptimeRobot to keep app awake
- Upgrade to paid tier ($7/mo) for always-on

### 2. Optimize Build

Add to `package.json`:

```json
{
  "engines": {
    "node": "20.x"
  }
}
```

### 3. Enable Caching

Render automatically caches `node_modules` between builds.

---

## 🆘 Troubleshooting

### App Won't Start

**Check logs:**
1. Render Dashboard → Service → Logs

**Common issues:**
- Missing environment variables
- Database connection failed
- Build errors

**Fix:**
1. Verify all environment variables are set
2. Check `DATABASE_URL` is correct
3. Ensure `package.json` scripts are correct

### Database Connection Failed

**Check:**
1. `DATABASE_URL` environment variable is set
2. Database is running (Dashboard → Database → Status)
3. Using PostgreSQL schema (not SQLite)

**Fix:**
```bash
# In Render Shell
npx prisma generate
npx prisma migrate deploy
```

### App Sleeping Too Often

**Solutions:**
1. Set up UptimeRobot (free)
2. Upgrade to paid tier ($7/mo)
3. Use GitHub Actions keep-alive

### Build Fails

**Check:**
1. `package.json` has correct scripts
2. All dependencies in `package.json`
3. No syntax errors in code

**Fix:**
```bash
# Test locally first
npm install
npm run build
npm run start
```

---

## 🎯 Checklist

**Before Deployment:**
- [ ] Code pushed to GitHub
- [ ] Prisma schema uses PostgreSQL
- [ ] `package.json` scripts correct
- [ ] Shopify API credentials ready

**During Deployment:**
- [ ] Render account created (no credit card)
- [ ] PostgreSQL database created
- [ ] Web service created
- [ ] Environment variables set
- [ ] App deployed successfully

**After Deployment:**
- [ ] App URL obtained
- [ ] `shopify.app.toml` updated
- [ ] `shopify app deploy` run
- [ ] App installed on store
- [ ] Theme extension added
- [ ] UptimeRobot configured (to prevent sleeping)

---

## 🎉 Success!

Your app is now:
- ✅ Running on Render.com
- ✅ No credit card required
- ✅ Free PostgreSQL database
- ✅ Auto-deploys from GitHub
- ✅ Free SSL certificate
- ✅ Installable on Shopify stores

**Your app is live!** 🚀

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Render PostgreSQL Guide](https://render.com/docs/databases)
- [UptimeRobot](https://uptimerobot.com)

---

## 🔄 Upgrade Path

When ready to upgrade (no sleeping, better performance):

**Starter Plan ($7/mo per service):**
- Always on (no sleeping)
- Faster cold starts
- More RAM options

**To upgrade:**
1. Render Dashboard → Service
2. Click "Upgrade"
3. Select "Starter" plan
4. Add payment method

**Total cost:** $14/mo (web service + database)

---

## 🎊 You're Live!

Your Shopify Delivery Map App is now running on Render.com with **no credit card required**!

**Next steps:**
1. Set up UptimeRobot to prevent sleeping
2. Test thoroughly on your store
3. Monitor logs for any issues
4. Upgrade when ready for production traffic

**Happy shipping!** 🗺️✨

