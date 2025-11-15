import type { Route } from "./+types/market-data";

/**
 * 🔴 SERVER-ONLY API ROUTE
 * GET /api/market-data
 *
 * Returns current market sentiment and volatility data
 */
export async function loader({ request }: Route.LoaderArgs) {
  try {
    // TODO: Replace with actual market data fetching logic
    const mockData = {
      sentiment: 0.65, // Range: 0-1 (bearish to bullish)
      volatility: 0.42, // Range: 0-1 (calm to volatile)
      timestamp: new Date().toISOString(),
      source: "mock-data"
    };

    return Response.json(mockData, {
      headers: {
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
