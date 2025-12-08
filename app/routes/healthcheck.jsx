// File: app/routes/healthcheck.jsx
// Health check endpoint for monitoring and load balancers

export async function loader() {
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "wdm-delivery-map-app",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    }
  );
}

