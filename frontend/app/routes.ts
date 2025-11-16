import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("gallery", "routes/gallery.tsx"),
  route("about", "routes/about.tsx"),

  // API Routes
  route("api/generate-image", "routes/api/generate-image.ts"),
  route("api/health", "routes/api/health.ts"),
  route("api/market-data", "routes/api/market-data.ts"),
] satisfies RouteConfig;
