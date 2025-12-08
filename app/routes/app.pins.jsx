// File: app/routes/app.pins.jsx
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Get all pins for a shop
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    const pins = await db.deliveryPin.findMany({
      where: { shop: session.shop },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ pins });
  } catch (error) {
    console.error("Error fetching pins:", error);
    return Response.json({ error: "Failed to fetch pins" }, { status: 500 });
  }
};

// Create, update, or delete pins
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "create") {
      const data = JSON.parse(formData.get("data"));
      
      const pin = await db.deliveryPin.create({
        data: {
          shop: session.shop,
          deliveryMode: data.deliveryMode,
          title: data.title,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          color: data.color || "#FF0000",
          hasRadius: data.hasRadius || false,
          radiusDistance: data.radiusDistance ? parseFloat(data.radiusDistance) : null,
          radiusUnit: data.radiusUnit || "km",
          fillColor: data.fillColor || "#5dade2",
          borderColor: data.borderColor || "#5dade2",
          borderThickness: data.borderThickness || 1,
          fillOpacity: data.fillOpacity || 0.25,
        },
      });

      return Response.json({ pin, success: true });
    }

    if (action === "update") {
      const id = formData.get("id");
      const data = JSON.parse(formData.get("data"));
      
      const pin = await db.deliveryPin.update({
        where: { id, shop: session.shop },
        data: {
          deliveryMode: data.deliveryMode,
          title: data.title,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          color: data.color,
          hasRadius: data.hasRadius,
          radiusDistance: data.radiusDistance ? parseFloat(data.radiusDistance) : null,
          radiusUnit: data.radiusUnit,
          fillColor: data.fillColor,
          borderColor: data.borderColor,
          borderThickness: data.borderThickness,
          fillOpacity: data.fillOpacity,
        },
      });

      return Response.json({ pin, success: true });
    }

    if (action === "delete") {
      const id = formData.get("id");
      
      await db.deliveryPin.delete({
        where: { id, shop: session.shop },
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing pins:", error);
    return Response.json({ error: "Failed to manage pins" }, { status: 500 });
  }
};

