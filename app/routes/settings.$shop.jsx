// File: app/routes/settings.$shop.jsx
// App Proxy route for fetching map settings from storefront
// Shopify App Proxy strips the /apps/delivery-map prefix and sends requests here
import db from "../db.server";

export const loader = async ({ params, request }) => {
  const { shop } = params;
  
  console.log('[App Proxy] Settings request for shop:', shop);
  console.log('[App Proxy] Request URL:', request.url);
  
  if (!shop) {
    return Response.json({ error: "Shop parameter is required" }, { 
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const settings = await db.mapSettings.findUnique({
      where: { shop },
    });

    console.log('[App Proxy] Found settings:', settings ? 'yes' : 'no');

    // Convert "default" to "interactive" since we removed the static option
    const processedSettings = settings ? {
      ...settings,
      sameDayMode: settings.sameDayMode === "default" ? "interactive" : settings.sameDayMode,
      scheduledMode: settings.scheduledMode === "default" ? "interactive" : settings.scheduledMode,
    } : null;

    const responseSettings = processedSettings || {
      sameDayMode: "interactive",
      sameDayImageUrl: null,
      sameDayGeoJson: null,
      sameDayZoomLevel: 11,
      sameDayCenter: '{"lat":40.7128,"lng":-74.0060}',
      sameDayTileProvider: null,
      sameDayTileApiKey: null,
      scheduledMode: "interactive",
      scheduledImageUrl: null,
      scheduledGeoJson: null,
      scheduledZoomLevel: 4,
      scheduledCenter: '{"lat":39.8283,"lng":-98.5795}',
      scheduledTileProvider: null,
      scheduledTileApiKey: null,
      toggleTextSameDay: "Same Day Delivery",
      toggleTextScheduled: "Scheduled Delivery",
      buttonColor: "#000000",
      buttonActiveColor: "#1a73e8",
      buttonInactiveColor: "#f1f3f4",
      buttonAlignment: "center",
      buttonShape: "rounded",
      defaultMode: "sameDay",
      showDescription: true,
      descriptionSameDay: "We deliver same-day within the NYC metropolitan area.",
      descriptionScheduled: "Scheduled delivery available nationwide.",
    };

    return Response.json({ settings: responseSettings }, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("[App Proxy] Error fetching map settings:", error);
    return Response.json({ error: "Failed to fetch settings" }, { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

