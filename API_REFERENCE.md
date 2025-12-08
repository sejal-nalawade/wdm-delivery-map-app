# API Reference - Delivery Locations Map App

Complete API documentation for the Delivery Locations Map Shopify App.

## Table of Contents
- [Authentication](#authentication)
- [Admin API Endpoints](#admin-api-endpoints)
- [Public API Endpoints](#public-api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)

## Authentication

### Admin Routes
Admin routes require Shopify session authentication.

**Authentication Method**: Shopify App Bridge OAuth

**Headers Required**:
```
Authorization: Bearer {session_token}
```

### Public Routes
Public routes are accessible without authentication but are CORS-enabled.

**CORS Headers**:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Admin API Endpoints

### Get Map Settings

Retrieve the merchant's map settings.

**Endpoint**: `GET /app/map-settings`

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "settings": {
    "id": "uuid-string",
    "shop": "store.myshopify.com",
    "sameDayMode": "default",
    "sameDayImageUrl": null,
    "sameDayGeoJson": null,
    "sameDayZoomLevel": 11,
    "scheduledMode": "default",
    "scheduledImageUrl": null,
    "scheduledGeoJson": null,
    "scheduledZoomLevel": 4,
    "toggleTextSameDay": "Same Day Delivery",
    "toggleTextScheduled": "Scheduled Delivery",
    "buttonColor": "#000000",
    "buttonActiveColor": "#000000",
    "buttonInactiveColor": "#666666",
    "buttonAlignment": "center",
    "buttonShape": "rounded",
    "defaultMode": "sameDay",
    "showDescription": true,
    "descriptionSameDay": "We deliver same-day within the NYC metropolitan area.",
    "descriptionScheduled": "Scheduled delivery available nationwide.",
    "createdAt": "2025-11-28T12:00:00.000Z",
    "updatedAt": "2025-11-28T12:00:00.000Z"
  }
}
```

**Error Response**: `500 Internal Server Error`
```json
{
  "error": "Failed to fetch settings"
}
```

---

### Save Map Settings

Save or update the merchant's map settings.

**Endpoint**: `POST /app/map-settings`

**Authentication**: Required

**Request Body**:
```json
{
  "sameDayMode": "image",
  "sameDayImageUrl": "https://cdn.shopify.com/s/files/1/0000/0000/files/nyc-map.png",
  "sameDayGeoJson": null,
  "sameDayZoomLevel": 11,
  "scheduledMode": "default",
  "scheduledImageUrl": null,
  "scheduledGeoJson": null,
  "scheduledZoomLevel": 4,
  "toggleTextSameDay": "NYC Same Day",
  "toggleTextScheduled": "USA Scheduled",
  "buttonColor": "#000000",
  "buttonActiveColor": "#FF0000",
  "buttonInactiveColor": "#CCCCCC",
  "buttonAlignment": "center",
  "buttonShape": "pill",
  "defaultMode": "sameDay",
  "showDescription": true,
  "descriptionSameDay": "Custom description for same day",
  "descriptionScheduled": "Custom description for scheduled"
}
```

**Response**: `200 OK`
```json
{
  "settings": {
    "id": "uuid-string",
    "shop": "store.myshopify.com",
    // ... all settings
  },
  "success": true
}
```

**Error Response**: `500 Internal Server Error`
```json
{
  "error": "Failed to save settings"
}
```

---

### Upload Image

Upload a custom map image to Shopify Files.

**Endpoint**: `POST /app/upload-image`

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Request Body**:
```
file: [binary image data]
```

**Supported Formats**:
- PNG
- JPG/JPEG
- SVG

**Max File Size**: 5MB

**Response**: `200 OK`
```json
{
  "success": true,
  "url": "https://cdn.shopify.com/s/files/1/0000/0000/files/map.png",
  "fileId": "gid://shopify/MediaImage/123456789"
}
```

**Error Responses**:

`400 Bad Request` - No file provided
```json
{
  "error": "No file provided"
}
```

`400 Bad Request` - Upload failed
```json
{
  "error": "Failed to upload to Shopify"
}
```

`500 Internal Server Error`
```json
{
  "error": "Failed to upload image"
}
```

---

## Public API Endpoints

### Get Settings for Storefront

Retrieve map settings for display on the storefront.

**Endpoint**: `GET /api/map-settings/:shop`

**Authentication**: Not required

**Parameters**:
- `shop` (path parameter) - The shop domain (e.g., `store.myshopify.com`)

**Example Request**:
```
GET /api/map-settings/store.myshopify.com
```

**Response**: `200 OK`
```json
{
  "settings": {
    "sameDayMode": "default",
    "sameDayImageUrl": null,
    "sameDayGeoJson": null,
    "sameDayZoomLevel": 11,
    "scheduledMode": "default",
    "scheduledImageUrl": null,
    "scheduledGeoJson": null,
    "scheduledZoomLevel": 4,
    "toggleTextSameDay": "Same Day Delivery",
    "toggleTextScheduled": "Scheduled Delivery",
    "buttonColor": "#000000",
    "buttonActiveColor": "#000000",
    "buttonInactiveColor": "#666666",
    "buttonAlignment": "center",
    "buttonShape": "rounded",
    "defaultMode": "sameDay",
    "showDescription": true,
    "descriptionSameDay": "We deliver same-day within the NYC metropolitan area.",
    "descriptionScheduled": "Scheduled delivery available nationwide."
  }
}
```

**Note**: If no settings exist for the shop, default values are returned.

**Error Responses**:

`400 Bad Request` - Missing shop parameter
```json
{
  "error": "Shop parameter is required"
}
```

`500 Internal Server Error`
```json
{
  "error": "Failed to fetch settings"
}
```

---

## Data Models

### MapSettings

Complete data model for map settings.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | String (UUID) | Auto-generated | Unique identifier |
| `shop` | String | Required | Shop domain (unique) |
| `sameDayMode` | String | `"default"` | Mode for same day map: `"default"`, `"image"`, `"geojson"` |
| `sameDayImageUrl` | String? | `null` | URL to custom same day map image |
| `sameDayGeoJson` | String? | `null` | GeoJSON data for same day zone |
| `sameDayZoomLevel` | Integer | `11` | Zoom level for same day map |
| `scheduledMode` | String | `"default"` | Mode for scheduled map: `"default"`, `"image"`, `"geojson"` |
| `scheduledImageUrl` | String? | `null` | URL to custom scheduled map image |
| `scheduledGeoJson` | String? | `null` | GeoJSON data for scheduled zone |
| `scheduledZoomLevel` | Integer | `4` | Zoom level for scheduled map |
| `toggleTextSameDay` | String | `"Same Day Delivery"` | Text for same day button |
| `toggleTextScheduled` | String | `"Scheduled Delivery"` | Text for scheduled button |
| `buttonColor` | String | `"#000000"` | Base button color (hex) |
| `buttonActiveColor` | String | `"#000000"` | Active button color (hex) |
| `buttonInactiveColor` | String | `"#666666"` | Inactive button color (hex) |
| `buttonAlignment` | String | `"center"` | Button alignment: `"left"`, `"center"`, `"right"` |
| `buttonShape` | String | `"rounded"` | Button shape: `"square"`, `"rounded"`, `"pill"` |
| `defaultMode` | String | `"sameDay"` | Default active mode: `"sameDay"`, `"scheduled"` |
| `showDescription` | Boolean | `true` | Whether to show description text |
| `descriptionSameDay` | String | Default text | Description for same day mode |
| `descriptionScheduled` | String | Default text | Description for scheduled mode |
| `createdAt` | DateTime | Auto-generated | Creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last update timestamp |

### Validation Rules

#### sameDayMode / scheduledMode
- Must be one of: `"default"`, `"image"`, `"geojson"`
- If `"image"`, corresponding `ImageUrl` should be provided
- If `"geojson"`, corresponding `GeoJson` should be provided

#### Image URLs
- Must be valid HTTPS URLs
- Should point to accessible image files
- Recommended: Use Shopify CDN URLs

#### Zoom Levels
- Must be integers
- Recommended range: 1-20
- Same day default: 11 (city level)
- Scheduled default: 4 (country level)

#### Button Colors
- Must be valid hex color codes
- Format: `#RRGGBB` (e.g., `#FF0000`)
- Case insensitive

#### Button Alignment
- Must be one of: `"left"`, `"center"`, `"right"`

#### Button Shape
- Must be one of: `"square"`, `"rounded"`, `"pill"`

#### Default Mode
- Must be one of: `"sameDay"`, `"scheduled"`

#### Text Fields
- `toggleTextSameDay`: Max 50 characters
- `toggleTextScheduled`: Max 50 characters
- `descriptionSameDay`: Max 500 characters
- `descriptionScheduled`: Max 500 characters

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |

### Common Errors

#### Authentication Errors
```json
{
  "error": "Unauthorized: Invalid session"
}
```

#### Validation Errors
```json
{
  "error": "Invalid button alignment. Must be one of: left, center, right"
}
```

#### Database Errors
```json
{
  "error": "Failed to save settings"
}
```

---

## Rate Limits

### Admin API
- **Rate**: 40 requests per minute per shop
- **Burst**: Up to 10 requests per second

### Public API
- **Rate**: 100 requests per minute per IP
- **Burst**: Up to 20 requests per second

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 40
X-RateLimit-Remaining: 35
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response

`429 Too Many Requests`
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

---

## Code Examples

### JavaScript (Fetch API)

#### Get Settings
```javascript
const response = await fetch('/app/map-settings', {
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
});
const data = await response.json();
console.log(data.settings);
```

#### Save Settings
```javascript
const settings = {
  sameDayMode: 'image',
  sameDayImageUrl: 'https://example.com/map.png',
  // ... other settings
};

const response = await fetch('/app/map-settings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,
  },
  body: JSON.stringify(settings),
});
const data = await response.json();
```

#### Upload Image
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/app/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
  body: formData,
});
const data = await response.json();
console.log(data.url);
```

### Storefront (Public API)
```javascript
// Fetch settings for storefront display
const shop = 'store.myshopify.com';
const response = await fetch(`/api/map-settings/${shop}`);
const data = await response.json();
console.log(data.settings);
```

---

## Webhooks

Currently, the app does not emit custom webhooks. Standard Shopify app webhooks are handled:

- `app/uninstalled` - Triggered when app is uninstalled
- `app/scopes_update` - Triggered when app scopes are updated

---

## Versioning

API Version: `v1`

The API follows semantic versioning. Breaking changes will result in a new major version.

Current Version: `1.0.0`

---

## Support

For API support:
- Documentation: [Link to full docs]
- Email: api-support@example.com
- GitHub Issues: [Repository link]

---

**Last Updated**: 2025-11-28

