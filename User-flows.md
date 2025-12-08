# Problem & Goal — concise

Currently the admin **Map Mode** dropdown only shows options and does not trigger any map integration or UI changes. Selecting a mode (e.g., **Interactive World Map (Leaflet)** or **Custom Tiles (Mapbox/Google)**) performs no action and no map tiles are loaded. Merchants need a fully working flow so they can:

* Choose a map mode
* See a live map preview (searchable by place/country)
* Add unlimited pins by clicking/dragging on the preview
* Add an optional radius to each pin (e.g., 200 m) that draws a translucent circle
* Persist all data to the backend per merchant and per mode (Same Day / Scheduled)
* Render the configured maps and pins on the storefront with two toggle buttons (“Same day delivery”, “Scheduled delivery”) that show the corresponding locations

Below is a complete, implementation-ready specification that fixes the dropdown-UI issue and fully describes the admin + backend + storefront behavior, data structures, API, UI flows, validation, error handling and testing.

---

# 1. High-level user flows

## Admin (merchant)

1. Merchant opens app admin → **Delivery Locations Map**.
2. Merchant chooses a mode for **Same Day** and/or **Scheduled** (Static image, Interactive (Leaflet), Custom Tiles).
3. For interactive modes, merchant sees a **live map widget** (tiles loaded) and search box. They can:

   * Search for a country, city, or address and the map will center on that place.
   * Click on the map to add a pin (or drag an existing pin to reposition).
   * Click a pin to edit title, description, color, icon, and toggle/enter radius (km/miles).
   * Add unlimited pins.
4. Merchant saves settings. Backend persists settings (per merchant, per mode).
5. Merchant installs block on storefront: toggle buttons shown; selecting a button switches maps on the storefront with pins and radius circles displayed.

## Storefront (customer)

1. Page shows two toggle buttons (“Same day delivery”, “Scheduled delivery”) and a map container.
2. By default the merchant’s `defaultMode` is active.
3. When user clicks a toggle, the map switches (flyTo or fade) to the corresponding zoom/center, pins and radius are shown.

---

# 2. UI Requirements & Behavior (Admin)

## Admin Map Configuration panel (per mode)

* Mode dropdown:

  * Options: `Default NYC Map (Static)`, `Custom Image Upload`, `Interactive World Map (Leaflet)`, `Custom Tiles (Mapbox/Google)`.
  * On change: **immediately update the right-hand preview pane** and reveal mode-specific controls (no further click required).

### For `Interactive World Map (Leaflet)`:

* Map preview area (centered on default or previously saved center).
* Search box (autocomplete; server-side or client-side geocoding): typing “India”, “Mumbai” or “New York” centers map to the result.
* Zoom controls, provider attribution.
* Map will load OpenStreetMap tiles by default.
* Side panel with pin list and controls.

### For `Custom Tiles (Mapbox/Google)`:

* Inputs: API key, style URL (Mapbox style / Google style options).
* Button: “Test tiles” — loads a temporary map preview to validate credentials.
* If `Test tiles` fails, show descriptive error (invalid key, exceeded quota).

### For `Custom Image Upload`:

* Image upload control; a preview shows the image.
* Pin placement will be handled via an overlay that maps click coordinates to image-relative coordinates (X%, Y%) for storefront rendering.
* A reminder: for precise mapping, upload aspect ratio should match the final storefront container (guidance text).

## Pins & Radius UI

* **Add Pin** button — or click on map to add pin.
* Pin edit modal:

  * Title (required)
  * Description (optional)
  * Color (hex/color picker)
  * Icon upload (SVG/PNG, optional)
  * Radius section:

    * Enable radius (checkbox)
    * Radius value (numeric)
    * Unit (meters / kilometers / miles)
    * Border thickness (px)
    * Fill color & opacity slider
  * Delivery type (same-day / scheduled / both) — useful if merchant wants one pin to show for both modes.
* Drag handle on pin to reposition; dragging updates lat/lng or X/Y depending on map mode.
* Unlimited pin count (UI should support pagination or search/filter once list is large).

## Preview Tab

* Live preview combining button UI + map (the same rendering that will be used on storefront).
* Provide a “Sandbox preview” option that opens a small test page or iframe.

## Accessibility

* Keyboard navigation for the map control (tab to pins, Enter to edit).
* ARIA labels for buttons and pin elements.

---

# 3. Backend — API & Data Model

