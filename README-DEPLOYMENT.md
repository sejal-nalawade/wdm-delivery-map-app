# 🚀 Deployment Instructions for Render.com

This app is configured for easy deployment to Render.com with **no credit card required**.

## Quick Start

### Option 1: One-Click Deploy (Easiest)

1. Push this code to GitHub
2. Go to [Render.com](https://render.com)
3. Sign up with GitHub (no credit card)
4. Click "New +" → "Blueprint"
5. Connect your repository
6. Render will read `render.yaml` and set everything up automatically
7. Add your Shopify API credentials in the dashboard

### Option 2: Manual Setup

Follow the complete guide in **[DEPLOY-TO-RENDER.md](./DEPLOY-TO-RENDER.md)**

## What's Already Configured

✅ **Prisma Schema** - Updated to use PostgreSQL  
✅ **Package.json** - Correct Node.js version (20.x)  
✅ **Health Check** - `/healthcheck` endpoint ready  
✅ **Keep-Alive** - GitHub Actions workflow included  
✅ **Render Config** - `render.yaml` for one-click deploy  

## Environment Variables Needed

Set these in Render dashboard:

| Variable | Where to Get |
|----------|--------------|
| `SHOPIFY_API_KEY` | Partner Dashboard → App → Client credentials |
| `SHOPIFY_API_SECRET` | Partner Dashboard → App → Client credentials |
| `DATABASE_URL` | Auto-set by Render |
| `SCOPES` | Already set to `write_products,write_files` |
| `HOST` | Your Render URL (e.g., `wdm-delivery-map-app.onrender.com`) |

## After Deployment

1. Update `shopify.app.toml` with your Render URL
2. Run `shopify app deploy`
3. Install on your Shopify store
4. Set up UptimeRobot to prevent sleeping (see DEPLOY-TO-RENDER.md)

## Keep App Awake

The app sleeps after 15 minutes on the free tier. Three options:

1. **UptimeRobot** (Recommended) - Free, no credit card
   - Sign up at https://uptimerobot.com
   - Monitor: `https://your-app.onrender.com/healthcheck`
   - Interval: 5 minutes

2. **GitHub Actions** - Already configured in `.github/workflows/keep-alive.yml`
   - Automatically pings your app every 5 minutes
   - Enable in your GitHub repo settings

3. **Cron-Job.org** - Free alternative
   - Sign up at https://cron-job.org
   - Create job to ping `/healthcheck` every 5 minutes

## Files Modified for Render

- ✅ `prisma/schema.prisma` - Changed from SQLite to PostgreSQL
- ✅ `package.json` - Set Node.js engine to 20.x
- ✅ `render.yaml` - Render configuration file
- ✅ `.github/workflows/keep-alive.yml` - Keep-alive workflow
- ✅ `app/routes/healthcheck.jsx` - Health check endpoint

## Cost

**$0/month** with Render's free tier:
- 512MB RAM web service
- 1GB PostgreSQL database
- 100GB bandwidth/month

## Need Help?

See the complete guide: **[DEPLOY-TO-RENDER.md](./DEPLOY-TO-RENDER.md)**

## Upgrade Later

When ready for production:
- Web Service: $7/month (always on, no sleeping)
- Database: $7/month (permanent storage + backups)
- **Total: $14/month**

---

**Your app is ready to deploy!** 🎉

Just push to GitHub and follow Option 1 or Option 2 above.

