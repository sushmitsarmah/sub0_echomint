import 'dotenv/config';
import { marketDataIndexer } from './indexers/marketDataIndexer.js';

/**
 * EchoMint Arkiv Indexer
 *
 * Fetches cryptocurrency market data from CoinGecko and stores it
 * on Arkiv Network as time-scoped entities for querying by the frontend.
 *
 * Data Flow:
 * 1. Fetch market data (price, volume, 24h change) from CoinGecko API
 * 2. Create entities with attributes (symbol, type, timestamp)
 * 3. Store to Arkiv Network with automatic expiration
 * 4. Frontend queries Arkiv directly for real-time data
 */
class EchoMintIndexer {
  /**
   * Initialize and start the indexer
   */
  async start(): Promise<void> {
    console.log('═══════════════════════════════════════════════════');
    console.log('🎨 EchoMint Arkiv Indexer');
    console.log('═══════════════════════════════════════════════════');
    console.log('Decentralized market data storage for dynamic NFTs');
    console.log('═══════════════════════════════════════════════════\n');

    try {
      // Start market data indexer (fetches + stores to Arkiv)
      await marketDataIndexer.start();

      console.log('\n✅ Indexer is now running');
      console.log('📊 Market data is being stored to Arkiv Network');
      console.log('🔄 Updates are running on schedule');
      console.log('\nPress Ctrl+C to stop\n');

    } catch (error) {
      console.error('❌ Failed to start indexer:', error);
      throw error;
    }
  }

  /**
   * Stop the indexer gracefully
   */
  async stop(): Promise<void> {
    console.log('\n🛑 Stopping indexer...');
    marketDataIndexer.stop();
    console.log('✅ Indexer stopped\n');
  }

  /**
   * Setup graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught errors
    process.on('uncaughtException', async (error) => {
      console.error('❌ Uncaught Exception:', error);
      await this.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      await this.stop();
      process.exit(1);
    });
  }
}

/**
 * Main entry point
 */
async function main() {
  const indexer = new EchoMintIndexer();
  (indexer as any).setupGracefulShutdown();

  try {
    await indexer.start();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await indexer.stop();
    process.exit(1);
  }
}

// Run the indexer
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

export { EchoMintIndexer };
