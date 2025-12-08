# Development Guide - Delivery Locations Map App

This guide provides detailed information for developers working on the Delivery Locations Map Shopify App.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Theme Extension](#theme-extension)
- [Testing](#testing)
- [Deployment](#deployment)

## Architecture Overview

The app follows a standard Shopify app architecture:

```
┌─────────────────┐
│  Shopify Admin  │
│   (Merchant)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Admin UI       │◄────►│  Backend API │
│  (React)        │      │  (Node.js)   │
└─────────────────┘      └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Database   │
                         │   (Prisma)   │
                         └──────────────┘
                                ▲
                                │
┌─────────────────┐      ┌──────┴───────┐
│  Storefront     │◄────►│  Public API  │
│  (Theme Block)  │      │              │
└─────────────────┘      └──────────────┘
```

## Development Setup

### Prerequisites
- Node.js >= 20.19
- npm or yarn
- Shopify CLI (installed globally)
- Shopify Partner account
- Development store

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wdm-delivery-map-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=write_products,write_files
   ```

4. **Initialize database**
   ```bash
   npm run setup
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
wdm-delivery-map-app/
├── app/
│   ├── routes/
│   │   ├── app._index.jsx              # Main admin dashboard
│   │   ├── app.map-settings.jsx        # Settings API (authenticated)
│   │   ├── app.upload-image.jsx        # Image upload handler
│   │   └── api.map-settings.$shop.jsx  # Public settings API
│   ├── db.server.js                    # Database client
│   ├── shopify.server.js               # Shopify API client
│   └── root.jsx                        # Root component
├── extensions/
│   └── delivery-map-block/
│       ├── blocks/
│       │   └── delivery_map.liquid     # Theme block template
│       ├── locales/
│       │   └── en.default.json         # Translations
│       ├── package.json
│       └── shopify.extension.toml      # Extension config
├── prisma/
│   ├── schema.prisma                   # Database schema
│   └── migrations/                     # Database migrations
├── public/
│   └── maps/
│       ├── nyc-delivery-zone.svg       # Default NYC map
│       └── usa-delivery-zone.svg       # Default USA map
├── package.json
├── shopify.app.toml                    # App configuration
└── README.md
```

## Database Schema

### MapSettings Model

```prisma
model MapSettings {
  id                      String   @id @default(uuid())
  shop                    String   @unique
  
  // Same Day Delivery
  sameDayMode             String   @default("default")
  sameDayImageUrl         String?
  sameDayGeoJson          String?
  sameDayZoomLevel        Int      @default(11)
  
  // Scheduled Delivery
  scheduledMode           String   @default("default")
  scheduledImageUrl       String?
  scheduledGeoJson        String?
  scheduledZoomLevel      Int      @default(4)
  
  // UI Settings
  toggleTextSameDay       String   @default("Same Day Delivery")
  toggleTextScheduled     String   @default("Scheduled Delivery")
  buttonColor             String   @default("#000000")
  buttonActiveColor       String   @default("#000000")
  buttonInactiveColor     String   @default("#666666")
  buttonAlignment         String   @default("center")
  buttonShape             String   @default("rounded")
  defaultMode             String   @default("sameDay")
  showDescription         Boolean  @default(true)
  descriptionSameDay      String   @default("...")
  descriptionScheduled    String   @default("...")
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

### Creating Migrations

```bash
npx prisma migrate dev --name migration_name
```

## API Endpoints

### Authenticated Routes (Admin)

#### GET /app/map-settings
Fetch merchant's map settings.

**Response:**
```json
{
  "settings": {
    "id": "uuid",
    "shop": "store.myshopify.com",
    "sameDayMode": "default",
    "scheduledMode": "default",
    ...
  }
}
```

#### POST /app/map-settings
Save merchant's map settings.

**Request Body:**
```json
{
  "sameDayMode": "image",
  "sameDayImageUrl": "https://...",
  "toggleTextSameDay": "NYC Same Day",
  ...
}
```

**Response:**
```json
{
  "settings": { ... },
  "success": true
}
```

#### POST /app/upload-image
Upload custom map image to Shopify Files.

**Request:** FormData with `file` field

**Response:**
```json
{
  "success": true,
  "url": "https://cdn.shopify.com/...",
  "fileId": "gid://shopify/MediaImage/..."
}
```

### Public Routes (Storefront)

#### GET /api/map-settings/:shop
Fetch settings for storefront display (CORS enabled).

**Response:**
```json
{
  "settings": {
    "sameDayMode": "default",
    "toggleTextSameDay": "Same Day Delivery",
    ...
  }
}
```

## Frontend Components

### Admin Dashboard (app._index.jsx)

The admin dashboard uses Polaris web components:
- `<s-page>` - Page container
- `<s-section>` - Content sections
- `<s-tabs>` - Tab navigation
- `<s-text-field>` - Input fields
- `<s-select>` - Dropdown selects
- `<s-checkbox>` - Checkboxes
- `<s-button>` - Action buttons

### State Management

Uses React hooks for local state:
```javascript
const [formData, setFormData] = useState({...});
const [activeTab, setActiveTab] = useState("maps");
```

Uses React Router's `useFetcher` for API calls:
```javascript
const fetcher = useFetcher();
fetcher.submit(data, { method: "POST" });
```

## Theme Extension

### Block Structure

The theme block (`delivery_map.liquid`) includes:
1. Title section (optional)
2. Toggle buttons
3. Description text
4. Map display container
5. Inline styles
6. Vanilla JavaScript logic

### JavaScript Logic

Key functions:
- `fetchSettings()` - Load settings from API
- `initializeMap()` - Initialize with settings
- `switchMode(mode)` - Toggle between delivery modes
- `displayMap(mode)` - Render the appropriate map
- `applyButtonStyles()` - Apply custom button styles

### Customization

Merchants can customize:
- Button text
- Button colors (active/inactive)
- Button alignment (left/center/right)
- Button shape (square/rounded/pill)
- Map images (default or custom)
- Description text

## Testing

### Manual Testing Checklist

#### Admin Dashboard
- [ ] Settings load correctly
- [ ] Form inputs update state
- [ ] Save button persists changes
- [ ] Tab navigation works
- [ ] Toast notifications appear
- [ ] Image upload works
- [ ] Preview shows current settings

#### Storefront Block
- [ ] Block appears in theme editor
- [ ] Toggle buttons switch maps
- [ ] Default map displays correctly
- [ ] Custom images load properly
- [ ] Descriptions update on toggle
- [ ] Mobile responsive layout
- [ ] Button styles apply correctly
- [ ] Settings sync from admin

### Testing in Development Store

1. Install app in development store
2. Configure settings in admin
3. Add block to theme
4. Test on desktop and mobile
5. Verify all customizations work

## Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] App scopes configured
- [ ] Extension validated
- [ ] README updated
- [ ] CHANGELOG updated

### Deploy Command
```bash
npm run deploy
```

### Post-deployment
1. Test in production store
2. Verify API endpoints
3. Check theme block functionality
4. Monitor error logs

## Common Issues

### Issue: Extension not appearing in theme editor
**Solution:** Ensure extension is deployed and app is installed

### Issue: Settings not saving
**Solution:** Check database connection and Prisma client

### Issue: Maps not loading on storefront
**Solution:** Verify public API endpoint and CORS headers

### Issue: Image upload failing
**Solution:** Check `write_files` scope is approved

## Best Practices

1. **Always test locally first** before deploying
2. **Use meaningful commit messages** following conventional commits
3. **Update CHANGELOG** for all changes
4. **Keep dependencies updated** regularly
5. **Follow Shopify app best practices** for performance
6. **Optimize images** before uploading
7. **Handle errors gracefully** with user-friendly messages
8. **Use semantic versioning** for releases

## Resources

- [Shopify App Development Docs](https://shopify.dev/docs/apps)
- [React Router Documentation](https://reactrouter.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Theme App Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/app-bridge-web-components)

## Support

For questions or issues:
1. Check this documentation
2. Review Shopify developer docs
3. Search existing issues
4. Contact the development team

