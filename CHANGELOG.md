# Delivery Locations Map App - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Render.com Deployment Configuration** - App fully configured for no-credit-card deployment:
  - Updated `prisma/schema.prisma` to use PostgreSQL instead of SQLite
  - Set Node.js engine to 20.x in `package.json`
  - Created `render.yaml` for one-click Blueprint deployment
  - Added `.github/workflows/keep-alive.yml` to prevent app sleeping
  - Created `README-DEPLOYMENT.md` with quick deployment instructions
- **App Proxy Configuration** - Added app proxy settings to `shopify.app.toml` for storefront API access
- **Distribution Guide** - Created `MAKE-APP-AVAILABLE-FOR-LIVE-STORES.md` with comprehensive guide on making the app available for live stores, including Partners account setup, private vs public apps, and App Store review process

### Changed
- **Production Database Setup** - Modified `docker-start` script to force `prisma db push` before migrations to ensure tables are created
- **Shopify App Configuration** - Updated `shopify.app.toml` with production Render URL (https://wdm-delivery-map-app.onrender.com)
- **Access Scopes** - Added `write_files` scope back to `shopify.app.toml`
- **App Proxy Routes** - Created dedicated routes for App Proxy requests:
  - `settings.$shop.jsx` - Settings endpoint for storefront (App Proxy strips prefix)
  - `pins.$shop.jsx` - Pins endpoint for storefront (App Proxy strips prefix)
- **Complete Interactive Map System** with Leaflet.js integration
- **Geocoding Search** - Search for any location by name (city, country, address)
- **Click-to-Add Pins** - Click anywhere on the map to add delivery pins
- **Drag-to-Reposition** - Drag pins to update their position automatically
- **Pin Edit Modal** - Full editing capabilities for pins with all settings
- **Radius Zones** - Visual delivery coverage circles with customizable:
  - Radius distance (km or miles)
  - Fill color and opacity
  - Border color and thickness
- **Real-time Map Preview** - See changes instantly in admin without page refresh
- **Optimistic UI Updates** - Pins update immediately when added, edited, or deleted
- **Asynchronous Operations** - All pin operations are non-blocking with instant visual feedback
- **Smooth Map Transitions** - FlyTo animations when switching modes
- **Pin Markers** - Custom styled markers with popup information
- **Documentation** - Added comprehensive guides:
  - `REAL-TIME-UPDATES.md` - Technical implementation details
  - `ADMIN-WORKFLOW-GUIDE.md` - User workflow guide with best practices
- Advanced map modes: Interactive (Leaflet.js), Custom Tiles, Static Image
- Pin management system for marking delivery locations
- DeliveryPin database model with full radius zone configuration
- Pin management API endpoints (create, read, update, delete)
- Public API for fetching pins on storefront (`/api/pins/:shop`)
- Support for multiple pins per delivery mode
- Full Earth map support with OpenStreetMap tiles
- Leaflet.js CDN integration for storefront

### Changed
- **Admin Dashboard** - Complete redesign with:
  - Working dropdown selectors (native HTML for reliability)
  - Tab-based navigation (Map Config, Pins & Zones, Buttons, Preview)
  - Mode switcher (Same Day / Scheduled)
  - Live map preview with pin management
  - Search functionality using Nominatim geocoding
  - **Instant map updates** when pins are modified (no page refresh needed)
  - **Real-time preview** updates as settings change
- MapSettings schema expanded with center coordinates and tile provider fields
- Map mode options: default (static SVG), image, interactive, custom_tiles
- Storefront block updated with full Leaflet integration
- Button styling now fully customizable
- **Pin operations now asynchronous** - UI updates immediately, server syncs in background

### Fixed
- **Pins not showing on storefront** - Added App Proxy configuration to enable storefront-to-app API communication
- **Radius circles not visible** - Fixed circle styling and layer ordering to make delivery zones clearly visible
- **Circles not rendering properly** - Added `.addTo(map)` directly to circles for proper Leaflet rendering
- **Admin map not updating after pin changes** - Added automatic map refresh after pin create/update/delete operations
- **"Cannot access 'initMap' before initialization" error** - Refactored map refresh logic to use state-based triggers instead of circular dependencies
- **Pins showing in wrong delivery mode** - Fixed pin creation to automatically set `deliveryMode` based on current editing mode (Same Day vs Scheduled)
- **Map not refreshing when switching between Same Day and Scheduled** - Added automatic map refresh when toggling between delivery modes
- **Pins added for Same Day appearing in Scheduled (and vice versa)** - Ensured `deliveryMode` is correctly set when clicking on map to add pins
- **Map glitching during zoom/pan operations** - Fixed infinite re-render loop caused by `moveend` event triggering map refresh; now updates state silently without re-initializing map
- **Radius circles using wrong colors on frontend** - Removed CSS `!important` overrides that forced all circles to be red; circles now use actual database colors (fillColor, borderColor, fillOpacity, borderThickness)
- **Radius circles not visible on frontend (z-index issue)** - Created custom `deliveryPane` with z-index 650 to ensure circles render above tiles but below markers
- **8-digit hex colors with alpha channel** - Strip alpha channel from hex colors (e.g., #5dade260 → #5dade2) as Leaflet doesn't support 8-digit hex; use `fillOpacity` instead
- **Shopify theme CSS conflicts** - Added force-visible CSS to override Shopify themes that set `svg path { fill: none !important }`
- **Circles not painting correctly** - Added `map.invalidateSize(true)` after rendering and fitBounds to force Leaflet to repaint circles
- **Incorrect CSS selector for custom pane** - Fixed CSS selector from `.leaflet-delivery-pane` to `.leaflet-deliverypane-pane` (Leaflet lowercases pane names)
- **Added comprehensive DOM debugging** - Added console logs to inspect delivery pane, SVG elements, and path attributes to diagnose visibility issues
- **Simplified frontend circle rendering** - Removed complex color stripping, explicit stroke/fill/opacity settings, and aggressive CSS overrides to match simpler backend logic
- **Unified backend/frontend approach** - Frontend now uses same simple circle options as backend (only keeping custom pane for z-index management)
- **🎉 ROOT CAUSE FOUND: CSS width conflict** - The `.delivery-map-display svg { width: 100%; }` rule was forcing Leaflet's SVG overlay to collapse, making circles invisible
- **🔧 FIX: Scoped SVG width rule** - Changed to `.delivery-map-display > svg` (direct children only) to exclude Leaflet's internal SVGs
- **🔧 FIX: Reset Leaflet SVG dimensions** - Added `.leaflet-container svg { width: auto !important; max-width: none !important; }` to prevent CSS conflicts
- **Added robust data parsing** - Added `parseFloat()` for latitude, longitude, and radiusDistance to ensure correct number types
- **Fixed scheduled delivery zoom level** - When radius circles are present, both same day and scheduled delivery now use zoom level 10 initially, then fitBounds adjusts to show all circles
- **Removed all console logs** - Cleaned up all debugging console.log statements from frontend for production
- **Removed map animations** - Replaced `flyTo()` with instant `setView()` to match backend behavior and eliminate jarring transitions when switching modes
- **Fixed scheduled delivery default zoom** - Changed default zoom from 4 to 11 to match same day delivery
- **🔥 CRITICAL FIX: circlesLayer not bound to deliveryPane** - Added `pane: 'deliveryPane'` option to `L.layerGroup()` to ensure all circles render in the custom pane
- **🔥 CRITICAL FIX: Manual SVG deletion killing circles** - Removed manual `path.remove()` code that was deleting circles immediately after creation
- **🔥 CRITICAL FIX: Wrong z-index order** - Changed deliveryPane z-index from 650 to 450 (circles now correctly appear behind markers)
- **🔥 CRITICAL FIX: Circle not added to map directly** - Added `circle.addTo(map)` before `circlesLayer.addLayer(circle)` to ensure DOM rendering
- **🔥 CRITICAL FIX: Shopify theme CSS overrides** - Simplified CSS to force-visible with `fill: currentColor !important` to override all Shopify themes
- Dropdown options not displaying (switched to native HTML select)
- Map mode changes now trigger immediate preview updates
- Improved console logging for debugging pin fetching on storefront

## [1.0.0] - 2025-11-28

### Added
- Initial release of Delivery Locations Map App
- MapSettings database model with Prisma schema
- Admin dashboard with map configuration interface
- Button customization UI (text, colors, alignment, shape)
- API routes for settings management (GET/POST)
- Image upload API endpoint for custom maps
- Public API endpoint for storefront settings access
- Theme app extension with delivery map block
- Interactive toggle buttons for Same Day vs Scheduled delivery
- Default SVG maps (NYC metro and USA nationwide)
- Mobile responsive design for all screen sizes
- Smooth map transitions and animations
- Description text support for each delivery mode
- Online Store 2.0 compatibility
- App scopes configuration (write_products, write_files)
- Comprehensive README documentation

### Features
- Two delivery modes: Same Day (NYC) and Scheduled (USA)
- Customizable map display (default or custom images)
- Button style customization (colors, shape, alignment)
- Merchant-configurable descriptions
- Lightweight vanilla JavaScript (no jQuery)
- Performance optimized (<100kb JS)
- CORS-enabled public API for storefront
- Automatic settings initialization on first load

---

# Previous Template Changelog

# @shopify/shopify-app-template-react-router

## 2025.10.10

- [#95](https://github.com/Shopify/shopify-app-template-react-router/pull/95) Swap the product link for [admin intents](https://shopify.dev/docs/apps/build/admin/admin-intents).

## 2025.10.02

- [#81](https://github.com/Shopify/shopify-app-template-react-router/pull/81) Add shopify global to eslint for ui extensions

## 2025.10.01

- [#79](https://github.com/Shopify/shopify-app-template-react-router/pull/78) Update API version to 2025-10.
- [#77](https://github.com/Shopify/shopify-app-template-react-router/pull/77) Update `@shopify/shopify-app-react-router` to V1.
- [#73](https://github.com/Shopify/shopify-app-template-react-router/pull/73/files) Rename @shopify/app-bridge-ui-types to @shopify/polaris-types

## 2025.08.30

- [#70](https://github.com/Shopify/shopify-app-template-react-router/pull/70/files) Upgrade `@shopify/app-bridge-ui-types` from 0.2.1 to 0.3.1.

## 2025.08.17

- [#58](https://github.com/Shopify/shopify-app-template-react-router/pull/58) Update Shopify & React Router dependencies.  Use Shopify React Router in graphqlrc, not shopify-api
- [#57](https://github.com/Shopify/shopify-app-template-react-router/pull/57) Update Webhook API version in `shopify.app.toml` to `2025-07`
- [#56](https://github.com/Shopify/shopify-app-template-react-router/pull/56) Remove local CLI from package.json in favor of global CLI installation
- [#53](https://github.com/Shopify/shopify-app-template-react-router/pull/53) Add the Shopify Dev MCP to the template

## 2025.08.16

- [#52](https://github.com/Shopify/shopify-app-template-react-router/pull/52) Use `ApiVersion.July25` rather than `LATEST_API_VERSION` in `.graphqlrc`.

## 2025.07.24

- [14](https://github.com/Shopify/shopify-app-template-react-router/pull/14/files) Add [App Bridge web components](https://shopify.dev/docs/api/app-home/app-bridge-web-components) to the template.

## July 2025

Forked the [shopify-app-template repo](https://github.com/Shopify/shopify-app-template-remix)

# @shopify/shopify-app-template-remix

## 2025.03.18

-[#998](https://github.com/Shopify/shopify-app-template-remix/pull/998) Update to Vite 6

## 2025.03.01

- [#982](https://github.com/Shopify/shopify-app-template-remix/pull/982) Add Shopify Dev Assistant extension to the VSCode extension recommendations

## 2025.01.31

- [#952](https://github.com/Shopify/shopify-app-template-remix/pull/952) Update to Shopify App API v2025-01

## 2025.01.23

- [#923](https://github.com/Shopify/shopify-app-template-remix/pull/923) Update `@shopify/shopify-app-session-storage-prisma` to v6.0.0

## 2025.01.8

- [#923](https://github.com/Shopify/shopify-app-template-remix/pull/923) Enable GraphQL autocomplete for Javascript

## 2024.12.19

- [#904](https://github.com/Shopify/shopify-app-template-remix/pull/904) bump `@shopify/app-bridge-react` to latest
-
## 2024.12.18

- [875](https://github.com/Shopify/shopify-app-template-remix/pull/875) Add Scopes Update Webhook
## 2024.12.05

- [#910](https://github.com/Shopify/shopify-app-template-remix/pull/910) Install `openssl` in Docker image to fix Prisma (see [#25817](https://github.com/prisma/prisma/issues/25817#issuecomment-2538544254))
- [#907](https://github.com/Shopify/shopify-app-template-remix/pull/907) Move `@remix-run/fs-routes` to `dependencies` to fix Docker image build
- [#899](https://github.com/Shopify/shopify-app-template-remix/pull/899) Disable v3_singleFetch flag
- [#898](https://github.com/Shopify/shopify-app-template-remix/pull/898) Enable the `removeRest` future flag so new apps aren't tempted to use the REST Admin API.

## 2024.12.04

- [#891](https://github.com/Shopify/shopify-app-template-remix/pull/891) Enable remix future flags.

## 2024.11.26

- [888](https://github.com/Shopify/shopify-app-template-remix/pull/888) Update restResources version to 2024-10

## 2024.11.06

- [881](https://github.com/Shopify/shopify-app-template-remix/pull/881) Update to the productCreate mutation to use the new ProductCreateInput type

## 2024.10.29

- [876](https://github.com/Shopify/shopify-app-template-remix/pull/876) Update shopify-app-remix to v3.4.0 and shopify-app-session-storage-prisma to v5.1.5

## 2024.10.02

- [863](https://github.com/Shopify/shopify-app-template-remix/pull/863) Update to Shopify App API v2024-10 and shopify-app-remix v3.3.2

## 2024.09.18

- [850](https://github.com/Shopify/shopify-app-template-remix/pull/850) Removed "~" import alias

## 2024.09.17

- [842](https://github.com/Shopify/shopify-app-template-remix/pull/842) Move webhook processing to individual routes

## 2024.08.19

Replaced deprecated `productVariantUpdate` with `productVariantsBulkUpdate`

## v2024.08.06

Allow `SHOP_REDACT` webhook to process without admin context

## v2024.07.16

Started tracking changes and releases using calver
