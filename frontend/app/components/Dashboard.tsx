import { useState, useEffect } from "react";
import { useAccount } from "@luno-kit/react";
import { Header } from "./Header";
import { NFTDisplay } from "./NFTDisplay";
import { MarketMetrics } from "./MarketMetrics";
import { AnimatedBackground } from "./AnimatedBackground";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { fetchLatestMarketData, type MarketDataSnapshot } from "../lib/arkiv";
import { prepareNFTForMinting } from "../lib/pinata";
import { getContractService, MoodState } from "../lib/contract";
import { formatAddress, accountIdToH160 } from "../lib/wallet";

type CoinType = "SOL" | "DOT" | "BTC";

export function Dashboard() {
  const [selectedCoin, setSelectedCoin] = useState<CoinType>("SOL");
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(undefined);
  const [marketData, setMarketData] = useState<MarketDataSnapshot | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Use LunoKit hooks to access wallet state
  const { account } = useAccount();

  /**
   * Fetch market data from Arkiv when coin selection changes
   */
  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoadingData(true);
      try {
        const data = await fetchLatestMarketData(selectedCoin);
        if (data) {
          setMarketData(data);
        }
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadMarketData();
  }, [selectedCoin]);

  /**
   * Convert market data to mood state
   */
  const getMoodFromMarketData = (marketData: MarketDataSnapshot): MoodState => {
    const priceChange = marketData.priceChangePercent24h;

    if (priceChange > 5) return MoodState.Bullish;
    if (priceChange < -5) return MoodState.Bearish;
    if (Math.abs(priceChange) > 3) return MoodState.Volatile;
    if (priceChange > 0) return MoodState.PositiveSentiment;
    if (priceChange < 0) return MoodState.NegativeSentiment;
    return MoodState.Neutral;
  };

  /**
   * Get mood display string
   */
  const getMoodDisplay = (data: MarketDataSnapshot | null): string => {
    if (!data) return "Loading...";
    const mood = getMoodFromMarketData(data);

    switch (mood) {
      case MoodState.Bullish: return "Bullish";
      case MoodState.Bearish: return "Bearish";
      case MoodState.Volatile: return "Volatile";
      case MoodState.PositiveSentiment: return "Positive";
      case MoodState.NegativeSentiment: return "Negative";
      case MoodState.Neutral: return "Neutral";
      default: return "Neutral";
    }
  };

  /**
   * Handle NFT minting - Full pipeline:
   * 1. Connect wallet if not connected
   * 2. Fetch latest price from Arkiv
   * 3. Generate NFT image
   * 4. Upload to IPFS via Pinata
   * 5. Create and upload metadata
   * 6. Mint NFT on-chain with smart contract
   */
  const handleMint = async () => {
    try {
      setIsMinting(true);

      // Step 0: Check wallet connection
      if (!account) {
        setMintStatus("🔗 Please connect your wallet first using the button in the header...");
        setTimeout(() => setMintStatus(""), 3000);
        return;
      }

      // Step 1: Use already-fetched market data
      if (!marketData) {
        setMintStatus("❌ Market data not available. Please wait for data to load.");
        setTimeout(() => setMintStatus(""), 3000);
        return;
      }

      setMintStatus("📊 Using latest market data from Arkiv...");
      console.log("📊 Market data for minting:", marketData);
      setMintStatus(`✅ Price: $${marketData.price.toFixed(2)} | Change: ${marketData.priceChangePercent24h > 0 ? '+' : ''}${marketData.priceChangePercent24h.toFixed(2)}%`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Show sample image in container immediately
      const sampleImages: Record<CoinType, string> = {
        SOL: '/sol.png',
        DOT: '/dot.png',
        BTC: '/sol.png', // Fallback to sol.png for BTC
      };
      setGeneratedImageUrl(sampleImages[selectedCoin]);

      // Step 2: Generate image and upload to IPFS
      setMintStatus("🎨 Generating AI image...");
      const { metadataURI, metadata, imageUrl } = await prepareNFTForMinting(selectedCoin, marketData);

      console.log("✅ NFT prepared:", { metadataURI, metadata, imageUrl });
      setMintStatus(`✅ Uploaded to IPFS! Metadata URI: ${metadataURI}`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Derive H160 address from AccountId
      setMintStatus("🔍 Deriving H160 address from your account...");

      const h160Address = accountIdToH160(account.address);

      if (!h160Address) {
        setMintStatus("❌ Failed to derive H160 address. Please try again.");
        setTimeout(() => setMintStatus(""), 3000);
        return;
      }

      setMintStatus(`✅ H160 address: ${h160Address}`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const contractService = getContractService();
      const mood = getMoodFromMarketData(marketData);

      // Step 4: Mint NFT on-chain
      setMintStatus("⛓️ Minting NFT on blockchain...");

      try {
        const txHash = await contractService.mint(account, {
          to: h160Address,
          coin: selectedCoin,
          mood: mood,
        });

        console.log('Mint transaction hash:', txHash);

        setMintStatus(
          `🎉 NFT minted successfully!\n` +
          `Token: ${selectedCoin} | Mood: ${metadata.attributes.find(a => a.trait_type === 'Mood')?.value}\n` +
          `Tx: ${txHash.slice(0, 10)}...`
        );
        setTimeout(() => setMintStatus(""), 10000);

      } catch (contractError) {
        console.error("Contract minting error:", contractError);
        const errorMessage = contractError instanceof Error ? contractError.message : 'Unknown error';
        setMintStatus(`❌ Minting transaction failed: ${errorMessage}`);
        setTimeout(() => setMintStatus(""), 8000);
        return;
      }

    } catch (error) {
      console.error("Error during minting:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMintStatus(`❌ Minting failed: ${errorMessage}`);
      setTimeout(() => setMintStatus(""), 5000);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8 relative z-10">
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
          {(["SOL", "DOT", "BTC"] as CoinType[]).map((coin) => (
            <Button
              key={coin}
              variant={selectedCoin === coin ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedCoin(coin)}
              className="min-w-[100px]"
              disabled={isLoadingData}
            >
              {coin}
            </Button>
          ))}
        </section>

        {/* Market Metrics */}
        <section>
          {marketData ? (
            <MarketMetrics
              price={marketData.price}
              priceChange24h={marketData.priceChangePercent24h}
              volatility={0} // TODO: Calculate from market data
              sentiment={marketData.priceChangePercent24h > 0 ? "Positive" : marketData.priceChangePercent24h < 0 ? "Negative" : "Neutral"}
              sentimentScore={Math.min(Math.abs(marketData.priceChangePercent24h) / 10, 1)}
              mood={getMoodDisplay(marketData)}
            />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              {isLoadingData ? "Loading market data..." : "Failed to load market data"}
            </div>
          )}
        </section>

        {/* NFT Display and Info */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main NFT Display */}
          <div className="lg:col-span-2">
            <NFTDisplay
              coin={selectedCoin}
              mood={getMoodDisplay(marketData)}
              imageUrl={generatedImageUrl}
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
                  Create your own {selectedCoin} market mood NFT
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleMint}
                  disabled={isMinting || !account || !marketData || isLoadingData}
                >
                  {isMinting ? "Minting..." : isLoadingData ? "Loading data..." : "Mint Now"}
                </Button>
                {mintStatus && (
                  <div className="text-sm text-center p-2 rounded-md bg-muted whitespace-pre-line">
                    {mintStatus}
                  </div>
                )}
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
