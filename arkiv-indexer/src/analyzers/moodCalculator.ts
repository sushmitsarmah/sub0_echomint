import { MarketData } from '../indexers/marketDataIndexer';
import { SentimentData } from './sentimentAnalyzer';

/**
 * Mood states matching the NFT contract
 */
export enum MoodState {
  Bullish = 'Bullish',
  Bearish = 'Bearish',
  Neutral = 'Neutral',
  Volatile = 'Volatile',
  PositiveSentiment = 'PositiveSentiment',
  NegativeSentiment = 'NegativeSentiment',
}

/**
 * Mood analysis result
 */
export interface MoodAnalysis {
  symbol: string;
  mood: MoodState;
  confidence: number;
  factors: {
    priceChange: number;
    volatility: number;
    sentiment: number;
    volume: number;
  };
  timestamp: number;
}

/**
 * Mood Calculator
 * Determines NFT mood state based on market data and sentiment
 */
export class MoodCalculator {
  /**
   * Calculate mood state for an asset
   */
  calculateMood(
    marketData: MarketData,
    sentimentData: SentimentData,
    volatility: number
  ): MoodAnalysis {
    const priceChangePercent = marketData.priceChangePercent24h;
    const sentimentScore = sentimentData.score;

    // Determine mood based on multiple factors
    let mood: MoodState;
    let confidence: number;

    // Priority 1: Check for high volatility (overrides other moods)
    if (volatility > 50) {
      mood = MoodState.Volatile;
      confidence = Math.min(1, volatility / 100);
    }
    // Priority 2: Strong sentiment regardless of price
    else if (sentimentScore > 0.6 && sentimentData.confidence > 0.7) {
      mood = MoodState.PositiveSentiment;
      confidence = sentimentData.confidence;
    } else if (sentimentScore < -0.6 && sentimentData.confidence > 0.7) {
      mood = MoodState.NegativeSentiment;
      confidence = sentimentData.confidence;
    }
    // Priority 3: Price-driven moods
    else if (priceChangePercent > 5 && sentimentScore > 0) {
      mood = MoodState.Bullish;
      confidence = Math.min(1, priceChangePercent / 20);
    } else if (priceChangePercent < -5 && sentimentScore < 0) {
      mood = MoodState.Bearish;
      confidence = Math.min(1, Math.abs(priceChangePercent) / 20);
    }
    // Priority 4: Mixed signals - check sentiment to break tie
    else if (priceChangePercent > 5 && sentimentScore <= 0) {
      // Price up but sentiment negative
      mood = volatility > 30 ? MoodState.Volatile : MoodState.Neutral;
      confidence = 0.6;
    } else if (priceChangePercent < -5 && sentimentScore >= 0) {
      // Price down but sentiment positive
      mood = volatility > 30 ? MoodState.Volatile : MoodState.Neutral;
      confidence = 0.6;
    }
    // Default: Neutral
    else {
      mood = MoodState.Neutral;
      confidence = 0.7;
    }

    const analysis: MoodAnalysis = {
      symbol: marketData.symbol,
      mood,
      confidence,
      factors: {
        priceChange: priceChangePercent,
        volatility,
        sentiment: sentimentScore,
        volume: marketData.volume24h,
      },
      timestamp: Date.now(),
    };

    console.log(`🎭 ${marketData.symbol} Mood: ${mood} (confidence: ${(confidence * 100).toFixed(0)}%)`);

    return analysis;
  }

  /**
   * Check if mood has changed significantly
   */
  shouldUpdateMood(previousMood: MoodState, newMood: MoodState, newConfidence: number): boolean {
    // Always update if mood changed and confidence is high
    if (previousMood !== newMood && newConfidence > 0.6) {
      return true;
    }

    // Don't update if same mood or low confidence
    return false;
  }

  /**
   * Get mood description for UI
   */
  getMoodDescription(mood: MoodState): string {
    const descriptions: Record<MoodState, string> = {
      [MoodState.Bullish]: 'Strong upward price movement with positive sentiment. Bright green visuals with ascending patterns.',
      [MoodState.Bearish]: 'Downward trend with negative sentiment. Dark reds and oranges with descending motifs.',
      [MoodState.Neutral]: 'Stable market with balanced sentiment. Calm blues and grays with peaceful aesthetics.',
      [MoodState.Volatile]: 'High price swings and uncertainty. Electric yellows and oranges with chaotic patterns.',
      [MoodState.PositiveSentiment]: 'Strong community optimism. Warm greens and yellows with organic growth patterns.',
      [MoodState.NegativeSentiment]: 'Community fear and doubt. Deep reds and purples with fractured visuals.',
    };

    return descriptions[mood];
  }

