# Quick Start Guide - Delivery Locations Map App

Get your Delivery Locations Map app up and running in minutes!

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js >= 20.19 installed
- ✅ npm or yarn package manager
- ✅ Shopify Partner account
- ✅ Development store (or access to a test store)
- ✅ Shopify CLI installed globally (`npm install -g @shopify/cli`)

## 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
# Navigate to project directory
cd wdm-delivery-map-app

# Run setup script
# On Windows:
setup.bat

# On Mac/Linux:
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

### Step 2: Configure Environment (1 minute)

Edit the `.env` file created during setup:

```bash
SHOPIFY_API_KEY=your_api_key_from_partners_dashboard
SHOPIFY_API_SECRET=your_api_secret_from_partners_dashboard
SCOPES=write_products,write_files
```

**Where to find these:**
1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Click on your app
3. Go to "Configuration" tab
4. Copy API key and API secret

### Step 3: Start Development Server (1 minute)

```bash
npm run dev
```

The Shopify CLI will:
1. Start your local server
2. Create a tunnel URL
3. Update your app configuration
4. Open your app in the browser

### Step 4: Install in Development Store (1 minute)

1. Follow the URL provided by Shopify CLI
2. Select your development store
3. Click "Install app"
4. Approve the permissions

### Step 5: Test the App (< 1 minute)

**In Admin:**
1. You'll see the Delivery Locations Map dashboard
2. Configure your delivery zones
3. Customize button appearance
4. Click "Save Settings"

**In Storefront:**
1. Go to Online Store → Themes
2. Click "Customize"
3. Add section → "Delivery Locations Map" (under Apps)
4. Save and preview

🎉 **Done!** Your delivery map is now live!

## Common First-Time Setup Issues

### Issue: "Command not found: shopify"
**Solution:** Install Shopify CLI globally
```bash
npm install -g @shopify/cli
```

### Issue: "Cannot find module '@prisma/client'"
**Solution:** Generate Prisma client
```bash
npx prisma generate
```

### Issue: "Database connection error"
**Solution:** Ensure DATABASE_URL is correct in .env
```bash
# For development, use SQLite (default):
DATABASE_URL="file:./dev.sqlite"
```

### Issue: "App not appearing in theme editor"
**Solution:** 
1. Ensure app is installed in the store
2. Refresh the theme editor
3. Check that the extension is deployed

### Issue: "Settings not saving"
**Solution:**
1. Check browser console for errors
2. Verify database is accessible
3. Check server logs

## Quick Configuration Guide

### Default Setup (Fastest)

Use the default maps and settings:
1. Install app ✓
2. Add block to theme ✓
3. Done! ✓

The app will use:
- NYC map for Same Day Delivery
- USA map for Scheduled Delivery
- Default button styles

### Custom Maps Setup

Upload your own maps:
1. Go to admin dashboard
2. Click "Map Configuration" tab
3. Select "Custom Image" for either mode
4. Upload your map image (PNG, JPG, or SVG)
5. Click "Save Settings"

### Custom Styling

Match your brand:
1. Go to "Button Customization" tab
2. Change button text
3. Pick your brand colors
4. Choose button shape
5. Set alignment
6. Click "Save Settings"

## Testing Checklist

Before going live, test:
- [ ] Admin dashboard loads
- [ ] Settings save successfully
- [ ] Block appears in theme editor
- [ ] Maps display on storefront
- [ ] Toggle buttons switch maps
- [ ] Mobile view looks good
- [ ] Colors match your brand

## Next Steps

### For Developers
- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for architecture details
- Review [API_REFERENCE.md](./API_REFERENCE.md) for API docs
- Check [TESTING.md](./TESTING.md) for testing procedures

### For Merchants
- Read [MERCHANT_GUIDE.md](./MERCHANT_GUIDE.md) for detailed instructions
- Customize your delivery zones
- Match your brand colors
- Add to multiple pages if needed

### For Deployment
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Set up production database
- Configure production environment
- Deploy to your hosting platform

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Shopify
npm run deploy

# Run database migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio

