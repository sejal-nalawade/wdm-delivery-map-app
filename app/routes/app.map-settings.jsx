// File: app/routes/app.map-settings.jsx
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    let settings = await db.mapSettings.findUnique({
      where: { shop: session.shop },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await db.mapSettings.create({
        data: {
          shop: session.shop,
        },
      });
    }

    return Response.json({ settings });
  } catch (error) {
    console.error("Error fetching map settings:", error);
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    const data = await request.json();
    
    const settings = await db.mapSettings.upsert({
      where: { shop: session.shop },
      update: {
        sameDayMode: data.sameDayMode,
        sameDayImageUrl: data.sameDayImageUrl,
        sameDayGeoJson: data.sameDayGeoJson,
        sameDayZoomLevel: data.sameDayZoomLevel,
        scheduledMode: data.scheduledMode,
        scheduledImageUrl: data.scheduledImageUrl,
        scheduledGeoJson: data.scheduledGeoJson,
        scheduledZoomLevel: data.scheduledZoomLevel,
        toggleTextSameDay: data.toggleTextSameDay,
        toggleTextScheduled: data.toggleTextScheduled,
        buttonColor: data.buttonColor,
        buttonActiveColor: data.buttonActiveColor,
        buttonInactiveColor: data.buttonInactiveColor,
        buttonAlignment: data.buttonAlignment,
        buttonShape: data.buttonShape,
        defaultMode: data.defaultMode,
        showDescription: data.showDescription,
        descriptionSameDay: data.descriptionSameDay,
        descriptionScheduled: data.descriptionScheduled,
      },
      create: {
        shop: session.shop,
        sameDayMode: data.sameDayMode,
        sameDayImageUrl: data.sameDayImageUrl,
        sameDayGeoJson: data.sameDayGeoJson,
        sameDayZoomLevel: data.sameDayZoomLevel,
        scheduledMode: data.scheduledMode,
        scheduledImageUrl: data.scheduledImageUrl,
        scheduledGeoJson: data.scheduledGeoJson,
        scheduledZoomLevel: data.scheduledZoomLevel,
        toggleTextSameDay: data.toggleTextSameDay,
        toggleTextScheduled: data.toggleTextScheduled,
        buttonColor: data.buttonColor,
        buttonActiveColor: data.buttonActiveColor,
        buttonInactiveColor: data.buttonInactiveColor,
        buttonAlignment: data.buttonAlignment,
        buttonShape: data.buttonShape,
        defaultMode: data.defaultMode,
        showDescription: data.showDescription,
        descriptionSameDay: data.descriptionSameDay,
        descriptionScheduled: data.descriptionScheduled,
      },
    });

    return Response.json({ settings, success: true });
  } catch (error) {
    console.error("Error saving map settings:", error);
    return Response.json({ error: "Failed to save settings" }, { status: 500 });
  }
};