## Data model (MapSettings primary document)

Example JSON stored per merchant:

```json
{
  "merchantId": "shop_12345",
  "ui": {
    "toggleTextSameDay": "Same Day Delivery",
    "toggleTextScheduled": "Scheduled Delivery",
    "defaultMode": "sameDay",
    "buttonStyles": { "activeBg":"#1a73e8", "inactiveBg":"#f1f3f4", "textColor":"#fff" }
  },
  "sameDay": {
    "mapMode": "interactive", // interactive | image | tiles | default
    "provider": { "type":"osm" }, // or mapbox, google, image
    "center": [40.7128, -74.0060],
    "zoom": 12,
    "imageUrl": null,
    "tiles": { "apiKey": null, "styleUrl": null },
    "pins": [
      {
        "id":"uuid-1",
        "title":"NYC Hub",
        "description":"Dispatch center",
        "lat":40.7128,
        "lng":-74.0060,
        "xPercent": null,
        "yPercent": null,
        "color":"#FF0000",
        "iconUrl": null,
        "radiusMeters": 200,
        "radiusFill":"#5dade2",
        "radiusOpacity": 0.25,
        "radiusBorder": "#79BFF1",
        "deliveryType":"sameDay",
        "createdAt": "2025-12-04T12:00:00Z"
      }
    ]
  },
  "scheduled": { /* same schema as sameDay */ },
  "createdAt":"...",
  "updatedAt":"..."
}
```

### Notes:

* For `Custom Image Upload`, store both `imageUrl` and `xPercent/yPercent` for pin placement. Lat/lng will be null for images.
* For interactive maps use `lat/lng` and `radiusMeters`.
* `id` must be unique per pin.

## API endpoints

* `GET /api/v1/settings` — returns full MapSettings for the merchant
* `POST /api/v1/settings` — replace settings (validate)
* `PATCH /api/v1/settings` — partial update
* `POST /api/v1/uploads/image` — upload image, returns `imageUrl`
* `POST /api/v1/uploads/icon` — upload pin icon, returns `iconUrl`
* `POST /api/v1/pins` — create pin (body: mode, pin object) → returns saved pin with id
* `PATCH /api/v1/pins/:pinId` — update pin
* `DELETE /api/v1/pins/:pinId` — delete pin
* `POST /api/v1/tiles/test` — validate tiles credentials (mapbox/google)
* `GET /api/v1/geojson/:id` — (if GeoJSON support)
* `POST /api/v1/preview-token` — optional: generate preview token for iframe preview

## Validation rules (server-side)

* lat ∈ [-90,90], lng ∈ [-180,180]
* xPercent, yPercent ∈ [0,100] when used
* color: valid hex or css color
* radiusMeters >= 0 and <= 5,000,000 (or configurable)
* icon file types: svg/png/jpg; size limit (e.g., 500KB)
* tile API key length and styleUrl formats (basic sanitization)

## Security

* Ensure endpoints are authorized — only merchant with correct OAuth/Session may access.
* Sanitize file uploads, limit size, content-type checks.
* Store map provider keys encrypted and return limited tokenized preview access instead of keys to client where possible.

---

# 4. Frontend (Storefront embed) — behavior & integration

## Embed scaffold (theme block)

Theme app block renders minimal HTML and includes an embed script:

```html
<div id="delivery-map-app"
     data-settings-url="https://app.example.com/api/v1/settings?shop=example"
     data-default-mode="sameDay">
  <!-- title, description -->
  <div class="dlma-toggle">
    <button data-mode="sameDay">Same day delivery</button>
    <button data-mode="scheduled">Scheduled delivery</button>
  </div>
  <div id="dlma-map-container"></div>
</div>
<script src="https://app.example.com/embed/delivery-map-embed.js" defer></script>
```

## Embed script responsibilities

* Fetch `MapSettings` from `data-settings-url`
* Render toggle UI using `ui` settings
* Based on active mode:

  * If mode is `image`: render `<img src="imageUrl">` and overlay pins at X/Y% positions
  * If mode is `interactive` or `tiles`: lazy-load Leaflet (CSS + JS) only when interactive mode is required

    * For `tiles` use Leaflet tile layer with styleUrl & apiKey (if Mapbox, use `{id: styleUrl, accessToken: apiKey}`)
* Render pins:

  * For leaflet: `L.marker([lat,lng], options).addTo(map)`
  * For image overlays: position absolute elements using `xPercent`/`yPercent`
