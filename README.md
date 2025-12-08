# Delivery Locations Map App

A Shopify app that allows merchants to display interactive delivery zones on their storefront, showing customers where same-day and scheduled delivery options are available.

## Features

### Core Functionality
- **Interactive Map Display**: Toggle between Same Day Delivery (NYC metro) and Scheduled Delivery (nationwide) zones
- **Customizable Maps**: Use default maps or upload custom images
- **Button Customization**: Customize button text, colors, alignment, and shape
- **Mobile Responsive**: Fully responsive design that works on all devices
- **Theme Integration**: Easy-to-add Online Store 2.0 app block

### Admin Dashboard
- Configure delivery zone maps (default or custom images)
- Customize toggle button appearance
- Edit descriptions for each delivery mode
- Preview settings before publishing

### Storefront Block
- Two-button toggle interface
- Smooth map transitions
- Customizable descriptions
- Lightweight vanilla JavaScript (no jQuery)
- Performance optimized (<100kb)

## Installation

### Prerequisites
- Node.js >= 20.19
- Shopify CLI
- A Shopify Partner account
- A development store

### Setup

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   ```bash
   npm run setup
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Deploy to Shopify**
   ```bash
   npm run deploy
   ```

## Usage

### For Merchants

1. **Install the App**
   - Install from the Shopify App Store or via app URL
   - Approve the required permissions

2. **Configure Delivery Zones**
   - Navigate to the app dashboard
   - Go to "Map Configuration" tab
   - Choose between default maps or upload custom images
   - Set descriptions for each delivery mode

3. **Customize Buttons**
   - Go to "Button Customization" tab
   - Edit button text, colors, alignment, and shape
   - Choose default active mode

4. **Add to Theme**
   - Go to Online Store → Themes
   - Click "Customize" on your active theme
   - Add a section and select "Delivery Locations Map"
   - Configure block settings and save

### For Developers

#### Project Structure
```
wdm-delivery-map-app/
├── app/
│   ├── routes/
│   │   ├── app._index.jsx          # Admin dashboard
│   │   ├── app.map-settings.jsx    # Settings API (authenticated)
│   │   ├── app.upload-image.jsx    # Image upload API
│   │   └── api.map-settings.$shop.jsx  # Public settings API
│   ├── db.server.js
│   └── shopify.server.js
├── extensions/
│   └── delivery-map-block/
│       ├── blocks/
│       │   └── delivery_map.liquid  # Storefront block
│       └── shopify.extension.toml
├── prisma/
│   └── schema.prisma               # Database schema
└── public/
    └── maps/
        ├── nyc-delivery-zone.svg   # Default NYC map
        └── usa-delivery-zone.svg   # Default USA map
```

#### Database Schema

**MapSettings Model**
- Shop identifier
- Same Day Delivery settings (mode, image URL, zoom level)
- Scheduled Delivery settings (mode, image URL, zoom level)
- UI customization (button text, colors, alignment, shape)
- Description text for each mode

#### API Endpoints

**Authenticated Routes** (Admin only)
- `GET /app/map-settings` - Fetch merchant settings
- `POST /app/map-settings` - Save merchant settings
- `POST /app/upload-image` - Upload custom map images

**Public Routes** (Storefront)
- `GET /api/map-settings/:shop` - Fetch settings for storefront display

## Technology Stack

- **Backend**: Node.js, React Router
- **Frontend**: React (Admin), Vanilla JS (Storefront)
- **Database**: Prisma with SQLite (dev) / PostgreSQL (production)
- **Shopify Integration**: App Bridge, Theme App Extensions
- **Styling**: Polaris Web Components (Admin), Custom CSS (Storefront)

## Configuration

### Environment Variables
Set up your `.env` file with:
```
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,write_files
```

### App Scopes
- `write_products` - For product-related operations
- `write_files` - For uploading custom map images

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run typecheck
```

### Database Migrations
```bash
npx prisma migrate dev --name migration_name
```

## Deployment

### Production Deployment
```bash
npm run deploy
```

### Docker Deployment
```bash
docker build -t delivery-map-app .
docker run -p 3000:3000 delivery-map-app
```

## Support

For issues, questions, or feature requests, please contact support or open an issue in the repository.

## License

Copyright © 2025. All rights reserved.

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.
