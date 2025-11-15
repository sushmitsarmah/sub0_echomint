import 'dotenv/config';
import { marketDataIndexer } from './indexers/marketDataIndexer';
import { sentimentAnalyzer } from './analyzers/sentimentAnalyzer';
import { moodCalculator, MoodState } from './analyzers/moodCalculator';
import { createHyperbridgeClient } from './utils/hyperbridgeClient';

/**
 * NFT Token Registry
 * Maps token IDs to their tracked symbols
 */
interface TokenRegistry {
  [tokenId: number]: string; // tokenId -> symbol (e.g., 1 -> "SOL")
}

/**
 * EchoMint Arkiv Indexer
 * Main orchestrator for market data analysis and mood updates
 */
class EchoMintIndexer {
  private hyperbridgeClient = createHyperbridgeClient();
  private tokenRegistry: TokenRegistry = {};
  private previousMoods: Map<number, MoodState> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize the indexer
   */
  async initialize(): Promise<void> {
    console.log('🚀 EchoMint Arkiv Indexer Starting...\n');

    // Load token registry from environment or database
    this.loadTokenRegistry();

    // Connect to Hyperbridge
    try {
      await this.hyperbridgeClient.connect();
    } catch (error) {
      console.error('⚠️  Hyperbridge connection failed, running in offline mode');
    }

    // Start market data indexer
    await marketDataIndexer.start();

    console.log('\n✅ Indexer initialized successfully\n');
  }

  /**
   * Load token registry (which NFTs to track)
   */
  private loadTokenRegistry(): void {
    // In production, load from database or smart contract
    // For now, use example data
    this.tokenRegistry = {
      1: 'SOL',
      2: 'DOT',
      3: 'BTC',
      // Add more token IDs as NFTs are minted
    };

    console.log(`📋 Loaded ${Object.keys(this.tokenRegistry).length} NFTs to track`);
  }

  /**
   * Start the main indexing loop
   */
  async start(): Promise<void> {
    await this.initialize();

    console.log('🔄 Starting analysis loop...\n');

    // Run analysis immediately
    await this.runAnalysis();

    // Set up periodic analysis (every 5 minutes)
    const intervalMinutes = parseInt(process.env.UPDATE_INTERVAL_MINUTES || '5');
    this.updateInterval = setInterval(async () => {
      await this.runAnalysis();
    }, intervalMinutes * 60 * 1000);

    console.log(`⏰ Analysis will run every ${intervalMinutes} minutes\n`);
  }

  /**
   * Run market analysis and update moods
   */
  private async runAnalysis(): Promise<void> {
    console.log('═══════════════════════════════════════════════════');
    console.log(`🔍 Running Analysis - ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════════════\n');

    try {
      // Get all unique symbols we're tracking
      const symbols = [...new Set(Object.values(this.tokenRegistry))];

      // 1. Fetch market data for all symbols
      console.log('📊 Fetching market data...');
      const marketDataPromises = symbols.map(symbol =>
        marketDataIndexer.getCurrentData(symbol)
      );
      const marketDataResults = await Promise.all(marketDataPromises);
      const marketDataList = marketDataResults.filter(d => d !== null) as any[];

      // 2. Analyze sentiment for all symbols
      console.log('💭 Analyzing sentiment...\n');
      const sentimentPromises = marketDataList.map(marketData =>
        sentimentAnalyzer.analyzeSentiment(marketData.symbol, marketData)
      );
      const sentimentDataList = await Promise.all(sentimentPromises);

      // 3. Calculate volatility
      console.log('\n⚡ Calculating volatility...');
      const volatilityMap = new Map<string, number>();
      for (const symbol of symbols) {
        const volatility = marketDataIndexer.calculateVolatility(symbol, 60);
        volatilityMap.set(symbol, volatility);
        console.log(`   ${symbol}: ${volatility.toFixed(2)}%`);
      }

      // 4. Calculate moods for all tracked NFTs
      console.log('\n🎭 Calculating moods...\n');
      const moodUpdates = new Map();

      for (const [tokenId, symbol] of Object.entries(this.tokenRegistry)) {
        const marketData = marketDataList.find(m => m.symbol === symbol);
        const sentimentData = sentimentDataList.find(s => s.symbol === symbol);
        const volatility = volatilityMap.get(symbol) || 0;

        if (marketData && sentimentData) {
          const moodAnalysis = moodCalculator.calculateMood(
            marketData,
            sentimentData,
            volatility
          );

          // Check if mood changed
          const tokenIdNum = parseInt(tokenId);
          const previousMood = this.previousMoods.get(tokenIdNum);

          if (
            !previousMood ||
            moodCalculator.shouldUpdateMood(previousMood, moodAnalysis.mood, moodAnalysis.confidence)
          ) {
            moodUpdates.set(tokenIdNum, moodAnalysis);
            this.previousMoods.set(tokenIdNum, moodAnalysis.mood);

            const emoji = moodCalculator.getMoodEmoji(moodAnalysis.mood);
            console.log(`   Token #${tokenId} (${symbol}): ${previousMood || 'New'} → ${moodAnalysis.mood} ${emoji}`);
          }
        }
      }

      // 5. Send mood updates via Hyperbridge
      if (moodUpdates.size > 0) {
        console.log(`\n🌉 Sending ${moodUpdates.size} mood updates via Hyperbridge...`);

        if (this.hyperbridgeClient.isReady()) {
          const results = await this.hyperbridgeClient.batchSendMoodUpdates(moodUpdates);

          const successCount = Array.from(results.values()).filter(v => v).length;
          console.log(`   ✅ ${successCount}/${results.size} updates sent successfully`);
        } else {
          console.log('   ⚠️  Hyperbridge offline, mood updates queued');
        }
      } else {
        console.log('\n😌 No mood changes detected');
      }

      // 6. Display summary
      console.log('\n📈 Market Summary:');
      for (const marketData of marketDataList) {
        const sentiment = sentimentDataList.find(s => s.symbol === marketData.symbol);
        const vol = volatilityMap.get(marketData.symbol) || 0;

        console.log(`   ${marketData.symbol}:`);
        console.log(`      Price: $${marketData.price.toFixed(2)} (${marketData.priceChangePercent24h > 0 ? '+' : ''}${marketData.priceChangePercent24h.toFixed(2)}%)`);
        console.log(`      Sentiment: ${sentiment ? sentimentAnalyzer.getSentimentLabel(sentiment.score) : 'N/A'}`);
        console.log(`      Volatility: ${vol.toFixed(2)}%`);
      }

      console.log('\n✅ Analysis complete\n');
    } catch (error) {
      console.error('❌ Analysis failed:', error);
    }
  }

  /**
   * Stop the indexer
   */
  async stop(): Promise<void> {
    console.log('\n🛑 Stopping indexer...');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    marketDataIndexer.stop();
    await this.hyperbridgeClient.disconnect();

    console.log('✅ Indexer stopped\n');
  }

  /**
   * Handle graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
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

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { EchoMintIndexer };
