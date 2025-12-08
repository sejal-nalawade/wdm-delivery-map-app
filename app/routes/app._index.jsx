// File: app/routes/app._index.jsx
import { useState, useEffect, useCallback } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  let settings = await db.mapSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await db.mapSettings.create({
      data: { shop: session.shop },
    });
  }

  const pins = await db.deliveryPin.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: 'desc' },
  });

  return { settings, pins, shop: session.shop };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("action");

  if (actionType === "save") {
    const data = JSON.parse(formData.get("data"));
    
    await db.mapSettings.upsert({
      where: { shop: session.shop },
      update: data,
      create: { ...data, shop: session.shop },
    });

    return { success: true, message: "Settings saved" };
  }

  if (actionType === "createPin") {
    const pinData = JSON.parse(formData.get("data"));
    
    const pin = await db.deliveryPin.create({
      data: {
        shop: session.shop,
        title: pinData.title,
        latitude: parseFloat(pinData.latitude),
        longitude: parseFloat(pinData.longitude),
        deliveryMode: pinData.deliveryMode || "both",
        color: pinData.color || "#FF0000",
        hasRadius: pinData.hasRadius || false,
        radiusDistance: pinData.radiusDistance ? parseFloat(pinData.radiusDistance) : null,
        radiusUnit: pinData.radiusUnit || "km",
        fillColor: pinData.fillColor || "#5dade2",
        borderColor: pinData.borderColor || "#5dade2",
        borderThickness: pinData.borderThickness || 2,
        fillOpacity: pinData.fillOpacity ? parseFloat(pinData.fillOpacity) : 0.25,
      },
    });

    return { success: true, pin, message: "Pin created" };
  }

  if (actionType === "updatePin") {
    const pinData = JSON.parse(formData.get("data"));
    const pinId = formData.get("pinId");
    
    const pin = await db.deliveryPin.update({
      where: { id: pinId },
      data: {
        title: pinData.title,
        latitude: parseFloat(pinData.latitude),
        longitude: parseFloat(pinData.longitude),
        deliveryMode: pinData.deliveryMode,
        color: pinData.color,
        hasRadius: pinData.hasRadius,
        radiusDistance: pinData.radiusDistance ? parseFloat(pinData.radiusDistance) : null,
        radiusUnit: pinData.radiusUnit,
        fillColor: pinData.fillColor,
        borderColor: pinData.borderColor,
        borderThickness: pinData.borderThickness,
        fillOpacity: pinData.fillOpacity ? parseFloat(pinData.fillOpacity) : 0.25,
      },
    });

    return { success: true, pin, message: "Pin updated" };
  }

  if (actionType === "deletePin") {
    const pinId = formData.get("pinId");
    await db.deliveryPin.delete({ where: { id: pinId } });
    return { success: true, message: "Pin deleted" };
  }

  return { success: false };
};

