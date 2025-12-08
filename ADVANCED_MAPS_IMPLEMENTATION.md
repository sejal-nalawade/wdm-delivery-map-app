# Advanced Maps Implementation Guide

## Overview

This document outlines the implementation of advanced map features including interactive Leaflet maps, pins, and radius zones for the Delivery Locations Map app.

## ✅ Completed

### 1. Database Schema
- ✅ Updated `MapSettings` model with interactive map fields
- ✅ Created `DeliveryPin` model with full radius zone support
- ✅ Added fields for custom tile providers and API keys
- ✅ Database migration applied

### 2. Backend API
- ✅ Pin management endpoints (`/app/pins`)
- ✅ Public pin API (`/api/pins/:shop`)
- ✅ CRUD operations for pins
- ✅ Validation and error handling

### 3. Dependencies
- ✅ Added Leaflet.js (^1.9.4)
- ✅ Added React-Leaflet (^4.2.1)
- ✅ Package.json updated

### 4. Admin UI - Pin Manager
- ✅ Created `/app/pins-manager` route
- ✅ Pin creation form with all fields
- ✅ Pin list with delete functionality
- ✅ Radius zone configuration UI

## 🚧 In Progress / To Complete

### 5. Updated Admin Dashboard

The main admin dashboard needs to be updated to include:

#### New Tab Structure
```javascript
- Map Configuration (existing, needs updates)
- Pins & Radius Zones (new - link to pins-manager)
- Button Customization (existing)
- Preview (existing, needs updates)
```

#### Map Configuration Updates
Add map mode selector:
```javascript
<s-select label="Map Mode">
  <option value="default">Default Static Map</option>
  <option value="image">Custom Image</option>
  <option value="interactive">Interactive World Map (Leaflet)</option>
  <option value="custom_tiles">Custom Tiles (Mapbox/Google)</option>
</s-select>
```

For `custom_tiles` mode, show:
- Tile Provider URL field
- API Key field (optional)
- Attribution text

### 6. Storefront Block Updates

The `extensions/delivery-map-block/blocks/delivery_map.liquid` needs major updates:

#### Add Leaflet CDN
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

#### Updated JavaScript Logic
```javascript
// Initialize Leaflet map
let map = null;
let currentMarkers = [];
let currentCircles = [];

function initializeLeafletMap(mode) {
  const settings = getSettingsForMode(mode);
  
  if (map) {
    map.remove();
  }
  
  map = L.map('map-display-' + sectionId).setView(
    [settings.center.lat, settings.center.lng],
    settings.zoomLevel
  );
  
  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  
  // Load and render pins
  loadPins(mode);
}

function loadPins(mode) {
  fetch(`/api/pins/${shopDomain}`)
    .then(res => res.json())
    .then(data => {
      const pins = data.pins.filter(pin => 
        pin.deliveryMode === mode || pin.deliveryMode === 'both'
      );
      
      renderPins(pins);
    });
}

function renderPins(pins) {
  // Clear existing markers
  currentMarkers.forEach(marker => marker.remove());
  currentCircles.forEach(circle => circle.remove());
  currentMarkers = [];
  currentCircles = [];
  
  pins.forEach(pin => {
    // Add marker
    const marker = L.marker([pin.latitude, pin.longitude], {
      icon: L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: ${pin.color}; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [25, 25]
      })
    }).addTo(map);
    
    marker.bindPopup(`<strong>${pin.title}</strong>`);
    currentMarkers.push(marker);
    
    // Add radius zone if enabled
    if (pin.hasRadius) {
      const radiusInMeters = pin.radiusUnit === 'miles' 
        ? pin.radiusDistance * 1609.34 
        : pin.radiusDistance * 1000;
      
      const circle = L.circle([pin.latitude, pin.longitude], {
        radius: radiusInMeters,
        color: pin.borderColor,
        weight: pin.borderThickness,
        fillColor: pin.fillColor,
        fillOpacity: pin.fillOpacity
      }).addTo(map);
      
      currentCircles.push(circle);
    }
  });
}
```

### 7. Map Transitions

Add smooth transitions when switching modes:

```javascript
function switchMode(mode) {
  if (currentMode === mode) return;
  
  currentMode = mode;
  updateActiveButton();
  
  const settings = getSettingsForMode(mode);
  
  // Smooth fly to new location
  if (map) {
    map.flyTo(
      [settings.center.lat, settings.center.lng],
      settings.zoomLevel,
      {
        duration: 1.5,
        easeLinearity: 0.25
      }
    );
    
    // Load pins after transition
    setTimeout(() => loadPins(mode), 800);
  } else {
    initializeLeafletMap(mode);
  }
  
  displayDescription(mode);
}
```