  /**
   * Get mood color for UI
   */
  getMoodColor(mood: MoodState): string {
    const colors: Record<MoodState, string> = {
      [MoodState.Bullish]: '#22c55e', // Green
      [MoodState.Bearish]: '#ef4444', // Red
      [MoodState.Neutral]: '#3b82f6', // Blue
      [MoodState.Volatile]: '#eab308', // Yellow
      [MoodState.PositiveSentiment]: '#10b981', // Emerald
      [MoodState.NegativeSentiment]: '#f43f5e', // Rose
    };

    return colors[mood];
  }

  /**
   * Get mood emoji
   */
  getMoodEmoji(mood: MoodState): string {
    const emojis: Record<MoodState, string> = {
      [MoodState.Bullish]: '🚀',
      [MoodState.Bearish]: '📉',
      [MoodState.Neutral]: '😌',
      [MoodState.Volatile]: '⚡',
      [MoodState.PositiveSentiment]: '💚',
      [MoodState.NegativeSentiment]: '💔',
    };

    return emojis[mood];
  }

  /**
   * Generate AI image prompt based on mood
   */
  generateImagePrompt(mood: MoodState, symbol: string): string {
    const basePrompt = `Abstract digital art representing ${symbol} cryptocurrency`;

    const moodPrompts: Record<MoodState, string> = {
      [MoodState.Bullish]: `${basePrompt}, vibrant bright green colors, ascending arrows, upward momentum, rockets, growth patterns, optimistic energy, dynamic composition, high contrast`,
      [MoodState.Bearish]: `${basePrompt}, deep red and orange hues, descending patterns, falling motifs, dark atmosphere, downward trend, somber mood, heavy shadows`,
      [MoodState.Neutral]: `${basePrompt}, calm blue and gray tones, balanced composition, peaceful harmony, gentle waves, stable patterns, serene atmosphere, soft gradients`,
      [MoodState.Volatile]: `${basePrompt}, electric yellow and orange, chaotic lightning, erratic patterns, high energy, unstable forms, wild fluctuations, dramatic contrasts, explosive energy`,
      [MoodState.PositiveSentiment]: `${basePrompt}, warm yellow-green tones, organic growth patterns, blooming flowers, community symbols, connected nodes, hopeful atmosphere, radiant light`,
      [MoodState.NegativeSentiment]: `${basePrompt}, dark red and purple, fractured patterns, broken forms, corrupted glitch aesthetic, fearful imagery, scattered fragments, ominous mood`,
    };

    return moodPrompts[mood];
  }

  /**
   * Batch calculate moods for multiple assets
   */
  batchCalculateMoods(
    marketDataList: MarketData[],
    sentimentDataList: SentimentData[],
    volatilityMap: Map<string, number>
  ): MoodAnalysis[] {
    const analyses: MoodAnalysis[] = [];

    for (const marketData of marketDataList) {
      const sentimentData = sentimentDataList.find(s => s.symbol === marketData.symbol);
      const volatility = volatilityMap.get(marketData.symbol) || 0;

      if (sentimentData) {
        const analysis = this.calculateMood(marketData, sentimentData, volatility);
        analyses.push(analysis);
      }
    }

    return analyses;
  }

  /**
   * Get mood statistics
   */
  getMoodStatistics(analyses: MoodAnalysis[]): Record<MoodState, number> {
    const stats: Record<MoodState, number> = {
      [MoodState.Bullish]: 0,
      [MoodState.Bearish]: 0,
      [MoodState.Neutral]: 0,
      [MoodState.Volatile]: 0,
      [MoodState.PositiveSentiment]: 0,
      [MoodState.NegativeSentiment]: 0,
    };

    analyses.forEach(analysis => {
      stats[analysis.mood]++;
    });

    return stats;
  }
}

/**
 * Export singleton instance
 */
export const moodCalculator = new MoodCalculator();
