// File: app/routes/api.pins.$shop.jsx
import db from "../db.server";

export const loader = async ({ params }) => {
  const { shop } = params;
  
  if (!shop) {
    return Response.json({ error: "Shop parameter is required" }, { status: 400 });
  }

  try {
    const pins = await db.deliveryPin.findMany({
      where: { shop },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ pins }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Error fetching pins:", error);
    return Response.json({ pins: [] }, { status: 200 });
  }
};