# Generate Prisma client
npx prisma generate

# Check for linting errors
npm run lint

# Type checking
npm run typecheck
```

## File Locations

Quick reference for common files:

| What | Where |
|------|-------|
| Admin dashboard | `app/routes/app._index.jsx` |
| Settings API | `app/routes/app.map-settings.jsx` |
| Public API | `app/routes/api.map-settings.$shop.jsx` |
| Theme block | `extensions/delivery-map-block/blocks/delivery_map.liquid` |
| Database schema | `prisma/schema.prisma` |
| Default maps | `public/maps/` |
| Environment config | `.env` |

## Support & Resources

### Documentation
- 📖 [README.md](./README.md) - Main documentation
- 🛠️ [DEVELOPMENT.md](./DEVELOPMENT.md) - Developer guide
- 👤 [MERCHANT_GUIDE.md](./MERCHANT_GUIDE.md) - Merchant instructions
- 🧪 [TESTING.md](./TESTING.md) - Testing guide
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- 📡 [API_REFERENCE.md](./API_REFERENCE.md) - API documentation

### External Resources
- [Shopify App Development](https://shopify.dev/docs/apps)
- [React Router Docs](https://reactrouter.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Theme App Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)

### Getting Help
- 📧 Email: support@example.com
- 💬 GitHub Issues: [Repository]
- 📚 Documentation: [Docs URL]

## Tips for Success

### 1. Start Simple
Use default maps first, then customize later.

### 2. Test Thoroughly
Test on multiple devices and browsers before going live.

### 3. Match Your Brand
Customize colors and text to match your store's design.

### 4. Clear Communication
Write clear descriptions so customers understand your delivery options.

### 5. Keep It Updated
Update your maps when you expand delivery areas.

## Troubleshooting

### App won't start
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Database issues
```bash
# Reset database (development only!)
rm prisma/dev.sqlite
npx prisma migrate dev
```

### Extension not showing
```bash
# Redeploy extension
npm run deploy
```

### Settings not loading
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check database connection
4. Review server logs

## What's Next?

After setup:
1. ✅ Customize your delivery zones
2. ✅ Match your brand styling
3. ✅ Test on mobile devices
4. ✅ Add to your homepage
5. ✅ Monitor customer feedback
6. ✅ Adjust as needed

---

**Need help?** Check the [MERCHANT_GUIDE.md](./MERCHANT_GUIDE.md) or [DEVELOPMENT.md](./DEVELOPMENT.md) for more detailed information.

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

🔧 Updated Feature Specification — Advanced Map Modes, Pins, and Radius Zones

Your existing admin screen already has:

✔ Same Day Delivery Map
✔ Scheduled Delivery Map
✔ Description fields
✔ Basic “Map Mode” selector

Now you want to extend this to a full geographical map builder, where merchants can:

Add pins (📍)

Draw radius-based delivery zones

Choose map modes (Static, Interactive, Earth view, Custom tiles)

Configure colors, transparency, borders, etc.

Below is the full explanation needed to build this correctly.

1. Expanded MAP MODE System

Each “Map Mode” dropdown (Same Day + Scheduled) should allow selecting different map types:

Available Map Modes

Static Image Map

Merchant uploads PNG/JPG

Useful for branded maps

Interactive World Map (Leaflet.js)

Default tile set: OpenStreetMap

Allows pins, radius zones, polygons

Supports zoom, pan, scroll

Custom Tiles (Mapbox, Google Maps, etc.)

Merchant enters API key + style URL

Use Leaflet plugin for custom tiles

Merchant can mix modes:

Same-Day → Interactive World Map

Scheduled → Static USA map

etc.

2. Pin Management System (📍 Pinpoint Locations)

Inside each map configuration (Same Day + Scheduled):

Add a new section: “Delivery Pins”

Merchants can:

A. Add Pin

Fields:

Pin Title (required)

Latitude (required)

Longitude (required)

Pin Color (optional)

Delivery Type

Same-day only

Scheduled only

Both

B. Edit/Delete Pins

Each pin displayed in a list with:

Coordinates

Title

Delivery type

Color indicator

C. Auto-pick coordinates

Merchant clicks on the map → Automatically generates lat/lng.

This allows:
✔ Adding key locations
✔ Adding office/store hubs
✔ Showing pickup/drop-off points

3. Radius-based Delivery Zones (Highlight Circles)

Each pin can optionally have a radius delivery zone.

A. Add “Delivery Radius” option

Fields:

Enable Radius (checkbox)

Radius Distance

In km/miles (merchant chooses unit)

Fill Color

Default: Light Blue (#5dade260)

Border Color

Default: Light Blue (#5dade2)

Border Thickness

Default: 1px

Fill Opacity

Default: 0.25

Visual Behavior:

Draw a Leaflet circle around the pin

The circle should:

Be semi-transparent (so map below is visible)

Have clear 1px border

Adjust dynamically as map zooms

Example Styling:
L.circle([lat, lng], {
  radius: radiusInMeters,
  color: "#79BFF1",
  weight: 1,
  fillColor: "#79BFF1",
  fillOpacity: 0.25,
}).addTo(map);


This visually shows:
✔ Delivery coverage
✔ Nearby availability
✔ Location-specific delivery rules

4. Full Earth Map Support

The map should allow global coverage.

Requirements:

Default tiles: OpenStreetMap world tiles

Merchant can zoom out to show the entire earth

Merchant can scroll/drag across continents

Support up to Web Mercator zoom level 0 (global view)

This ensures:
✔ A bakery can show local coverage
✔ A logistics brand can show entire country
✔ A global brand can show worldwide shipping

5. Admin Panel UI Enhancements

Inside the admin screen (React → Polaris UI):

Tabs

Replace current tabs with:

Map Configuration

Pins & Radius Zones

Button Customization

Preview

Map Configuration Tab

Contains:

Map mode selection

Tile provider settings

Default image upload option

Default zoom level

Pan settings (optional)

Pins & Radius Zones Tab

Contains:

“Add Pin” button (form)

List of pins with edit/delete

Radius options per pin

Map preview with draggable pins

Preview Tab

A live sandbox showing:

Buttons

Active mode

Final map with all zones and pins

6. Front-End Storefront Behavior

Customers will see:

Toggle Buttons

Same Day Delivery

Scheduled Delivery

Styled buttons with active state

Interactive Map Area

Based on mode selected:

Show pins

Show radius circles

Show full map

Smooth transitions (map flyTo / fade)

Example Behavior:

Clicking “Same Day Delivery”
→ Map zooms to NYC
→ Same-day pins + radius circles appear

Clicking “Scheduled Delivery”
→ Map zooms out to USA
→ Nationwide pins appear

7. Data Structure for Saving Settings

A JSON structure stored in the database like:

{
  "sameDay": {
    "mapMode": "interactive",
    "defaultZoom": 12,
    "pins": [
      {
        "title": "NYC Hub",
        "lat": 40.7128,
        "lng": -74.0060,
        "radius": 5000,
        "color": "#ff0000"
      }
    ]
  },
  "scheduled": {
    "mapMode": "interactive",
    "defaultZoom": 4,
    "pins": [
      {
        "title": "USA Central Hub",
        "lat": 39.0997,
        "lng": -94.5786,
        "radius": 0,
        "color": "#0000ff"
      }
    ]
  }
}

8. What Your Developer Must Build Next
Backend

New API endpoints:

/settings/pins

/settings/radius

/settings/mapmode

Validation for lat/lng, radius, colors

Admin UI

Interactive Leaflet map in admin

Pin creation form

Radius editor

Preview mode

Tab layout improvement

Storefront

Leaflet implementation inside app block

Buttons for switching modes

Smooth transitions

Radius rendering

Pin rendering

9. Result

After implementing these updates:

🔹 Merchant can build robust, custom delivery maps
🔹 Pins + radius zones help clearly show service areas
🔹 Customers get a professional, interactive experience
🔹 App becomes significantly more powerful than MapIt or ShipSketch