### 8. Admin Interactive Map Preview

Create a React component for the admin map preview:

```javascript
// app/components/MapPreview.jsx
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function MapPreview({ pins, center, zoom }) {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {pins.map(pin => (
        <React.Fragment key={pin.id}>
          <Marker position={[pin.latitude, pin.longitude]}>
            <Popup>{pin.title}</Popup>
          </Marker>
          
          {pin.hasRadius && (
            <Circle
              center={[pin.latitude, pin.longitude]}
              radius={pin.radiusUnit === 'miles' 
                ? pin.radiusDistance * 1609.34 
                : pin.radiusDistance * 1000}
              pathOptions={{
                color: pin.borderColor,
                weight: pin.borderThickness,
                fillColor: pin.fillColor,
                fillOpacity: pin.fillOpacity
              }}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
}
```

## Implementation Steps

### Step 1: Stop Dev Server
```bash
# Press Ctrl+C or q to stop
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Test Pin Management
1. Navigate to `/app/pins-manager`
2. Add a test pin
3. Configure radius zone
4. Save and verify in database

### Step 5: Update Storefront Block
1. Add Leaflet CDN links
2. Implement map initialization
3. Add pin rendering logic
4. Test transitions

### Step 6: Update Admin Dashboard
1. Add map mode selector
2. Link to pins manager
3. Add preview with Leaflet
4. Test all modes

## Data Flow

```
Admin Dashboard
    ↓
Save Settings (Map Mode, Zoom, Center)
    ↓
Database (MapSettings)
    ↓
Public API (/api/map-settings/:shop)
    ↓
Storefront Block
    ↓
Initialize Map Based on Mode
    ↓
Fetch Pins (/api/pins/:shop)
    ↓
Render Pins + Radius Zones
```

## Map Modes Explained

### 1. Default (Static SVG)
- Uses pre-made SVG maps
- Fast loading
- No interaction
- Good for simple use cases

### 2. Custom Image
- Merchant uploads PNG/JPG
- Branded maps
- No interaction
- Good for custom designs

### 3. Interactive (Leaflet)
- Full world map
- Zoom, pan, scroll
- Pins and radius zones
- Best user experience
- **Recommended**

### 4. Custom Tiles
- Mapbox, Google Maps, etc.
- Requires API key
- Custom styling
- Advanced use cases

## Testing Checklist

- [ ] Pin CRUD operations work
- [ ] Pins display on correct delivery mode
- [ ] Radius zones render correctly
- [ ] Map transitions are smooth
- [ ] Mobile responsive
- [ ] Colors apply correctly
- [ ] Opacity settings work
- [ ] Multiple pins supported
- [ ] Delete confirmation works
- [ ] API endpoints secured

## Performance Considerations

1. **Lazy Load Leaflet**: Only load when interactive mode is selected
2. **Limit Pins**: Recommend max 50 pins per mode
3. **Optimize Circles**: Use appropriate segment counts
4. **Cache Tile Requests**: Leaflet handles this automatically
5. **Debounce Map Events**: Prevent excessive API calls

## Security

1. **Validate Coordinates**: Ensure lat/lng are within valid ranges
2. **Sanitize Input**: Prevent XSS in pin titles
3. **Rate Limiting**: Limit pin creation to prevent abuse
4. **Shop Isolation**: Ensure pins are shop-specific

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

1. **Polygon Drawing**: Allow custom shapes
2. **GeoJSON Import**: Bulk import zones
3. **Address Geocoding**: Convert addresses to coordinates
4. **Heatmaps**: Show delivery density
5. **Route Planning**: Optimal delivery routes
6. **Analytics**: Track which zones get most views

## Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Guide](https://react-leaflet.js.org/)
- [OpenStreetMap Tiles](https://wiki.openstreetmap.org/wiki/Tile_servers)
- [Mapbox Tiles](https://docs.mapbox.com/api/maps/raster-tiles/)

## Support

For implementation questions:
- Check DEVELOPMENT.md
- Review API_REFERENCE.md
- Test with sample data first
- Use browser DevTools for debugging

---

**Status**: Foundation Complete, Frontend Integration Needed  
**Next**: Update storefront block with Leaflet integration  
**Priority**: High - Core feature for v2.0

