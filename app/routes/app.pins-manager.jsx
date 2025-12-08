// File: app/routes/app.pins-manager.jsx
import { useState, useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  const pins = await db.deliveryPin.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: 'desc' },
  });

  return { pins, shop: session.shop };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "create") {
    const data = JSON.parse(formData.get("data"));
    
    await db.deliveryPin.create({
      data: {
        shop: session.shop,
        ...data,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        radiusDistance: data.radiusDistance ? parseFloat(data.radiusDistance) : null,
        fillOpacity: data.fillOpacity ? parseFloat(data.fillOpacity) : 0.25,
      },
    });

    return { success: true };
  }

  if (action === "delete") {
    const id = formData.get("id");
    await db.deliveryPin.delete({ where: { id } });
    return { success: true };
  }

  return { success: false };
};

export default function PinsManager() {
  const { pins } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
    borderThickness: 1,
    fillOpacity: 0.25,
  });

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("Pin saved successfully");
      setShowForm(false);
      setFormData({
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
        borderThickness: 1,
        fillOpacity: 0.25,
      });
    }
  }, [fetcher.data?.success, shopify]);

  const handleSubmit = () => {
    const data = new FormData();
    data.append("action", "create");
    data.append("data", JSON.stringify(formData));
    fetcher.submit(data, { method: "POST" });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this pin?")) {
      const data = new FormData();
      data.append("action", "delete");
      data.append("id", id);
      fetcher.submit(data, { method: "POST" });
    }
  };

  const isLoading = fetcher.state === "submitting";

  return (
    <s-page heading="Delivery Pins & Zones">
      <s-button slot="primary-action" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add Pin"}
      </s-button>

      {showForm && (
        <s-section heading="Add New Pin">
          <s-stack direction="block" gap="base">
            <s-text-field
              label="Pin Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., NYC Hub"
              required
            />

            <s-stack direction="inline" gap="base">
              <s-text-field
                label="Latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                placeholder="40.7128"
                required
              />

              <s-text-field
                label="Longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                placeholder="-74.0060"
                required
              />
            </s-stack>

            <s-select
              label="Delivery Mode"
              value={formData.deliveryMode}
              onChange={(e) => setFormData(prev => ({ ...prev, deliveryMode: e.target.value }))}
            >
              <option value="sameDay">Same Day Only</option>
              <option value="scheduled">Scheduled Only</option>
              <option value="both">Both</option>
            </s-select>

            <s-text-field
              label="Pin Color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            />

            <s-checkbox
              checked={formData.hasRadius}
              onChange={(e) => setFormData(prev => ({ ...prev, hasRadius: e.target.checked }))}
            >
              Enable Delivery Radius Zone
            </s-checkbox>

            {formData.hasRadius && (
              <s-stack direction="block" gap="base">
                <s-stack direction="inline" gap="base">
                  <s-text-field
                    label="Radius Distance"
                    type="number"
                    step="any"
                    value={formData.radiusDistance}
                    onChange={(e) => setFormData(prev => ({ ...prev, radiusDistance: e.target.value }))}
                    placeholder="5"
                  />

                  <s-select
                    label="Unit"
                    value={formData.radiusUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, radiusUnit: e.target.value }))}
                  >
                    <option value="km">Kilometers</option>
                    <option value="miles">Miles</option>
                  </s-select>
                </s-stack>

                <s-stack direction="inline" gap="base">
                  <s-text-field
                    label="Fill Color"
                    type="color"
                    value={formData.fillColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, fillColor: e.target.value }))}
                  />

                  <s-text-field
                    label="Border Color"
                    type="color"
                    value={formData.borderColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, borderColor: e.target.value }))}
                  />
                </s-stack>

                <s-text-field
                  label="Fill Opacity (0-1)"
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={formData.fillOpacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, fillOpacity: e.target.value }))}
                />
              </s-stack>
            )}

            <s-button onClick={handleSubmit} {...(isLoading ? { loading: true } : {})}>
              Add Pin
            </s-button>
          </s-stack>
        </s-section>
      )}

      <s-section heading="Existing Pins">
        {pins.length === 0 ? (
          <s-paragraph>No pins added yet. Click "Add Pin" to create your first delivery location.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {pins.map((pin) => (
              <s-box key={pin.id} padding="base" borderWidth="base" borderRadius="base">
                <s-stack direction="block" gap="tight">
                  <s-stack direction="inline" gap="base" alignment="space-between">
                    <s-heading level="3">{pin.title}</s-heading>
                    <s-button variant="destructive" onClick={() => handleDelete(pin.id)}>
                      Delete
                    </s-button>
                  </s-stack>
                  
                  <s-paragraph>
                    <strong>Location:</strong> {pin.latitude}, {pin.longitude}
                  </s-paragraph>
                  
                  <s-paragraph>
                    <strong>Mode:</strong> {pin.deliveryMode === 'both' ? 'Both Modes' : pin.deliveryMode === 'sameDay' ? 'Same Day Only' : 'Scheduled Only'}
                  </s-paragraph>
                  
                  <s-paragraph>
                    <strong>Pin Color:</strong> <span style={{ color: pin.color }}>●</span> {pin.color}
                  </s-paragraph>
                  
                  {pin.hasRadius && (
                    <s-paragraph>
                      <strong>Radius:</strong> {pin.radiusDistance} {pin.radiusUnit}
                    </s-paragraph>
                  )}
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        )}
      </s-section>

      <s-section slot="aside" heading="How to Use Pins">
        <s-unordered-list>
          <s-list-item>
            Add pins to mark key delivery locations
          </s-list-item>
          <s-list-item>
            Enable radius zones to show coverage areas
          </s-list-item>
          <s-list-item>
            Choose delivery mode to control visibility
          </s-list-item>
          <s-list-item>
            Use different colors for different locations
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

