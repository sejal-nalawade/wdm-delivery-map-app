// File: app/routes/pins.$shop.jsx
// App Proxy route for fetching pins from storefront
// Shopify App Proxy strips the /apps/delivery-map prefix and sends requests here
import db from "../db.server";

export const loader = async ({ params, request }) => {
  const { shop } = params;
  
  console.log('[App Proxy] Pins request for shop:', shop);
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
    const pins = await db.deliveryPin.findMany({
      where: { shop },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[App Proxy] Found pins:', pins.length);
    console.log('[App Proxy] Pin data:', JSON.stringify(pins, null, 2));

    return Response.json({ pins }, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("[App Proxy] Error fetching pins:", error);
    return Response.json({ pins: [] }, { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

