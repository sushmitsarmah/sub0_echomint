import axios from 'axios';

/**
 * Market data for a specific asset
 */
export interface MarketData {
  symbol: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

/**
 * Price point for volatility calculation
 */
interface PricePoint {
  price: number;
  timestamp: number;
}

/**
 * Market Data Indexer
 * Tracks real-time price, volume, and volatility for SOL, DOT, BTC
 */
export class MarketDataIndexer {
  private priceHistory: Map<string, PricePoint[]> = new Map();
  private readonly HISTORY_LIMIT = 100; // Keep last 100 data points
  private readonly UPDATE_INTERVAL = 60000; // 1 minute
  private updateTimer?: NodeJS.Timeout;

  constructor(private readonly symbols: string[] = ['SOL', 'DOT', 'BTC']) {
    // Initialize price history for each symbol
    symbols.forEach(symbol => {
      this.priceHistory.set(symbol, []);
    });
  }

  /**
   * Start indexing market data
   */
  async start(): Promise<void> {
    console.log('🚀 Starting Market Data Indexer...');
    console.log(`📊 Tracking: ${this.symbols.join(', ')}`);

    // Initial fetch
    await this.fetchAllMarketData();

    // Set up periodic updates
    this.updateTimer = setInterval(async () => {
      await this.fetchAllMarketData();
    }, this.UPDATE_INTERVAL);
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
   * Fetch market data for all symbols
   */
  private async fetchAllMarketData(): Promise<void> {
    const promises = this.symbols.map(symbol => this.fetchMarketData(symbol));
    await Promise.allSettled(promises);
  }

  /**
   * Fetch market data for a specific symbol from CoinGecko API
   */
  private async fetchMarketData(symbol: string): Promise<MarketData | null> {
    try {
      // Map symbols to CoinGecko IDs
      const coinIds: Record<string, string> = {
        'SOL': 'solana',
        'DOT': 'polkadot',
        'BTC': 'bitcoin',
      };

      const coinId = coinIds[symbol];
      if (!coinId) {
        console.error(`❌ Unknown symbol: ${symbol}`);
        return null;
      }

      // Fetch from CoinGecko
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
      const marketData: MarketData = {
        symbol,
        price: data.market_data.current_price.usd,
        volume24h: data.market_data.total_volume.usd,
        priceChange24h: data.market_data.price_change_24h,
        priceChangePercent24h: data.market_data.price_change_percentage_24h,
        high24h: data.market_data.high_24h.usd,
        low24h: data.market_data.low_24h.usd,
        timestamp: Date.now(),
      };

      // Store in price history
      this.addPricePoint(symbol, marketData.price, marketData.timestamp);

      console.log(`✅ ${symbol}: $${marketData.price.toFixed(2)} (${marketData.priceChangePercent24h.toFixed(2)}%)`);

      return marketData;
    } catch (error) {
      console.error(`❌ Error fetching ${symbol} data:`, error);
      return null;
    }
  }

  /**
   * Add a price point to history
   */
  private addPricePoint(symbol: string, price: number, timestamp: number): void {
    const history = this.priceHistory.get(symbol) || [];

    history.push({ price, timestamp });

    // Keep only recent history
    if (history.length > this.HISTORY_LIMIT) {
      history.shift();
    }

    this.priceHistory.set(symbol, history);
  }

  /**
   * Calculate volatility for a symbol (standard deviation of returns)
   */
  calculateVolatility(symbol: string, periodMinutes: number = 60): number {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 2) {
      return 0;
    }

    const now = Date.now();
    const cutoff = now - (periodMinutes * 60 * 1000);

    // Filter to period
    const periodData = history.filter(point => point.timestamp >= cutoff);
    if (periodData.length < 2) {
      return 0;
    }

    // Calculate returns
    const returns: number[] = [];
    for (let i = 1; i < periodData.length; i++) {
      const returnValue = (periodData[i].price - periodData[i - 1].price) / periodData[i - 1].price;
      returns.push(returnValue);
    }

    // Calculate standard deviation
    const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualize volatility (assuming 365 days, 24 hours)
    const periodsPerYear = (365 * 24 * 60) / periodMinutes;
    const annualizedVolatility = stdDev * Math.sqrt(periodsPerYear);

    return annualizedVolatility * 100; // Return as percentage
  }

  /**
   * Get current market data for a symbol
   */
  async getCurrentData(symbol: string): Promise<MarketData | null> {
    return this.fetchMarketData(symbol);
  }

  /**
   * Get price history for a symbol
   */
  getPriceHistory(symbol: string): PricePoint[] {
    return this.priceHistory.get(symbol) || [];
  }

  /**
   * Calculate price momentum (rate of change)
   */
  calculateMomentum(symbol: string, periodMinutes: number = 60): number {
    const history = this.priceHistory.get(symbol);
    if (!history || history.length < 2) {
      return 0;
    }

    const now = Date.now();
    const cutoff = now - (periodMinutes * 60 * 1000);

    const periodData = history.filter(point => point.timestamp >= cutoff);
    if (periodData.length < 2) {
      return 0;
    }

    const firstPrice = periodData[0].price;
    const lastPrice = periodData[periodData.length - 1].price;

    return ((lastPrice - firstPrice) / firstPrice) * 100; // Return as percentage
  }

  /**
   * Get market summary for all symbols
   */
  async getMarketSummary(): Promise<Record<string, MarketData | null>> {
    const summary: Record<string, MarketData | null> = {};

    for (const symbol of this.symbols) {
      summary[symbol] = await this.getCurrentData(symbol);
    }

    return summary;
  }
}

/**
 * Create and export a singleton instance
 */
export const marketDataIndexer = new MarketDataIndexer();
