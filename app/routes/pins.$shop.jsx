// File: app/routes/pins.$shop.jsx
// App Proxy route for fetching pins from storefront
// Shopify App Proxy strips the /apps/delivery-map prefix and sends requests here
import db from "../db.server";

export const loader = async ({ params, request }) => {
  const { shop } = params;
  
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
    return Response.json({ pins: [] }, { 
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

