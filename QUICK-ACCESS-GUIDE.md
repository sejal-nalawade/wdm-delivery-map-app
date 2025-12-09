# ⚡ Quick Access Guide - No Partners Dashboard Needed

**Fastest way to access and configure your delivery map app directly from your store.**

---

## 🎯 Direct Access Methods

### Method 1: Access App Admin Directly (If Installed)

**If your app is already installed on your store:**

1. **Go to your Shopify Admin:**
   ```
   https://[your-store].myshopify.com/admin
   ```

2. **Navigate to Apps:**
   - Click **"Apps"** in the left sidebar
   - Look for **"wdm-delivery-map-app"** or **"Delivery Locations Map"**
   - Click to open the admin panel

3. **Configure your map:**
   - Add delivery pins
   - Set map center
   - Configure radius zones
   - Customize button styles

**✅ That's it!** No Partners Dashboard needed if the app is already installed.

---

### Method 2: Direct Admin URL

**If you know your store domain, try accessing directly:**

```
https://[your-store].myshopify.com/admin/apps/wdm-delivery-map-app
```

Or:

```
https://[your-store].myshopify.com/admin/apps/delivery-locations-map
```

---

### Method 3: Add Map Block via Theme Customizer

**To add the map to your storefront:**

1. **Go to Theme Customizer:**
   ```
   https://[your-store].myshopify.com/admin/themes
   ```

2. **Click "Customize"** on your active theme

3. **Add the block:**
   - Navigate to any page (homepage, product page, etc.)
   - Click **"Add section"** or **"Add block"**
   - Search for **"Delivery Map"**
   - Click to add

4. **Save and preview**

**✅ Map is now on your storefront!**

---

### Method 4: Install via OAuth URL

**⚠️ WARNING: This method requires Partners Dashboard access!**

**If you see "redirect_uri is not whitelisted" error:**
- ❌ This method won't work without Partners Dashboard access
- ✅ **Use Shopify CLI instead** (see full guide: `CONFIGURE-WITHOUT-PARTNERS-DASHBOARD.md`)

**If you have Partners Dashboard access:**

Replace `[your-store]` with your actual store domain:

```
https://[your-store].myshopify.com/admin/oauth/authorize?
  client_id=e3388306344441ee0c4f096838bfcad3&
  scope=write_products,write_files&
  redirect_uri=https://wdm-delivery-map-app.onrender.com/api/auth/callback
```

**Steps:**
1. **First:** Whitelist redirect URI in Partners Dashboard:
   - Partners Dashboard → Your App → App setup
   - Add `https://wdm-delivery-map-app.onrender.com/api/auth/callback` to "Allowed redirection URL(s)"
   - Save changes
2. Copy the URL above
3. Replace `[your-store]` with your store (e.g., `mystore`)
4. Open in browser
5. Log in to your store
6. Approve app installation
7. You'll be redirected to the app admin

---

## 🔍 Check App Status

### Is the app installed?

**Check here:**
```
https://[your-store].myshopify.com/admin/apps
```

Look for your app in the list.

### Is the app running?

**Check health:**
```
https://wdm-delivery-map-app.onrender.com/healthcheck
```

Should return: `{"status":"ok",...}`

---

## 📋 Quick Checklist

- [ ] App is accessible at: https://wdm-delivery-map-app.onrender.com
- [ ] Health check works: `/healthcheck` returns OK
- [ ] App appears in: `https://[your-store].myshopify.com/admin/apps`
- [ ] Can access admin panel to configure pins
- [ ] Delivery Map block available in theme customizer
- [ ] Map displays on storefront

---

## 🆘 Still Can't Access?

**Try these in order:**

1. ✅ Check if app is installed: Admin → Apps
2. ✅ Try direct OAuth URL (Method 4 above)
3. ✅ Use Shopify CLI: `shopify app dev`
4. ✅ Check Render.com logs for errors
5. ✅ Verify environment variables are set

**For detailed troubleshooting, see:** `CONFIGURE-WITHOUT-PARTNERS-DASHBOARD.md`

---

## 💡 Pro Tips

1. **Bookmark the admin URL** once you find it
2. **Use theme customizer** to add the map block quickly
3. **Check Apps section first** - it's the easiest way to access
4. **OAuth URL works** even without Partners Dashboard access

---

**Need more help?** See the full guide: `CONFIGURE-WITHOUT-PARTNERS-DASHBOARD.md`

