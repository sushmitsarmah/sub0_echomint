import axios from 'axios';

/**
 * Sentiment data for an asset
 */
export interface SentimentData {
  symbol: string;
  score: number; // -1 (very negative) to 1 (very positive)
  confidence: number; // 0 to 1
  signals: {
    social: number;
    onChain: number;
    technical: number;
  };
  timestamp: number;
}

/**
 * On-chain metrics
 */
interface OnChainMetrics {
  activeAddresses: number;
  transactionCount: number;
  volume: number;
  newAddresses: number;
}

/**
 * Sentiment Analyzer
 * Analyzes market sentiment from multiple data sources
 */
export class SentimentAnalyzer {
  private sentimentHistory: Map<string, SentimentData[]> = new Map();
  private readonly HISTORY_LIMIT = 50;

  constructor(private readonly symbols: string[] = ['SOL', 'DOT', 'BTC']) {
    symbols.forEach(symbol => {
      this.sentimentHistory.set(symbol, []);
    });
  }

  /**
   * Analyze sentiment for a symbol
   */
  async analyzeSentiment(
    symbol: string,
    marketData: { price: number; priceChange24h: number; volume24h: number }
  ): Promise<SentimentData> {
    // Analyze different sentiment signals
    const socialSentiment = await this.analyzeSocialSentiment(symbol);
    const onChainSentiment = await this.analyzeOnChainMetrics(symbol);
    const technicalSentiment = this.analyzeTechnicalIndicators(marketData);

    // Combine signals with weights
    const weights = {
      social: 0.3,
      onChain: 0.4,
      technical: 0.3,
    };

    const combinedScore =
      socialSentiment * weights.social +
      onChainSentiment * weights.onChain +
      technicalSentiment * weights.technical;

    // Calculate confidence based on signal agreement
    const signals = [socialSentiment, onChainSentiment, technicalSentiment];
    const avgSignal = signals.reduce((sum, val) => sum + val, 0) / signals.length;
    const variance = signals.reduce((sum, val) => sum + Math.pow(val - avgSignal, 2), 0) / signals.length;
    const confidence = 1 - Math.sqrt(variance); // Lower variance = higher confidence

    const sentimentData: SentimentData = {
      symbol,
      score: combinedScore,
      confidence: Math.max(0, Math.min(1, confidence)),
      signals: {
        social: socialSentiment,
        onChain: onChainSentiment,
        technical: technicalSentiment,
      },
      timestamp: Date.now(),
    };

    // Store in history
    this.addToHistory(symbol, sentimentData);

    console.log(`📊 ${symbol} Sentiment: ${this.getSentimentLabel(combinedScore)} (${combinedScore.toFixed(2)})`);

    return sentimentData;
  }

  /**
   * Analyze social sentiment (simplified - in production, integrate with Twitter API, Reddit, etc.)
   */
  private async analyzeSocialSentiment(symbol: string): Promise<number> {
    try {
      // In production, you would:
      // 1. Fetch Twitter mentions, sentiment
      // 2. Analyze Reddit posts/comments
      // 3. Check Discord/Telegram activity
      // 4. Use NLP for sentiment scoring

      // For now, use CoinGecko sentiment data as proxy
      const coinIds: Record<string, string> = {
        'SOL': 'solana',
        'DOT': 'polkadot',
        'BTC': 'bitcoin',
      };

      const coinId = coinIds[symbol];
      if (!coinId) return 0;

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}`,
        { timeout: 10000 }
      );

      const data = response.data;

      // Use community sentiment indicators
      const upVotes = data.sentiment_votes_up_percentage || 50;
      const downVotes = data.sentiment_votes_down_percentage || 50;

      // Convert to -1 to 1 scale
      const sentiment = (upVotes - downVotes) / 100;

      return sentiment;
    } catch (error) {
      console.error(`❌ Error analyzing social sentiment for ${symbol}:`, error);
      return 0; // Neutral on error
    }
  }

  /**
   * Analyze on-chain metrics (simplified)
   */
  private async analyzeOnChainMetrics(symbol: string): Promise<number> {
    try {
      // In production, integrate with:
      // 1. Subscan API for DOT
      // 2. Solscan API for SOL
      // 3. Blockchain.com API for BTC
      // 4. Analyze: active addresses, transaction volume, holder distribution

      // For now, use proxy metrics from CoinGecko
      const coinIds: Record<string, string> = {
        'SOL': 'solana',
        'DOT': 'polkadot',
        'BTC': 'bitcoin',
      };

      const coinId = coinIds[symbol];
      if (!coinId) return 0;

      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}`,
        { timeout: 10000 }
      );