* Render radius:

  * For leaflet: `L.circle([lat, lng], {radius: radiusMeters, color: borderColor, fillColor, fillOpacity}).addTo(map)`
  * For image: draw an SVG circle centered at x,y scaled against image px dimensions; convert radiusMeters → pixel radius if you know map scale (for static images we rely on merchant provided radius in pixels or approximate meters via provided DPI/scale guidance)
* Smooth transitions: on toggle, `map.flyTo(center, zoom)` for leaflet, or fade image when static.

## Map search on frontend admin

* Use geocoding provider:

  * Option A: Use server-side geocoding endpoint (app makes request to Mapbox/Google with stored API key on behalf of merchant) — secure, avoids exposing keys.
  * Option B: Use a permissive open geocoding server for admin preview (Nominatim) — note rate-limits and TOS.
* Implement autocomplete & search results list; clicking result `flyTo` center + set zoom.

## Image-mode pin scaling

* Store and use `xPercent` and `yPercent` so pins track when the image is resized responsively:

  * pinLeftPx = imageWidth * xPercent / 100
  * pinTopPx = imageHeight * yPercent / 100

---

# 5. Admin implementation details (UX/technical)

## Dropdown non-action bug — fix

* Current bug: selecting a dropdown option does not call the logic that initializes that mode.
* Fix: wire the dropdown `onChange` handler to:

  1. Update local admin UI state `mode` immediately.
  2. If mode = `interactive` or `tiles` → call `initMapPreview(modeSettings)`.
  3. If mode = `image` → load image preview and pin overlay.
  4. If tiles selected → validate via `POST /api/v1/tiles/test` and show tiles in preview. Show spinner & error messages.

## Map preview initialization

`initMapPreview(config)` must:

* Unmount any previous map instance and its event listeners
* If `interactive`:

  * Dynamically import Leaflet script + CSS
  * Create a Leaflet map in preview container with `center` and `zoom`
  * Add default OSM tile layer or provider-specific tile layer
  * Add pin markers from config.pins and enable drag handlers for each marker
  * Add control to add pin on click
  * Add search (geocoder) control that queries server-side geocoding and `flyTo`
* If `image`:

  * Render image with overlay `<div>` sized to image
  * Add click-to-add-pin at pointer coordinates; convert to x%/y%
  * Support drag-to-reposition and pixel→percent conversion

## Pin drag & save flow

* When a pin is dragged:

  * Update local pin state (lat/lng or x/y)
  * Mark `dirty: true` on settings
  * Provide a `Save changes` CTA (polled autosave optional)
* On Save:

  * Send `PATCH /api/v1/pins/:id` or `POST /api/v1/pins` as appropriate
  * Show success toast or inline error message on failure

## Radius editor

* Exposed in pin edit modal with immediate preview:

  * For leaflet: change circle radius in meters and see it scale instantly
  * For image: show an approximate pixel circle; store radius value (indicate measurement limitation and guidance)

---

# 6. Storefront rendering specifics & constraints

## Performance

* Keep core embed <100KB where possible.
* Lazy-load vendor libs:

  * Leaflet JS/CSS only if the page is using interactive mode.
  * Mapbox SDK only if tiles chosen.
* Use `loading="lazy"` for images.

## Fallbacks

* If tile provider fails in storefront (bad key, quota), fall back to:

  * OSM (if available) with notice to merchant in admin
  * Static image (if merchant provided one)
* If a pin has invalid coordinates, do not render it and log an error to the merchant settings page.

## Accessibility & Mobile

* Buttons stack vertically on small screens.
* Pins are tappable; tooltips appear above pin on tap (and dismiss on second tap).
* Map container supports pinch-to-zoom (if interactive).

---

# 7. Edge cases & expected behavior

* **Large pin count**: paginate admin pin list and cluster markers on storefront (Leaflet marker clustering) if > 50 pins by default (configurable).
* **Changing map image**: warn merchant that changing the base image may require re-positioning pins (because pixel positions change). Offer “reproject” utility (manual repositioning overlay).
* **Conflicting pin coordinates**: two pins at same coords are allowed; show stacked or slight offset in UI or cluster display.
* **Unit conversions**: if merchant enters radius in km/miles, convert to meters for leaflet rendering.
* **Offline or blocking scripts**: ensure embed script gracefully fails and shows an informative message instead of breaking the page.

