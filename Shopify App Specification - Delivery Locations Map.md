**Shopify App Specification \- Delivery Locations Map**

# **Shopify App Specification — Delivery Locations Map App**

## **1\. App Name**

**Delivery Locations Map App**  
 (Internal Project Name: `wdm-delivery-map-app`)

---

# **2\. Purpose / Overview**

Merchants need a simple, visual way to display **where they deliver same-day vs scheduled delivery** on their storefront.

This app allows merchants to embed an interactive section on their homepage or any Online Store 2.0 page with:

* Two toggle buttons:

  * **Same Day Delivery**

  * **Scheduled Delivery**

* A map that switches between:

  * **NYC metropolitan delivery zone (zoomed)**

  * **Full USA map (zoomed out)**

This is not a shipping-rules app — it is a **visual explanation** tool for customers.

---

# **3\. Core Features**

## **3.1 Map Toggle Modes**

### **A. Same Day Delivery**

* Highlighted NYC metro zone

* Auto zoom-in on NYC

* Customizable polygon or static image

### **B. Scheduled Delivery**

* Full USA map

* Auto zoom-out

* Customizable zone or static image

### **Toggle Behavior**

* Two buttons switch between the two modes

* Smooth transition (fade/instant toggle)

* Optional descriptive text changes per mode

---

# **4\. Admin Panel / Merchant Controls (Inside Shopify App Dashboard)**

## **4.1 Map Assets**

Merchant can choose for each mode:

* Upload custom map image

* OR choose default map (NYC zone / USA zone)

* OR upload GeoJSON

* OR draw polygon (future enhancement)

## **4.2 Button Customization**

Merchant can change:

* Button text

* Button color

* Active/inactive style

* Alignment (left, center, right)

* Shape (rounded, pill, square)

## **4.3 Display Settings**

* Default active mode

* Zoom level for each map

* Map style:

  * Static image

  * SVG highlight

  * Leaflet/Mapbox interactive (optional toggle)

* Show/hide descriptions

* Custom description content

## **4.4 Embedding Settings**

* Automatic Online Store 2.0 App Block

* HTML embed code for custom sections

* Script-tag injection option

---

# **5\. Front-End Requirements (Storefront)**

## **5.1 Section Layout**

1. Title (editable)

2. Description text

3. Toggle buttons

4. Map display container

5. Optional caption/footer text

## **5.2 Map Visualization Options**

* Static images (fastest)

* SVG with highlighted delivery zones

* Leaflet.js or Mapbox (optional interactive mode)

* No jQuery

## **5.3 Mobile Responsiveness**

* Buttons stack vertically on mobile

* Map scales proportionally

* Touch interactions allowed (optional zoom/pan)

## **5.4 Performance**

* \<100kb JS if possible

* Lazy load maps

* No blocking scripts

---

# **6\. Technical Requirements**

## **6.1 Shopify App Type**

* Node.js \+ React Router Shopify App Template

* Includes App Extension for theme blocks

## **6.2 Theme App Block**

### **Block Settings:**

* Toggle text customization

* Enable/disable descriptions

* Upload static maps

* Select interactive/static mode

* Select default active mode

### **Block Output:**

* A map section with toggle UI

* Pulls config from merchant settings

## **6.3 Backend**

* Store settings in app database

* Expose endpoints for:

  * Saving settings

  * Fetching map configurations

  * GeoJSON uploads

## **6.4 Data Models**

### **MapSettings**

{  
  merchantId,  
  sameDay: {  
    mode: "default" | "image" | "geojson",  
    imageUrl,  
    geoJson,  
    zoomLevel  
  },  
  scheduled: {  
    mode: "default" | "image" | "geojson",  
    imageUrl,  
    geoJson,  
    zoomLevel  
  },  
  ui: {  
    toggleTextSameDay,  
    toggleTextScheduled,  
    buttonStyles,  
    defaultMode,  
    showDescription  
  }  
}

---

# **7\. App User Flow**

## **Step 1 — Install App**

Merchant installs the app via Shopify Admin.

## **Step 2 — Configure Delivery Zones**

Merchant sets:

* Map mode

* Images or GeoJSON

* Zoom levels

## **Step 3 — Customize UI**

Merchant edits:

* Button text

* Button style

* Section title & description

## **Step 4 — Add Section to Theme**

* Theme Editor → Add section → "Delivery Locations Map"

* Configure on-page settings

## **Step 5 — Customer View**

Customer sees:

* Two toggle buttons

* Map switching between NYC zone and US zone

---

# **8\. Future Enhancements (Optional)**

### **Not required for V1 but document for future:**

#### **A. Address-Based Zone Matching**

* Detect customer location

* Highlight correct delivery mode automatically

#### **B. Checkout Restrictions**

* Prevent same-day delivery at checkout outside NYC zone

#### **C. Custom Zone Drawing**

* Radius tool

* Freehand polygon

---

# **9\. Marketing / Use Case Summary**

This app helps merchants visually show:

✔ Local delivery \+ nationwide shipping  
 ✔ Same-day city delivery  
 ✔ Scheduled regional delivery  
 ✔ Nationwide delivery vs metro delivery

Perfect for:

* Food delivery

* Flowers

* Bakeries

* Gift delivery

* Courier services

* Local \+ national ecommerce

---

# **10\. Included Assets (Defaults)**

* NYC Delivery Zone (SVG or PNG)

* USA Map Outline (SVG or PNG)

* Sample descriptions

* Sample button styles

---

# **11\. Development Tasks Breakdown (For Cursor)**

## **Backend**

* Implement MapSettings model

* Create REST endpoints

* Handle image uploads

* Handle GeoJSON uploads

## **Frontend (Admin)**

* React admin UI

* Map settings form

* Button customization UI

* Description editor

## **Theme Extension**

* Build theme section

* Add toggle UI

* Render maps

* Sync settings from backend

## **Testing**

* Mobile display

* Theme editor preview

* App install/uninstall behavior

---

# **12\. Deliverables**

* Fully working Shopify app

* Admin UI

* Storefront app block

* Setting storage

* Toggle-based map display

* Documentation

# **\~\~\~**

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