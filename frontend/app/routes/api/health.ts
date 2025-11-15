import type { Route } from "./+types/health";

/**
 * 🔴 SERVER-ONLY API ROUTE
 * GET /api/health
 *
 * Health check endpoint
 */
export async function loader({ request }: Route.LoaderArgs) {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
}
