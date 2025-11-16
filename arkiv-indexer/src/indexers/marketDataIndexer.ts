import axios from 'axios';
import { createWalletClient, http } from '@arkiv-network/sdk';
import { mendoza } from '@arkiv-network/sdk/chains';
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts';
import { ExpirationTime, jsonToPayload } from '@arkiv-network/sdk/utils';

/**
 * Market data snapshot stored in Arkiv
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

export type TxType = {
  txHash: string;
  createdEntities: string[];
  updatedEntities: any[];
  deletedEntities: any[];
  extendedEntities: any[];
  ownershipChanges: any[];
}

/**
 * Market Data Indexer with Arkiv Network Storage
 * Fetches crypto prices from CoinGecko and stores snapshots on Arkiv
 */
export class MarketDataIndexer {
  private walletClient: any;
  private account: any;
  private updateTimer?: NodeJS.Timeout;
  private readonly symbols: string[];
  private readonly expirationSeconds: number;

  constructor() {
    // Load configuration from environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY not found in environment variables');
    }

    this.symbols = (process.env.TRACKED_SYMBOLS || 'SOL,DOT,BTC').split(',');
    this.expirationSeconds = parseInt(process.env.DATA_EXPIRATION_SECONDS || '10800'); // 3 hours default

    // Create account from private key
    this.account = privateKeyToAccount(privateKey as `0x${string}`);

    // Create Arkiv wallet client
    this.walletClient = createWalletClient({
      chain: mendoza,
      transport: http(),
      account: this.account,
    });

    console.log(`📍 Arkiv Wallet Address: ${this.account.address}`);
    console.log(`📊 Tracking symbols: ${this.symbols.join(', ')}`);
    console.log(`⏰ Data expires after: ${this.expirationSeconds}s (${this.expirationSeconds / 3600}h)`);
  }

  /**
   * Start the indexer - fetch and store market data periodically
   */
  async start(): Promise<void> {
    console.log('\n🚀 Starting Market Data Indexer with Arkiv Network...');

    // Initial fetch and store
    await this.fetchAndStoreMarketData();

    // Set up periodic updates
    const intervalMinutes = parseInt(process.env.UPDATE_INTERVAL_MINUTES || '1');
    this.updateTimer = setInterval(async () => {
      await this.fetchAndStoreMarketData();
    }, intervalMinutes * 60 * 1000);

    console.log(`⏰ Updates scheduled every ${intervalMinutes} minute(s)\n`);
  }

  /**
   * Stop the indexer
   */
  stop(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      console.log('🛑 Market Data Indexer stopped');
    }
  }

  /**
   * Fetch market data from CoinGecko and store to Arkiv Network
   */
  private async fetchAndStoreMarketData(): Promise<void> {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📊 Fetching Market Data - ${new Date().toISOString()}`);
    console.log(`${'═'.repeat(60)}`);

    try {
      // Fetch market data for all symbols
      const snapshots = await Promise.all(
        this.symbols.map(symbol => this.fetchMarketDataForSymbol(symbol))
      );

      // Filter out null values (failed fetches)
      const validSnapshots = snapshots.filter(s => s !== null) as MarketDataSnapshot[];

      if (validSnapshots.length === 0) {
        console.error('❌ No valid market data fetched');
        return;
      }

      // Store all snapshots to Arkiv in a single transaction
      await this.storeToArkiv(validSnapshots);

    } catch (error) {
      console.error('❌ Error in fetch and store cycle:', error);
    }
  }

  /**
   * Fetch market data for a specific symbol from CoinGecko
   */
  private async fetchMarketDataForSymbol(symbol: string): Promise<MarketDataSnapshot | null> {
    try {
      // Map symbols to CoinGecko IDs
      const coinIds: Record<string, string> = {
        'SOL': 'solana',
        'DOT': 'polkadot',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'KSM': 'kusama',
      };

      const coinId = coinIds[symbol];
      if (!coinId) {
        console.error(`❌ Unknown symbol: ${symbol}`);
        return null;
      }

      // Fetch from CoinGecko API
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}`,
        {
          params: {
            localization: false,
            tickers: false,
            community_data: false,
            developer_data: false,
          },
          timeout: 10000,
        }
      );

      const data = response.data;
      const snapshot: MarketDataSnapshot = {
        symbol,
        price: data.market_data.current_price.usd,
        volume24h: data.market_data.total_volume.usd,
        priceChange24h: data.market_data.price_change_24h || 0,
        priceChangePercent24h: data.market_data.price_change_percentage_24h || 0,
        high24h: data.market_data.high_24h.usd,
        low24h: data.market_data.low_24h.usd,
        marketCap: data.market_data.market_cap.usd,
        timestamp: Date.now(),
      };

      console.log(`✅ ${symbol}: $${snapshot.price.toFixed(2)} (${snapshot.priceChangePercent24h > 0 ? '+' : ''}${snapshot.priceChangePercent24h.toFixed(2)}%)`);

      return snapshot;
    } catch (error) {
      console.error(`❌ Error fetching ${symbol} data:`, error);
      return null;
    }
  }

  /**
   * Store market data snapshots to Arkiv Network
   */
  private async storeToArkiv(snapshots: MarketDataSnapshot[]): Promise<void> {
    console.log(`\n💾 Storing ${snapshots.length} snapshots to Arkiv Network...`);

    try {
      // Create entities for each snapshot using Arkiv SDK helpers
      const entities = snapshots.map(snapshot => ({
        payload: jsonToPayload(snapshot),
        contentType: 'application/json' as const,
        expiresIn: ExpirationTime.fromSeconds(this.expirationSeconds),
        attributes: [
          { key: 'token', value: snapshot.symbol },
          { key: 'type', value: 'market_snapshot' },
          { key: 'timestamp', value: snapshot.timestamp.toString() },
        ],
      }));

      // Sign and send transaction to Arkiv
      const tx: TxType = await this.walletClient.mutateEntities({
        creates: entities,
        updates: [],
      });

      // Transaction is already prepared and sent by walletClient.mutateEntities
      console.log(`✅ Successfully sent ${entities.length} entities to Arkiv Network`);
      console.log(`   Transaction hash: ${tx.txHash}`);
      console.log(`   Expires in: ${this.expirationSeconds}s (${this.expirationSeconds / 3600}h)`);

    } catch (error) {
      console.error('❌ Error storing to Arkiv:', error);
      throw error;
    }
  }

  /**
   * Get the wallet address being used
   */
  getWalletAddress(): string {
    return this.account.address;
  }
}

/**
 * Create and export a singleton instance
 */
export const marketDataIndexer = new MarketDataIndexer();
