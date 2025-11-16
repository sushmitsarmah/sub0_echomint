import { createPublicClient, http } from '@arkiv-network/sdk';
import { mendoza } from '@arkiv-network/sdk/chains';
import { eq } from '@arkiv-network/sdk/query';
import { fromBytes } from '@arkiv-network/sdk/utils';

/**
 * Market data snapshot from Arkiv Network
 */
export interface MarketDataSnapshot {
  symbol: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  timestamp: number;
}

/**
 * Arkiv public client for querying market data
 */
const arkivPublicClient = createPublicClient({
  chain: mendoza,
  transport: http(),
});

/**
 * The wallet address of the indexer that's storing market data
 * This should match the wallet address from your arkiv-indexer
 */
const INDEXER_WALLET_ADDRESS = '0xc8a202b97b5D00Ed0AA57B8341E7B58D1b9E2880';

/**
 * Fetch the latest market data for a specific token from Arkiv Network
 * @param symbol - Token symbol (e.g., 'SOL', 'DOT', 'BTC')
 * @returns Latest market data snapshot or null if not found
 */
export async function fetchLatestMarketData(
  symbol: string
): Promise<MarketDataSnapshot | null> {
  try {
    console.log(`🔍 Querying Arkiv for ${symbol} market data...`);

    // Build query using Arkiv SDK's query builder API
    const query = arkivPublicClient.buildQuery();

    const result = await query
      .where(eq('token', symbol))
      .where(eq('type', 'market_snapshot'))
      .ownedBy(INDEXER_WALLET_ADDRESS as `0x${string}`)
      .withPayload(true)
      .fetch();

    if (!result.entities || result.entities.length === 0) {
      console.warn(`⚠️  No market data found for ${symbol} on Arkiv`);
      return null;
    }

    // Get the most recent entity (sort by timestamp)
    const entities = result.entities
      .map((entity) => {
        const payload = entity.payload as Uint8Array;
        const data = JSON.parse(fromBytes(payload, 'string')) as MarketDataSnapshot;
        return data
      })
      .sort((a, b) => {
        const aTime = a.timestamp;
        const bTime = b.timestamp;
        return bTime - aTime;
      });

    const marketData = entities[0];

    console.log(`✅ Retrieved ${symbol} price from Arkiv: $${marketData.price.toFixed(2)}`);

    return marketData;
  } catch (error) {
    console.error(`❌ Error fetching market data for ${symbol} from Arkiv:`, error);
    return null;
  }
}

/**
 * Fetch market data for multiple tokens in parallel
 * @param symbols - Array of token symbols
 * @returns Object mapping symbols to their market data
 */
export async function fetchMultipleMarketData(
  symbols: string[]
): Promise<Record<string, MarketDataSnapshot | null>> {
  const results = await Promise.all(
    symbols.map(async (symbol) => ({
      symbol,
      data: await fetchLatestMarketData(symbol),
    }))
  );

  return results.reduce(
    (acc, { symbol, data }) => {
      acc[symbol] = data;
      return acc;
    },
    {} as Record<string, MarketDataSnapshot | null>
  );
}