---

# 8. Testing checklist (developer QA)

### Admin

* [ ] Dropdown selection immediately initializes the correct preview (image, interactive, tiles).
* [ ] Search (geocode) centers map correctly across multiple queries (country, city, postal code).
* [ ] Add pin by clicking; pin saves to DB and appears in list.
* [ ] Drag pin to new position; position updates in DB.
* [ ] Edit pin metadata (title, description, color, icon); changes persist.
* [ ] Add radius; circle appears with correct meters and opacity; persists.
* [ ] Tiles provider test works & displays tiles; invalid keys show clear error.
* [ ] Large number of pins: pin list performance OK; clustering in preview and storefront.

### Storefront

* [ ] Toggles switch maps instantly; flyTo or fade animation occurs.
* [ ] Pins render with correct coordinates and icons.
* [ ] Radius circles render accurate size on interactive maps.
* [ ] Image-mode pins positioned correctly when page resizes.
* [ ] Mobile: buttons stack, pins tappable, tooltips readable.

### Security & Validation

* [ ] Upload limits enforced and invalid files rejected.
* [ ] API endpoints require proper auth.
* [ ] Input sanitisation prevents injection via text fields.

---

# 9. Implementation plan — prioritized tasks

## Sprint 1 — Fix & Foundation

* Wire dropdown `onChange` to `initMapPreview` (fix bug).
* Implement `GET/POST/PATCH /api/v1/settings`.
* Add basic interactive preview using Leaflet with OSM.
* Add click-to-add pin and save pins endpoint.
* Add basic storefront embed: loads settings, renders static image or interactive map.

## Sprint 2 — Pins & Radius

* Implement pin edit modal and radius UI.
* Implement icon uploads & icon rendering.
* Implement geocoding: server-side proxy to Mapbox/Google or Nominatim fallback.
* Add server validation and secure key storage.

## Sprint 3 — Tiles, Clustering & Polish

* Add Mapbox/Google Tiles support and `test credentials` endpoint.
* Marker clustering for storefront.
* Performance optimizations & caching.
* Accessibility and a11y review.

---

# 10. Example sequences (detailed)

## Admin: Add pin by clicking (interactive map)

1. Merchant selects `Interactive World Map (Leaflet)` from dropdown → `onChange` triggers `initMapPreview`.
2. `initMapPreview` lazy-loads Leaflet and sets a tile layer (OSM).
3. Merchant searches “Mumbai” → `geocode('Mumbai')` returns coords → `map.flyTo([lat,lng], zoom=12)`.
4. Merchant clicks on the map → `map.on('click', e => openPinModal(e.latlng))`.
5. Pin modal opens prefilled with lat/lng → merchant enters “Warehouse 1” → Save.
6. Client calls `POST /api/v1/pins` with pin body → server stores pin → returns saved pin with `id`.
7. UI renders the new marker and adds it to list.

## Storefront: Toggle to same-day

1. Customer clicks “Same day delivery” button.
2. Embed script checks `settings.sameDay.mapMode`:

   * If `interactive`: ensure Leaflet is loaded; call `map.flyTo(settings.sameDay.center, settings.sameDay.zoom)`, add markers and circles for pins with `deliveryType` matching same-day or both.
   * If `image`: swap to static image and render overlays for pins with `xPercent/yPercent`.
3. Animation: fade transition (CSS) or Leaflet `flyTo`.

---

# 11. UX notes & merchant guidance (copy to show in admin)

* “When using Custom Image Upload, pin placement is relative to the image. If you replace the image with a different aspect ratio, you will need to reposition pins.”
* “For accurate global coordinates use Interactive World Map. For branded maps, use Custom Image Upload.”
* “For Mapbox/Google tiles, provide an API key and click ‘Test tiles’ — the map preview will show your custom style if the key is valid.”
* “Use radii sparingly for very large values to avoid visual clutter (we recommend <100 km for single circles).”

---

# 12. Deliverables & acceptance

* Dropdown mode selection fully functional and initializes preview immediately.
* Admin interactive map supports geosearch, unlimited pins, drag-to-move, edit, delete.
* Each pin supports optional radius with live visualization.
* Backend endpoints persist settings/pins securely per merchant.
* Storefront block shows two toggles and renders mode-specific maps + pins + radius circles.
* Full testing (admin & storefront), docs and merchant-facing guidance included.

---

