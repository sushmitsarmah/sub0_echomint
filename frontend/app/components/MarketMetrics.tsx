import { MarketDataCard } from "./MarketDataCard";
import { TrendingUp, Activity, Heart, Sparkles } from "lucide-react";

interface MarketMetricsProps {
  price: number;
  priceChange24h: number;
  volatility: number;
  sentiment: string;
  sentimentScore: number;
  mood: string;
}

export function MarketMetrics({
  price,
  priceChange24h,
  volatility,
  sentiment,
  sentimentScore,
  mood,
}: MarketMetricsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPriceTrend = (change: number): 'up' | 'down' | 'neutral' => {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  const getVolatilityBadge = (vol: number) => {
    if (vol > 5) return { label: 'High', variant: 'warning' as const };
    if (vol > 2) return { label: 'Medium', variant: 'secondary' as const };
    return { label: 'Low', variant: 'success' as const };
  };

  const getSentimentBadge = (score: number) => {
    if (score > 0.6) return { label: 'Positive', variant: 'success' as const };
    if (score < 0.4) return { label: 'Negative', variant: 'destructive' as const };
    return { label: 'Neutral', variant: 'secondary' as const };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MarketDataCard
        title="Price"
        value={formatPrice(price)}
        description={`${formatPercentage(priceChange24h)} (24h)`}
        trend={getPriceTrend(priceChange24h)}
        icon={<TrendingUp className="w-4 h-4" />}
      />

      <MarketDataCard
        title="Volatility"
        value={`${volatility.toFixed(2)}%`}
        description="Standard deviation (24h)"
        icon={<Activity className="w-4 h-4" />}
        badge={getVolatilityBadge(volatility)}
      />

      <MarketDataCard
        title="Sentiment"
        value={sentiment}
        description={`Score: ${(sentimentScore * 100).toFixed(0)}/100`}
        icon={<Heart className="w-4 h-4" />}
        badge={getSentimentBadge(sentimentScore)}
      />

      <MarketDataCard
        title="Current Mood"
        value={mood}
        description="NFT state updated in real-time"
        icon={<Sparkles className="w-4 h-4" />}
        badge={{ label: 'Live', variant: 'default' }}
      />
    </div>
  );
}
