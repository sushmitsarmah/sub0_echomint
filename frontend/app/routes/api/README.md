# API Routes (Server-Only)

This folder contains **server-only API routes**. These routes:

- ✅ Only run on the server
- ✅ Return JSON responses
- ✅ Handle data fetching, mutations, and business logic
- ❌ Do NOT export React components

## Naming Convention

- File: `app/routes/api/market-data.ts`
- URL: `/api/market-data`

## Route Types

### GET Requests (Data Fetching)
Export a `loader` function:

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const data = await fetchData();
  return Response.json(data);
}
```

### POST/PUT/DELETE Requests (Mutations)
Export an `action` function:

```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const result = await saveData(formData);
  return Response.json(result);
}
```

## Example Usage from Client

```typescript
// Fetch data
const response = await fetch('/api/market-data');
const data = await response.json();

// Submit data
const response = await fetch('/api/mint', {
  method: 'POST',
  body: JSON.stringify({ nftId: 123 }),
});
```

## Current API Routes

- `GET /api/health` - Health check endpoint
- `GET /api/market-data` - Market sentiment and volatility data