      const data = response.data;
      const marketData = data.market_data;

      // Analyze various on-chain proxies
      const volumeChange = marketData.total_volume_change_percentage_24h || 0;
      const marketCapChange = marketData.market_cap_change_percentage_24h || 0;

      // Combine indicators
      let onChainScore = 0;

      // Volume increase = positive sentiment
      if (volumeChange > 20) onChainScore += 0.4;
      else if (volumeChange > 0) onChainScore += 0.2;
      else if (volumeChange < -20) onChainScore -= 0.4;
      else if (volumeChange < 0) onChainScore -= 0.2;

      // Market cap growth = positive sentiment
      if (marketCapChange > 5) onChainScore += 0.3;
      else if (marketCapChange > 0) onChainScore += 0.15;
      else if (marketCapChange < -5) onChainScore -= 0.3;
      else if (marketCapChange < 0) onChainScore -= 0.15;

      return Math.max(-1, Math.min(1, onChainScore));
    } catch (error) {
      console.error(`❌ Error analyzing on-chain metrics for ${symbol}:`, error);
      return 0;
    }
  }

  /**
   * Analyze technical indicators
   */
  private analyzeTechnicalIndicators(marketData: {
    price: number;
    priceChange24h: number;
    volume24h: number;
  }): number {
    // Analyze price action and volume
    const priceChangePercent = (marketData.priceChange24h / (marketData.price - marketData.priceChange24h)) * 100;

    let technicalScore = 0;

    // Strong price movements
    if (priceChangePercent > 10) technicalScore += 0.5;
    else if (priceChangePercent > 5) technicalScore += 0.3;
    else if (priceChangePercent > 0) technicalScore += 0.1;
    else if (priceChangePercent < -10) technicalScore -= 0.5;
    else if (priceChangePercent < -5) technicalScore -= 0.3;
    else if (priceChangePercent < 0) technicalScore -= 0.1;

    // Volume considerations (high volume confirms sentiment)
    // In production, compare against historical average
    if (marketData.volume24h > 0) {
      technicalScore *= 1.2; // Amplify with volume
    }

    return Math.max(-1, Math.min(1, technicalScore));
  }

  /**
   * Add sentiment data to history
   */
  private addToHistory(symbol: string, data: SentimentData): void {
    const history = this.sentimentHistory.get(symbol) || [];
    history.push(data);

    if (history.length > this.HISTORY_LIMIT) {
      history.shift();
    }

    this.sentimentHistory.set(symbol, history);
  }

  /**
   * Get sentiment history for a symbol
   */
  getSentimentHistory(symbol: string): SentimentData[] {
    return this.sentimentHistory.get(symbol) || [];
  }

  /**
   * Get average sentiment over a period
   */
  getAverageSentiment(symbol: string, periodMinutes: number = 60): number {
    const history = this.getSentimentHistory(symbol);
    if (history.length === 0) return 0;

    const now = Date.now();
    const cutoff = now - (periodMinutes * 60 * 1000);

    const recentData = history.filter(data => data.timestamp >= cutoff);
    if (recentData.length === 0) return 0;

    const sum = recentData.reduce((total, data) => total + data.score, 0);
    return sum / recentData.length;
  }

  /**
   * Get sentiment label from score
   */
  getSentimentLabel(score: number): string {
    if (score > 0.5) return 'Very Positive';
    if (score > 0.2) return 'Positive';
    if (score > -0.2) return 'Neutral';
    if (score > -0.5) return 'Negative';
    return 'Very Negative';
  }

  /**
   * Detect sentiment trend (improving/declining)
   */
  getSentimentTrend(symbol: string, periodMinutes: number = 60): 'improving' | 'declining' | 'stable' {
    const history = this.getSentimentHistory(symbol);
    if (history.length < 2) return 'stable';

    const now = Date.now();
    const cutoff = now - (periodMinutes * 60 * 1000);

    const recentData = history.filter(data => data.timestamp >= cutoff);
    if (recentData.length < 2) return 'stable';

    const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(Math.floor(recentData.length / 2));

    const firstAvg = firstHalf.reduce((sum, data) => sum + data.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, data) => sum + data.score, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;

    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }
}

/**
 * Export singleton instance
 */
export const sentimentAnalyzer = new SentimentAnalyzer();
