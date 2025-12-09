# 🔧 Configure App Without Partners Dashboard Access

If you're having issues accessing the Shopify Partners Dashboard, here are alternative ways to configure and use your delivery map app directly from your live storefront.

---

## ⚠️ IMPORTANT: OAuth Redirect URI Error

**If you see this error:**
```
Oauth error invalid_request: The redirect_uri is not whitelisted
```

**This means:** Direct OAuth installation requires Partners Dashboard access to whitelist the redirect URI.

**✅ SOLUTION:** Use **Method 1 (Shopify CLI)** instead - it handles OAuth automatically and doesn't require redirect URI whitelisting!

**Skip to:** [Method 1: Using Shopify CLI](#method-1-using-shopify-cli-recommended)

---

## 📋 Table of Contents

1. [Quick Assessment](#quick-assessment)
2. [Method 1: Using Shopify CLI (Recommended)](#method-1-using-shopify-cli-recommended)
3. [Method 2: Direct Theme Block Addition](#method-2-direct-theme-block-addition)
4. [Method 3: Manual App Installation via URL](#method-3-manual-app-installation-via-url)
5. [Method 4: Using App Proxy Directly](#method-4-using-app-proxy-directly)
6. [Troubleshooting](#troubleshooting)

---

## Quick Assessment

**First, check if your app is already installed:**

1. Go to your Shopify Admin: `https://[your-store].myshopify.com/admin`
2. Navigate to **"Apps"** in the left sidebar
3. Look for **"wdm-delivery-map-app"** or **"Delivery Locations Map"**

**If you see it:**
- ✅ App is installed → Use [Method 2](#method-2-direct-theme-block-addition)
- ✅ You can configure it directly in the admin panel

**If you don't see it:**
- ⚠️ App needs to be installed first → Use [Method 1](#method-1-using-shopify-cli-recommended) or [Method 3](#method-3-manual-app-installation-via-url)

---

## Method 1: Using Shopify CLI (Recommended)

**This method uses the Shopify CLI to install and configure the app without needing Partners Dashboard access.**

### Prerequisites:
- ✅ Node.js installed on your computer
- ✅ Shopify CLI installed (`npm install -g @shopify/cli @shopify/theme`)
- ✅ Access to your store's admin panel
- ✅ Your app's API credentials (if you have them)

### Step 1: Install Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
```

### Step 2: Authenticate with Your Store

```bash
shopify auth login
```

This will:
- Open your browser
- Ask you to log in to your Shopify store
- Grant CLI access

### Step 3: Navigate to Your App Directory

```bash
cd wdm-delivery-map-app
```

### Step 4: Configure Environment Variables

Create or update `.env` file:

```bash
SHOPIFY_API_KEY=e3388306344441ee0c4f096838bfcad3
SHOPIFY_API_SECRET=your_secret_here
SCOPES=write_products,write_files
SHOPIFY_APP_URL=https://wdm-delivery-map-app.onrender.com
DATABASE_URL=your_database_url
```

**Note:** If you don't have the API secret, you'll need to get it from Partners Dashboard. However, if the app is already deployed, you might be able to proceed.

### Step 5: Deploy App Configuration

```bash
shopify app deploy
```

This command will:
- ✅ Update app URLs in Shopify (if you have proper permissions)
- ✅ Deploy theme extensions
- ✅ Configure app proxy

### Step 6: Generate Installation Link

```bash
shopify app generate extension
```

Or install directly:

```bash
shopify app dev
```

This will:
- Start a development server
- Create a tunnel URL
- Provide an installation link

### Step 7: Install on Your Store

1. Copy the installation URL provided by CLI
2. Open it in your browser
3. Select your store
4. Click "Install app"
5. Approve permissions

**✅ App is now installed!**

---

## Method 2: Direct Theme Block Addition

**If your app is already installed, you can add the map block directly through the theme customizer.**

### Step 1: Access Theme Customizer

1. Go to your Shopify Admin
2. Navigate to **"Online Store"** → **"Themes"**
3. Click **"Customize"** on your active theme

### Step 2: Add the Delivery Map Block

1. Navigate to the page where you want the map (e.g., homepage, product page, custom page)
2. Click **"Add section"** or **"Add block"**
3. In the search bar, type: **"Delivery Map"** or **"Delivery Locations"**
4. Look for the block under **"Apps"** section
5. Click to add it

### Step 3: Configure the Block

Once added, you'll see settings like:
- **Title** (optional)
- **Show title** (toggle)
- **Map height** (optional)

### Step 4: Configure Delivery Pins (Admin Panel)

To add delivery pins and configure the map:

1. In Shopify Admin, look for **"Apps"** → **"Delivery Locations Map"** or **"wdm-delivery-map-app"**
2. Click to open the admin panel
3. Configure:
   - Map center location
   - Delivery pins (same-day and scheduled)
   - Radius zones
   - Button styles

### Step 5: Save and Preview

1. Click **"Save"** in the theme customizer
2. Click **"Preview"** to see the map on your storefront
3. Test the map functionality

**✅ Map is now live on your storefront!**

---

## Method 3: Manual App Installation via URL

**⚠️ IMPORTANT:** Direct OAuth installation requires the redirect URI to be whitelisted in Partners Dashboard. If you can't access Partners Dashboard, **this method won't work**. Use [Method 1 (Shopify CLI)](#method-1-using-shopify-cli-recommended) instead, which handles OAuth automatically.

### Option A: Using OAuth Installation URL (Requires Partners Dashboard Access)

**⚠️ This will fail with "redirect_uri is not whitelisted" error if Partners Dashboard is not accessible.**

If you have Partners Dashboard access and the redirect URI is whitelisted, you can construct the installation URL:

```
https://[your-store].myshopify.com/admin/oauth/authorize?
  client_id=e3388306344441ee0c4f096838bfcad3&
  scope=write_products,write_files&
  redirect_uri=https://wdm-delivery-map-app.onrender.com/api/auth/callback
```

**Steps:**
1. Replace `[your-store]` with your actual store domain
2. **First, ensure redirect URI is whitelisted in Partners Dashboard:**
   - Go to Partners Dashboard → Your App → App setup
   - Add `https://wdm-delivery-map-app.onrender.com/api/auth/callback` to "Allowed redirection URL(s)"
   - Save changes
3. Open the URL in your browser
4. Log in to your store
5. Approve the app installation
6. You'll be redirected back to the app

**If you get "redirect_uri is not whitelisted" error:**
- ❌ You need Partners Dashboard access to whitelist the redirect URI
- ✅ **Use Method 1 (Shopify CLI) instead** - it handles this automatically

### Option B: Direct Admin Access

If the app is already configured in your store:

1. Go to: `https://[your-store].myshopify.com/admin/apps`
2. Look for your app in the list
3. Click to open it
4. If not installed, you'll see an "Install" button

---

## Method 4: Using App Proxy Directly

**If the App Proxy is already configured, you can access the API endpoints directly from your storefront.**

### Check App Proxy Configuration

Your app proxy should be accessible at:
```
https://[your-store].myshopify.com/apps/delivery-map/settings/[shop]
https://[your-store].myshopify.com/apps/delivery-map/pins/[shop]
```

### Test App Proxy

1. Open your browser's developer console
2. Try accessing:
   ```javascript
   fetch('/apps/delivery-map/settings/your-shop.myshopify.com')
     .then(r => r.json())
     .then(console.log)
   ```

### Use in Liquid Template

If App Proxy is working, you can add this to your theme directly:

```liquid
{% comment %}
  Add this to your theme's liquid file (e.g., theme.liquid or a section)
{% endcomment %}

<div id="delivery-map-container">
  <script>
    // Fetch map settings
    fetch('/apps/delivery-map/settings/{{ shop.permanent_domain }}')
      .then(response => response.json())
      .then(data => {
        console.log('Map settings:', data);
        // Initialize your map here
      });
    
    // Fetch delivery pins
    fetch('/apps/delivery-map/pins/{{ shop.permanent_domain }}')
      .then(response => response.json())
      .then(data => {
        console.log('Delivery pins:', data);
        // Render pins on map
      });
  </script>
</div>
```

**Note:** This requires the App Proxy to be properly configured in `shopify.app.toml` and deployed.

---

## Troubleshooting

### Issue: "Oauth error invalid_request: The redirect_uri is not whitelisted"

**This is the most common error when trying to install without Partners Dashboard access.**

**Error Message:**
```
Oauth error invalid_request: The redirect_uri is not whitelisted
```

**Why it happens:**
- Direct OAuth requires the redirect URI to be whitelisted in Partners Dashboard
- Without Partners Dashboard access, you can't whitelist the redirect URI
- This method simply won't work without Partners Dashboard

**✅ SOLUTION: Use Shopify CLI Instead**

The Shopify CLI handles OAuth automatically and doesn't require redirect URI whitelisting:

```bash
# Install CLI
npm install -g @shopify/cli

# Navigate to your app directory
cd wdm-delivery-map-app

# Start dev server (handles OAuth automatically)
shopify app dev
```

The CLI will:
- ✅ Create a tunnel URL automatically
- ✅ Handle OAuth flow without redirect URI whitelisting
- ✅ Provide an installation link
- ✅ Work without Partners Dashboard access

**See:** [Method 1: Using Shopify CLI](#method-1-using-shopify-cli-recommended) for detailed steps.

---

### Issue: "App not found" in theme customizer

**Solution:**
- The app extension might not be deployed
- Try running `shopify app deploy` from your local machine
- Or ensure the app is properly installed first

### Issue: "Cannot access admin panel"

**Solution:**
- Check if the app is installed: Admin → Apps
- If not installed, use Method 1 or Method 3
- Verify the app URL is correct in your deployment

### Issue: "App Proxy returns 404"

**Possible causes:**
1. App Proxy not configured in Partners Dashboard
2. App not installed on the store
3. Incorrect proxy URL format

**Solution:**
- Verify App Proxy settings in `shopify.app.toml`:
  ```toml
  [app_proxy]
  url = "https://wdm-delivery-map-app.onrender.com"
  subpath = "delivery-map"
  prefix = "apps"
  ```
- Deploy with `shopify app deploy`
- Ensure app is installed on the store

### Issue: "Authentication failed"

**Solution:**
- Verify `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are correct
- Check that redirect URLs match in both:
  - Your `.env` file
  - Your deployment environment variables
  - Partners Dashboard (if accessible)

### Issue: "Database connection error"

**Solution:**
- Verify `DATABASE_URL` is set correctly
- Check Render.com database is running
- Ensure database tables are created (run `prisma db push`)

---

## 🎯 Recommended Workflow

**If you can't access Partners Dashboard, follow this order:**

1. **⭐ BEST OPTION:** Use [Method 1 (Shopify CLI)](#method-1-using-shopify-cli-recommended)
   - ✅ **ONLY reliable way** to install without Partners Dashboard access
   - ✅ Handles OAuth automatically (no redirect URI whitelisting needed)
   - ✅ Creates tunnel URL automatically
   - ✅ Gives you full control
   - ⚠️ Requires Node.js and CLI installation

2. **If app is already installed:** Use [Method 2 (Theme Customizer)](#method-2-direct-theme-block-addition)
   - ✅ Quickest way to add the map
   - ✅ No technical setup needed
   - ✅ Works immediately if app is installed

3. **❌ AVOID Method 3 (Direct OAuth):** 
   - ❌ **Won't work** without Partners Dashboard access
   - ❌ Requires redirect URI whitelisting
   - ❌ Will show "redirect_uri is not whitelisted" error

4. **For advanced use:** Try [Method 4 (App Proxy)](#method-4-using-app-proxy-directly)
   - Direct API access
   - Custom implementation
   - Requires app to be installed first

---

## 📝 Quick Reference

### Essential URLs

- **Your App:** https://wdm-delivery-map-app.onrender.com
- **Health Check:** https://wdm-delivery-map-app.onrender.com/healthcheck
- **Admin Panel:** `https://[your-store].myshopify.com/admin/apps`
- **Theme Customizer:** `https://[your-store].myshopify.com/admin/themes/[theme-id]/editor`

### Essential Commands

```bash
# Install CLI
npm install -g @shopify/cli

# Authenticate
shopify auth login

# Deploy app
shopify app deploy

# Start dev server
shopify app dev

# Generate extension
shopify app generate extension
```

---

## 🆘 Still Having Issues?

**If none of these methods work, you may need to:**

1. **Contact Shopify Support:**
   - They can help with Partners Dashboard access issues
   - They can verify app installation status

2. **Check App Status:**
   - Visit: https://wdm-delivery-map-app.onrender.com/healthcheck
   - Verify the app is running

3. **Verify Credentials:**
   - Ensure API key and secret are correct
   - Check environment variables in Render.com

4. **Check Deployment Logs:**
   - Render.com dashboard → Your service → Logs
   - Look for any error messages

---

## ✅ Success Checklist

- [ ] App is accessible at https://wdm-delivery-map-app.onrender.com
- [ ] Health check returns `{"status":"ok"}`
- [ ] App appears in Shopify Admin → Apps
- [ ] Can access admin panel for map configuration
- [ ] Delivery Map block available in theme customizer
- [ ] Map displays correctly on storefront
- [ ] Pins and radius zones render properly

---

**Good luck!** 🚀 You should be able to get your app working even without Partners Dashboard access.