export default function Index() {
  const { settings, pins: initialPins, shop } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  
  const [pins, setPins] = useState(initialPins || []);
  const [activeTab, setActiveTab] = useState("maps");
  const [editingMode, setEditingMode] = useState("sameDay");
  const [showPinModal, setShowPinModal] = useState(false);
  const [editingPin, setEditingPin] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    sameDayMode: settings.sameDayMode === "default" ? "interactive" : (settings.sameDayMode || "interactive"),
    sameDayImageUrl: settings.sameDayImageUrl || "",
    sameDayZoomLevel: settings.sameDayZoomLevel || 11,
    sameDayCenter: settings.sameDayCenter || '{"lat":40.7128,"lng":-74.0060}',
    sameDayTileProvider: settings.sameDayTileProvider || "",
    sameDayTileApiKey: settings.sameDayTileApiKey || "",
    scheduledMode: settings.scheduledMode === "default" ? "interactive" : (settings.scheduledMode || "interactive"),
    scheduledImageUrl: settings.scheduledImageUrl || "",
    scheduledZoomLevel: settings.scheduledZoomLevel || 4,
    scheduledCenter: settings.scheduledCenter || '{"lat":39.8283,"lng":-98.5795}',
    scheduledTileProvider: settings.scheduledTileProvider || "",
    scheduledTileApiKey: settings.scheduledTileApiKey || "",
    toggleTextSameDay: settings.toggleTextSameDay || "Same Day Delivery",
    toggleTextScheduled: settings.toggleTextScheduled || "Scheduled Delivery",
    buttonActiveColor: settings.buttonActiveColor || "#1a73e8",
    buttonInactiveColor: settings.buttonInactiveColor || "#f1f3f4",
    buttonAlignment: settings.buttonAlignment || "center",
    buttonShape: settings.buttonShape || "rounded",
    defaultMode: settings.defaultMode || "sameDay",
    showDescription: settings.showDescription !== false,
    descriptionSameDay: settings.descriptionSameDay || "We deliver same-day within the NYC metropolitan area.",
    descriptionScheduled: settings.descriptionScheduled || "Scheduled delivery available nationwide.",
  });

  const [pinForm, setPinForm] = useState({
    title: "",
    latitude: "",
    longitude: "",
    deliveryMode: "both",
    color: "#FF0000",
    hasRadius: false,
    radiusDistance: "",
    radiusUnit: "km",
    fillColor: "#5dade2",
    borderColor: "#5dade2",
    borderThickness: 2,
    fillOpacity: 0.25,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Track if we need to refresh the map after pin changes
  const [shouldRefreshMap, setShouldRefreshMap] = useState(false);

  // Show toast on successful actions
  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message || "Success");
      if (fetcher.data.pin) {
        // Refresh pins list
        setPins(prev => {
          const exists = prev.find(p => p.id === fetcher.data.pin.id);
          if (exists) {
            return prev.map(p => p.id === fetcher.data.pin.id ? fetcher.data.pin : p);
          }
          return [fetcher.data.pin, ...prev];
        });
        
        // Trigger map refresh
        setShouldRefreshMap(true);
      }
      setShowPinModal(false);
      resetPinForm();
    }
  }, [fetcher.data, shopify]);

  // Refresh map when pins change or mode switches (but NOT when formData changes)
  useEffect(() => {
    if (shouldRefreshMap && mapLoaded && window.adminMap) {
      setTimeout(() => {
        const mapContainer = document.getElementById('admin-map-preview');
        if (mapContainer) {
          // Clear and re-initialize map
          window.adminMap.remove();
          
          const centerKey = editingMode === "sameDay" ? "sameDayCenter" : "scheduledCenter";
          const zoomKey = editingMode === "sameDay" ? "sameDayZoomLevel" : "scheduledZoomLevel";
          
          let center;
          try {
            center = JSON.parse(formData[centerKey]);
          } catch {
            center = editingMode === "sameDay" ? { lat: 40.7128, lng: -74.0060 } : { lat: 39.8283, lng: -98.5795 };
          }

          const map = window.L.map('admin-map-preview').setView([center.lat, center.lng], formData[zoomKey]);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          // Add existing pins
          const modePins = pins.filter(p => p.deliveryMode === editingMode || p.deliveryMode === "both");
          modePins.forEach(pin => {
            addPinToMap(map, pin);
          });

          // Click to add pin
          map.on('click', (e) => {
            setPinForm(prev => ({
              ...prev,
              latitude: e.latlng.lat.toFixed(6),
              longitude: e.latlng.lng.toFixed(6),
              deliveryMode: editingMode, // Set delivery mode to match current editing mode
            }));
            setShowPinModal(true);
          });

          // Save map center on move (but don't trigger re-render)
          map.on('moveend', () => {
            const newCenter = map.getCenter();
            const newZoom = map.getZoom();
            // Update formData silently without triggering effects
            const centerKey = editingMode === "sameDay" ? "sameDayCenter" : "scheduledCenter";
            const zoomKey = editingMode === "sameDay" ? "sameDayZoomLevel" : "scheduledZoomLevel";
            setFormData(prev => ({
              ...prev,
              [centerKey]: JSON.stringify({ lat: newCenter.lat, lng: newCenter.lng }),
              [zoomKey]: newZoom
            }));
          });

          window.adminMap = map;
        }
        setShouldRefreshMap(false);
      }, 100);
    }
    // CRITICAL: Do NOT include formData in dependencies to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRefreshMap, mapLoaded, pins, editingMode]);

  // Refresh map when editingMode changes (switching between Same Day and Scheduled)
  useEffect(() => {
    if (mapLoaded && window.adminMap) {
      setShouldRefreshMap(true);
    }
  }, [editingMode, mapLoaded]);

  // Load Leaflet when interactive mode is selected
  useEffect(() => {
    const currentMode = editingMode === "sameDay" ? formData.sameDayMode : formData.scheduledMode;
    if ((currentMode === "interactive" || currentMode === "custom_tiles") && !mapLoaded) {
      loadLeaflet();
    }
  }, [formData.sameDayMode, formData.scheduledMode, editingMode, mapLoaded]);

  const loadLeaflet = useCallback(() => {
    if (typeof window !== 'undefined' && !window.L) {
      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        setMapLoaded(true);
        setTimeout(() => initMap(), 100);
      };
      document.body.appendChild(script);
    } else if (window.L) {
      setMapLoaded(true);
      setTimeout(() => initMap(), 100);
    }
  }, []);

  const initMap = useCallback(() => {
    if (typeof window === 'undefined' || !window.L) return;

    const mapContainer = document.getElementById('admin-map-preview');
    if (!mapContainer) return;

    // Clear existing map
    if (window.adminMap) {
      window.adminMap.remove();
    }

    const centerKey = editingMode === "sameDay" ? "sameDayCenter" : "scheduledCenter";
    const zoomKey = editingMode === "sameDay" ? "sameDayZoomLevel" : "scheduledZoomLevel";
    
    let center;
    try {
      center = JSON.parse(formData[centerKey]);
    } catch {
      center = editingMode === "sameDay" ? { lat: 40.7128, lng: -74.0060 } : { lat: 39.8283, lng: -98.5795 };
    }

    const map = window.L.map('admin-map-preview').setView([center.lat, center.lng], formData[zoomKey]);
    
    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add existing pins
    const modePins = pins.filter(p => p.deliveryMode === editingMode || p.deliveryMode === "both");
    modePins.forEach(pin => {
      addPinToMap(map, pin);
    });

    // Click to add pin
    map.on('click', (e) => {
      setPinForm(prev => ({
        ...prev,
        latitude: e.latlng.lat.toFixed(6),
        longitude: e.latlng.lng.toFixed(6),
        deliveryMode: editingMode, // Set delivery mode to match current editing mode
      }));
      setShowPinModal(true);
    });

    // Save map center on move (but don't trigger re-render)
    map.on('moveend', () => {
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();
      // Update formData silently without triggering effects
      setFormData(prev => ({
        ...prev,
        [centerKey]: JSON.stringify({ lat: newCenter.lat, lng: newCenter.lng }),
        [zoomKey]: newZoom
      }));
    });

    window.adminMap = map;
  }, [editingMode, formData, pins]);

  const addPinToMap = useCallback((map, pin) => {
    if (!window.L) return;

    // Create custom icon
    const icon = window.L.divIcon({
      className: 'custom-pin-marker',
      html: `<div style="
        background-color: ${pin.color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const marker = window.L.marker([pin.latitude, pin.longitude], { 
      icon,
      draggable: true 
    }).addTo(map);

    marker.bindPopup(`<strong>${pin.title}</strong><br/>
      <button onclick="window.editPin('${pin.id}')" style="margin-top:5px;padding:3px 8px;cursor:pointer;">Edit</button>
      <button onclick="window.deletePin('${pin.id}')" style="margin-top:5px;padding:3px 8px;cursor:pointer;background:#ff4444;color:white;border:none;">Delete</button>
    `);

    // Add radius circle if enabled
    if (pin.hasRadius && pin.radiusDistance) {
      const radiusInMeters = pin.radiusUnit === "miles" 
        ? pin.radiusDistance * 1609.34 
        : pin.radiusDistance * 1000;

      window.L.circle([pin.latitude, pin.longitude], {
        radius: radiusInMeters,
        color: pin.borderColor,
        weight: pin.borderThickness,
        fillColor: pin.fillColor,
        fillOpacity: pin.fillOpacity,
      }).addTo(map);
    }

    // Handle drag
    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      // Update pin position optimistically
      setPins(prev => prev.map(p => 
        p.id === pin.id ? { ...p, latitude: newPos.lat, longitude: newPos.lng } : p
      ));
      
      // Send update to server
      const data = new FormData();
      data.append("action", "updatePin");
      data.append("pinId", pin.id);
      data.append("data", JSON.stringify({
        ...pin,
        latitude: newPos.lat,
        longitude: newPos.lng,
      }));
      fetcher.submit(data, { method: "POST" });
    });
  }, [fetcher, setPins]);

  // Global functions for popup buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.editPin = (pinId) => {
        const pin = pins.find(p => p.id === pinId);
        if (pin) {
          setEditingPin(pin);
          setPinForm({
            title: pin.title,
            latitude: pin.latitude.toString(),
            longitude: pin.longitude.toString(),
            deliveryMode: pin.deliveryMode,
            color: pin.color,
            hasRadius: pin.hasRadius,
            radiusDistance: pin.radiusDistance?.toString() || "",
            radiusUnit: pin.radiusUnit,
            fillColor: pin.fillColor,
            borderColor: pin.borderColor,
            borderThickness: pin.borderThickness,
            fillOpacity: pin.fillOpacity,
          });
          setShowPinModal(true);
        }
      };

      window.deletePin = (pinId) => {
        if (confirm("Delete this pin?")) {
          handleDeletePin(pinId);
        }
      };
    }
  }, [pins]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModeChange = (mode, value) => {
    handleInputChange(mode, value);
    if (value === "interactive" || value === "custom_tiles") {
      setTimeout(() => {
        if (mapLoaded) {
          initMap();
        } else {
          loadLeaflet();
        }
      }, 100);
    }
  };

  const handleSave = () => {
    const data = new FormData();
    data.append("action", "save");
    data.append("data", JSON.stringify(formData));
    fetcher.submit(data, { method: "POST" });
  };

  const handleSavePin = () => {
    const data = new FormData();
    data.append("action", editingPin ? "updatePin" : "createPin");
    data.append("data", JSON.stringify(pinForm));
    if (editingPin) {
      data.append("pinId", editingPin.id);
    }
    fetcher.submit(data, { method: "POST" });
  };

  const handleDeletePin = (pinId) => {
    // Optimistic UI update - remove pin immediately
    setPins(prev => prev.filter(p => p.id !== pinId));
    
    // Trigger map refresh
    setShouldRefreshMap(true);
    
    // Send delete request to server
    const data = new FormData();
    data.append("action", "deletePin");
    data.append("pinId", pinId);
    fetcher.submit(data, { method: "POST" });
  };


  const resetPinForm = () => {
    setEditingPin(null);
    setPinForm({
      title: "",
      latitude: "",
      longitude: "",
      deliveryMode: "both",
      color: "#FF0000",
      hasRadius: false,
      radiusDistance: "",
      radiusUnit: "km",
      fillColor: "#5dade2",
      borderColor: "#5dade2",
      borderThickness: 2,
      fillOpacity: 0.25,
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleSelectSearchResult = (result) => {
    if (window.adminMap) {
      window.adminMap.flyTo([parseFloat(result.lat), parseFloat(result.lon)], 12);
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  const isLoading = fetcher.state === "submitting";
  const currentMode = editingMode === "sameDay" ? formData.sameDayMode : formData.scheduledMode;

  return (
    <s-page heading="Delivery Locations Map">
      <s-button slot="primary-action" onClick={handleSave} {...(isLoading ? { loading: true } : {})}>
        Save Settings
      </s-button>

      {/* Tabs */}
      <s-section>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {["maps", "pins", "buttons", "preview"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '400',
                backgroundColor: activeTab === tab ? '#000' : '#f1f1f1',
                color: activeTab === tab ? '#fff' : '#333',
              }}
            >
              {tab === "maps" && "Map Configuration"}
              {tab === "pins" && "Pins & Radius Zones"}
              {tab === "buttons" && "Button Customization"}
              {tab === "preview" && "Preview"}
            </button>
          ))}
        </div>
      </s-section>

      {/* Map Configuration Tab */}
      {activeTab === "maps" && (
        <>
          {/* Mode Selector */}
          <s-section>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => { 
                  setEditingMode("sameDay"); 
                  setShouldRefreshMap(true);
                }}
                style={{
                  padding: '10px 20px',
                  border: '2px solid',
                  borderColor: editingMode === "sameDay" ? '#1a73e8' : '#ccc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: editingMode === "sameDay" ? '#e8f0fe' : '#fff',
                }}
              >
                Same Day Delivery
              </button>
              <button
                onClick={() => { 
                  setEditingMode("scheduled"); 
                  setShouldRefreshMap(true);
                }}
                style={{
                  padding: '10px 20px',
                  border: '2px solid',
                  borderColor: editingMode === "scheduled" ? '#1a73e8' : '#ccc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: editingMode === "scheduled" ? '#e8f0fe' : '#fff',
                }}
              >
                Scheduled Delivery
              </button>
            </div>
          </s-section>

          <s-section heading={`${editingMode === "sameDay" ? "Same Day" : "Scheduled"} Delivery Map`}>
            <s-stack direction="block" gap="base">
              {/* Map Mode Dropdown */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Map Mode
                </label>
                <select
                  value={currentMode}
                  onChange={(e) => handleModeChange(
                    editingMode === "sameDay" ? "sameDayMode" : "scheduledMode",
                    e.target.value
                  )}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #c4cdd5',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                  }}
                >
                  <option value="interactive">Interactive World Map (Leaflet)</option>
                  <option value="custom_tiles">Custom Tiles (Mapbox/Google)</option>
                </select>
              </div>

              {/* Custom Image Upload */}
              {currentMode === "image" && (
                <s-text-field
                  label="Image URL"
                  value={editingMode === "sameDay" ? formData.sameDayImageUrl : formData.scheduledImageUrl}
                  onChange={(e) => handleInputChange(
                    editingMode === "sameDay" ? "sameDayImageUrl" : "scheduledImageUrl",
                    e.target.value
                  )}
                  placeholder="https://example.com/map.png"
                />
              )}

              {/* Custom Tiles Settings */}
              {currentMode === "custom_tiles" && (
                <>
                  <s-text-field
                    label="Tile Provider URL"
                    value={editingMode === "sameDay" ? formData.sameDayTileProvider : formData.scheduledTileProvider}
                    onChange={(e) => handleInputChange(
                      editingMode === "sameDay" ? "sameDayTileProvider" : "scheduledTileProvider",
                      e.target.value
                    )}
                    placeholder="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}"
                  />
                  <s-text-field
                    label="API Key"
                    value={editingMode === "sameDay" ? formData.sameDayTileApiKey : formData.scheduledTileApiKey}
                    onChange={(e) => handleInputChange(
                      editingMode === "sameDay" ? "sameDayTileApiKey" : "scheduledTileApiKey",
                      e.target.value
                    )}
                    placeholder="Your Mapbox or Google API key"
                    type="password"
                  />
                </>
              )}

              {/* Interactive Map Preview */}
              {(currentMode === "interactive" || currentMode === "custom_tiles") && (
                <div style={{ marginTop: '20px' }}>
                  {/* Search Box */}
                  <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search for a place (e.g., New York, Mumbai, London)"
                      style={{
                        flex: 1,
                        padding: '10px 15px',
                        border: '1px solid #c4cdd5',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                    <button
                      onClick={handleSearch}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#1a73e8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Search
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div style={{
                      marginBottom: '15px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}>
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSearchResult(result)}
                          style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            borderBottom: idx < searchResults.length - 1 ? '1px solid #e0e0e0' : 'none',
                            backgroundColor: '#fff',
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Map Container */}
                  <div
                    id="admin-map-preview"
                    style={{
                      width: '100%',
                      height: '450px',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                    }}
                  >
                    {!mapLoaded && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#666',
                      }}>
                        Loading map...
                      </div>
                    )}
                  </div>

                  <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
                    💡 Click anywhere on the map to add a pin. Drag pins to reposition them.
                  </p>
                </div>
              )}

              {/* Description */}
              <s-checkbox
                checked={formData.showDescription}
                onChange={(e) => handleInputChange("showDescription", e.target.checked)}
              >
                Show description text
              </s-checkbox>

              {formData.showDescription && (
                <s-text-field
                  label="Description"
                  value={editingMode === "sameDay" ? formData.descriptionSameDay : formData.descriptionScheduled}
                  onChange={(e) => handleInputChange(
                    editingMode === "sameDay" ? "descriptionSameDay" : "descriptionScheduled",
                    e.target.value
                  )}
                  multiline
                />
              )}
            </s-stack>
          </s-section>
        </>
      )}

      {/* Pins & Radius Zones Tab */}
      {activeTab === "pins" && (
        <s-section heading="Delivery Pins & Radius Zones">
          <s-stack direction="block" gap="base">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => { setShowPinModal(true); resetPinForm(); }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                + Add New Pin
              </button>
            </div>

            {/* Pins List */}
            {pins.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                <p style={{ color: '#666', marginBottom: '15px' }}>No pins added yet.</p>
                <p style={{ color: '#999', fontSize: '14px' }}>
                  Go to "Map Configuration" tab, select "Interactive World Map", and click on the map to add pins.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {pins.map(pin => (
                  <div
                    key={pin.id}
                    style={{
                      padding: '20px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '12px',
                      backgroundColor: '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: pin.color,
                          }} />
                          <strong style={{ fontSize: '16px' }}>{pin.title}</strong>
                        </div>
                        <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                          📍 {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                        </p>
                        <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                          Mode: {pin.deliveryMode === "both" ? "Both" : pin.deliveryMode === "sameDay" ? "Same Day" : "Scheduled"}
                        </p>
                        {pin.hasRadius && (
                          <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                            🎯 Radius: {pin.radiusDistance} {pin.radiusUnit}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => {
                            setEditingPin(pin);
                            setPinForm({
                              title: pin.title,
                              latitude: pin.latitude.toString(),
                              longitude: pin.longitude.toString(),
                              deliveryMode: pin.deliveryMode,
                              color: pin.color,
                              hasRadius: pin.hasRadius,
                              radiusDistance: pin.radiusDistance?.toString() || "",
                              radiusUnit: pin.radiusUnit,
                              fillColor: pin.fillColor,
                              borderColor: pin.borderColor,
                              borderThickness: pin.borderThickness,
                              fillOpacity: pin.fillOpacity,
                            });
                            setShowPinModal(true);
                          }}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #1a73e8',
                            borderRadius: '6px',
                            backgroundColor: '#fff',
                            color: '#1a73e8',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePin(pin.id)}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #dc3545',
                            borderRadius: '6px',
                            backgroundColor: '#fff',
                            color: '#dc3545',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </s-stack>
        </s-section>
      )}

      {/* Button Customization Tab */}
      {activeTab === "buttons" && (
        <s-section heading="Toggle Button Settings">
          <s-stack direction="block" gap="base">
            <s-text-field
              label="Same Day Button Text"
              value={formData.toggleTextSameDay}
              onChange={(e) => handleInputChange("toggleTextSameDay", e.target.value)}
            />

            <s-text-field
              label="Scheduled Button Text"
              value={formData.toggleTextScheduled}
              onChange={(e) => handleInputChange("toggleTextScheduled", e.target.value)}
            />

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Default Active Mode
              </label>
              <select
                value={formData.defaultMode}
                onChange={(e) => handleInputChange("defaultMode", e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #c4cdd5',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="sameDay">Same Day Delivery</option>
                <option value="scheduled">Scheduled Delivery</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Button Alignment
              </label>
              <select
                value={formData.buttonAlignment}
                onChange={(e) => handleInputChange("buttonAlignment", e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #c4cdd5',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Button Shape
              </label>
              <select
                value={formData.buttonShape}
                onChange={(e) => handleInputChange("buttonShape", e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #c4cdd5',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              >
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="pill">Pill</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Active Button Color
                </label>
                <input
                  type="color"
                  value={formData.buttonActiveColor}
                  onChange={(e) => handleInputChange("buttonActiveColor", e.target.value)}
                  style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Inactive Button Color
                </label>
                <input
                  type="color"
                  value={formData.buttonInactiveColor}
                  onChange={(e) => handleInputChange("buttonInactiveColor", e.target.value)}
                  style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </s-stack>
        </s-section>
      )}

      {/* Preview Tab */}
      {activeTab === "preview" && (
        <s-section heading="Storefront Preview">
          <div style={{
            padding: '30px',
            backgroundColor: '#f9f9f9',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            {/* Toggle Buttons Preview */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: formData.buttonAlignment,
              marginBottom: '20px',
            }}>
              <button style={{
                padding: '12px 24px',
                backgroundColor: formData.buttonActiveColor,
                color: '#fff',
                border: 'none',
                borderRadius: formData.buttonShape === 'pill' ? '50px' : formData.buttonShape === 'rounded' ? '8px' : '0',
                cursor: 'pointer',
                fontWeight: '500',
              }}>
                {formData.toggleTextSameDay}
              </button>
              <button style={{
                padding: '12px 24px',
                backgroundColor: formData.buttonInactiveColor,
                color: '#333',
                border: 'none',
                borderRadius: formData.buttonShape === 'pill' ? '50px' : formData.buttonShape === 'rounded' ? '8px' : '0',
                cursor: 'pointer',
                fontWeight: '500',
              }}>
                {formData.toggleTextScheduled}
              </button>
            </div>

            {/* Map Preview */}
            <div style={{
              height: '300px',
              backgroundColor: '#e0e0e0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
            }}>
              Map will appear here on storefront
            </div>

            {/* Description Preview */}
            {formData.showDescription && (
              <p style={{ marginTop: '15px', color: '#666' }}>
                {formData.descriptionSameDay}
              </p>
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Installation Instructions:</h3>
            <ol style={{ lineHeight: '2', color: '#666' }}>
              <li>Go to <strong>Online Store → Themes</strong></li>
              <li>Click <strong>"Customize"</strong> on your active theme</li>
              <li>Add a section and select <strong>"Delivery Locations Map"</strong></li>
              <li>Save your changes</li>
            </ol>
          </div>
        </s-section>
      )}

      {/* Pin Modal */}
      {showPinModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ marginBottom: '20px' }}>
              {editingPin ? "Edit Pin" : "Add New Pin"}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={pinForm.title}
                  onChange={(e) => setPinForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., NYC Warehouse"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={pinForm.latitude}
                    onChange={(e) => setPinForm(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="40.7128"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={pinForm.longitude}
                    onChange={(e) => setPinForm(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="-74.0060"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Delivery Mode
                </label>
                <select
                  value={pinForm.deliveryMode}
                  onChange={(e) => setPinForm(prev => ({ ...prev, deliveryMode: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                  }}
                >
                  <option value="both">Both (Same Day & Scheduled)</option>
                  <option value="sameDay">Same Day Only</option>
                  <option value="scheduled">Scheduled Only</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Pin Color
                </label>
                <input
                  type="color"
                  value={pinForm.color}
                  onChange={(e) => setPinForm(prev => ({ ...prev, color: e.target.value }))}
                  style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                />
              </div>

              {/* Radius Section */}
              <div style={{
                padding: '15px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={pinForm.hasRadius}
                    onChange={(e) => setPinForm(prev => ({ ...prev, hasRadius: e.target.checked }))}
                  />
                  <span style={{ fontWeight: '500' }}>Enable Delivery Radius Zone</span>
                </label>

                {pinForm.hasRadius && (
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                          Radius
                        </label>
                        <input
                          type="number"
                          value={pinForm.radiusDistance}
                          onChange={(e) => setPinForm(prev => ({ ...prev, radiusDistance: e.target.value }))}
                          placeholder="5"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                          Unit
                        </label>
                        <select
                          value={pinForm.radiusUnit}
                          onChange={(e) => setPinForm(prev => ({ ...prev, radiusUnit: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '6px',
                          }}
                        >
                          <option value="km">Kilometers</option>
                          <option value="miles">Miles</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                          Fill Color
                        </label>
                        <input
                          type="color"
                          value={pinForm.fillColor}
                          onChange={(e) => setPinForm(prev => ({ ...prev, fillColor: e.target.value }))}
                          style={{ width: '50px', height: '35px', cursor: 'pointer' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                          Border Color
                        </label>
                        <input
                          type="color"
                          value={pinForm.borderColor}
                          onChange={(e) => setPinForm(prev => ({ ...prev, borderColor: e.target.value }))}
                          style={{ width: '50px', height: '35px', cursor: 'pointer' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                          Opacity ({pinForm.fillOpacity})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={pinForm.fillOpacity}
                          onChange={(e) => setPinForm(prev => ({ ...prev, fillOpacity: parseFloat(e.target.value) }))}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowPinModal(false); resetPinForm(); }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                disabled={!pinForm.title || !pinForm.latitude || !pinForm.longitude}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#1a73e8',
                  color: '#fff',
                  cursor: 'pointer',
                  opacity: (!pinForm.title || !pinForm.latitude || !pinForm.longitude) ? 0.5 : 1,
                }}
              >
                {editingPin ? "Update Pin" : "Add Pin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <s-section slot="aside" heading="Getting Started">
        <s-paragraph>
          Configure your delivery zones and customize the appearance of your map display.
        </s-paragraph>
        <s-paragraph>
          The map will show customers where you offer same-day vs scheduled delivery.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Tips">
        <s-unordered-list>
          <s-list-item>
            Use Interactive Map for precise pin placement
          </s-list-item>
          <s-list-item>
            Search for locations by name
          </s-list-item>
          <s-list-item>
            Click on map to add pins
          </s-list-item>
          <s-list-item>
            Drag pins to reposition
          </s-list-item>
          <s-list-item>
            Add radius zones to show coverage
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
