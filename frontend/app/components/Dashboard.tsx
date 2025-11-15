import { useState } from "react";
import { Header } from "./Header";
import { NFTDisplay } from "./NFTDisplay";
import { MarketMetrics } from "./MarketMetrics";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

// Mock data - in production this would come from Arkiv via Hyperbridge
const MOCK_DATA = {
  SOL: {
    price: 142.35,
    priceChange24h: 5.2,
    volatility: 3.8,
    sentiment: "Positive",
    sentimentScore: 0.72,
    mood: "Bullish",
    imageUrl: undefined,
  },
  DOT: {
    price: 7.82,
    priceChange24h: -2.1,
    volatility: 4.2,
    sentiment: "Neutral",
    sentimentScore: 0.5,
    mood: "Neutral",
    imageUrl: undefined,
  },
  BTC: {
    price: 43250.0,
    priceChange24h: 1.8,
    volatility: 2.3,
    sentiment: "Positive",
    sentimentScore: 0.65,
    mood: "Bullish",
    imageUrl: undefined,
  },
};

type CoinType = keyof typeof MOCK_DATA;

export function Dashboard() {
  const [selectedCoin, setSelectedCoin] = useState<CoinType>("SOL");
  const data = MOCK_DATA[selectedCoin];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <Badge className="mb-2">Powered by Arkiv × Hyperbridge × Kusama</Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Living NFTs That Reflect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mt-2">
              Market Sentiment
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch as your NFT evolves in real-time based on market data, volatility,
            and social sentiment. Every mood shift is a unique piece of crypto art.
          </p>
        </section>

        {/* Coin Selector */}
        <section className="flex justify-center gap-4">
          {(Object.keys(MOCK_DATA) as CoinType[]).map((coin) => (
            <Button
              key={coin}
              variant={selectedCoin === coin ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedCoin(coin)}
              className="min-w-[100px]"
            >
              {coin}
            </Button>
          ))}
        </section>

        {/* Market Metrics */}
        <section>
          <MarketMetrics
            price={data.price}
            priceChange24h={data.priceChange24h}
            volatility={data.volatility}
            sentiment={data.sentiment}
            sentimentScore={data.sentimentScore}
            mood={data.mood}
          />
        </section>

        {/* NFT Display and Info */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main NFT Display */}
          <div className="lg:col-span-2">
            <NFTDisplay
              coin={selectedCoin}
              mood={data.mood}
              imageUrl={data.imageUrl}
              tokenId="001"
            />
          </div>

          {/* Side Info Panel */}
          <div className="space-y-6">
            {/* Mood States Card */}
            <Card>
              <CardHeader>
                <CardTitle>Mood States</CardTitle>
                <CardDescription>
                  NFT transforms based on market conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <MoodStateItem mood="Bullish" description="Bright, vibrant visuals" />
                <MoodStateItem mood="Bearish" description="Dark, muted tones" />
                <MoodStateItem mood="Neutral" description="Calm, balanced colors" />
                <MoodStateItem mood="Volatile" description="Glitchy, dynamic effects" />
                <MoodStateItem mood="Positive" description="Warm color variations" />
                <MoodStateItem mood="Negative" description="Corrupted aesthetics" />
              </CardContent>
            </Card>

            {/* System Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Cross-chain infrastructure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatusItem label="Arkiv Analytics" status="online" />
                <StatusItem label="Hyperbridge Relay" status="online" />
                <StatusItem label="Kusama Network" status="online" />
                <StatusItem label="Last Update" status="2 min ago" />
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <CardTitle>Mint Your NFT</CardTitle>
                <CardDescription>
                  Create your own market mood NFT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Mint Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-8">
          <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HowItWorksCard
              step="1"
              title="Data Collection"
              description="Arkiv fetches real-time price, volatility, and sentiment data from multiple sources"
            />
            <HowItWorksCard
              step="2"
              title="Cross-Chain Relay"
              description="Hyperbridge securely transmits computed mood states across blockchain networks"
            />
            <HowItWorksCard
              step="3"
              title="NFT Evolution"
              description="Your Kusama NFT automatically updates its visual representation based on the mood"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 EchoMint. A Polkadot Sub0 BA Project.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MoodStateItem({ mood, description }: { mood: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
      <div className="flex-1">
        <div className="font-medium text-sm">{mood}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: string }) {
  const isOnline = status === 'online';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {isOnline && (
          <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.20_130)] animate-pulse" />
        )}
        <span className="text-sm font-medium">{status}</span>
      </div>
    </div>
  );
}

function HowItWorksCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
          {step}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
