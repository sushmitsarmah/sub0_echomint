import type { Route } from "./+types/gallery";
import { useState } from "react";
import { Header } from "../components/Header";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gallery - EchoMint" },
    { name: "description", content: "Browse the collection of living NFTs that evolve with market sentiment." },
  ];
}

// Mock NFT collection data
const MOCK_NFTS = [
  {
    id: "1",
    name: "SOL Echo #001",
    coin: "SOL",
    mood: "Bullish",
    price: "$142.35",
    change: "+5.2%",
    imageUrl: undefined,
    minted: "2024-01-15",
    owner: "0x1234...5678",
  },
  {
    id: "2",
    name: "DOT Echo #002",
    coin: "DOT",
    mood: "Neutral",
    price: "$7.82",
    change: "-2.1%",
    imageUrl: undefined,
    minted: "2024-01-14",
    owner: "0xabcd...efgh",
  },
  {
    id: "3",
    name: "BTC Echo #003",
    coin: "BTC",
    mood: "Bullish",
    price: "$43,250",
    change: "+1.8%",
    imageUrl: undefined,
    minted: "2024-01-13",
    owner: "0x9876...5432",
  },
  {
    id: "4",
    name: "SOL Echo #004",
    coin: "SOL",
    mood: "Volatile",
    price: "$142.35",
    change: "+12.5%",
    imageUrl: undefined,
    minted: "2024-01-12",
    owner: "0xfedc...ba98",
  },
  {
    id: "5",
    name: "DOT Echo #005",
    coin: "DOT",
    mood: "Bearish",
    price: "$7.82",
    change: "-8.3%",
    imageUrl: undefined,
    minted: "2024-01-11",
    owner: "0x1111...2222",
  },
  {
    id: "6",
    name: "BTC Echo #006",
    coin: "BTC",
    mood: "Positive",
    price: "$43,250",
    change: "+3.2%",
    imageUrl: undefined,
    minted: "2024-01-10",
    owner: "0x3333...4444",
  },
];

const MOOD_COLORS = {
  Bullish: "bg-yellow-700/20 text-yellow-500 border-yellow-600/50",
  Bearish: "bg-orange-900/20 text-orange-600 border-orange-700/50",
  Neutral: "bg-amber-800/20 text-amber-400 border-amber-700/50",
  Volatile: "bg-yellow-600/20 text-yellow-400 border-yellow-500/50",
  Positive: "bg-yellow-600/20 text-yellow-300 border-yellow-500/50",
  Negative: "bg-red-900/20 text-red-700 border-red-800/50",
};

const MOOD_GLOWS = {
  Bullish: "shadow-[0_0_30px_rgba(204,153,0,0.25)]",
  Bearish: "shadow-[0_0_30px_rgba(153,51,0,0.25)]",
  Neutral: "shadow-[0_0_30px_rgba(180,140,80,0.2)]",
  Volatile: "shadow-[0_0_30px_rgba(234,179,8,0.25)]",
  Positive: "shadow-[0_0_30px_rgba(234,200,50,0.25)]",
  Negative: "shadow-[0_0_30px_rgba(120,40,20,0.25)]",
};

export default function Gallery() {
  const [filter, setFilter] = useState<string>("all");

  const filteredNFTs = filter === "all"
    ? MOCK_NFTS
    : MOCK_NFTS.filter(nft => nft.coin === filter);

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Header Section */}
        <section className="text-center space-y-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            NFT <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Gallery</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the collection of living NFTs. Each piece evolves in real-time based on market sentiment and volatility.
          </p>
        </section>

        {/* Filter Buttons */}
        <section className="flex justify-center gap-4 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "SOL" ? "default" : "outline"}
            onClick={() => setFilter("SOL")}
          >
            SOL
          </Button>
          <Button
            variant={filter === "DOT" ? "default" : "outline"}
            onClick={() => setFilter("DOT")}
          >
            DOT
          </Button>
          <Button
            variant={filter === "BTC" ? "default" : "outline"}
            onClick={() => setFilter("BTC")}
          >
            BTC
          </Button>
        </section>

        {/* NFT Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNFTs.map((nft) => (
            <Card
              key={nft.id}
              className={`group hover:scale-105 transition-all duration-300 cursor-pointer ${MOOD_GLOWS[nft.mood as keyof typeof MOOD_GLOWS]}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{nft.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Minted on {nft.minted}
                    </CardDescription>
                  </div>
                  <Badge className={MOOD_COLORS[nft.mood as keyof typeof MOOD_COLORS]}>
                    {nft.mood}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* NFT Image Placeholder */}
                <div className="aspect-square rounded-lg bg-card border-2 border-border overflow-hidden relative group-hover:border-primary transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <div className="text-center space-y-2">
                      <Activity className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
                      <p className="text-sm text-muted-foreground">
                        {nft.mood} State
                      </p>
                      <p className="text-xs text-muted-foreground px-4">
                        AI-generated image evolving with {nft.coin} market data
                      </p>
                    </div>
                  </div>
                </div>

                {/* NFT Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{nft.price}</span>
                      <span className={`text-xs flex items-center gap-1 ${
                        nft.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {nft.change.startsWith('+') ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {nft.change}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tracking</span>
                    <Badge variant="secondary">{nft.coin}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Owner</span>
                    <span className="text-sm font-mono">{nft.owner}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Empty State */}
        {filteredNFTs.length === 0 && (
          <div className="text-center py-16">
            <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or mint a new NFT.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <section className="max-w-2xl mx-auto text-center space-y-4 py-8">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle>Want to Mint Your Own?</CardTitle>
              <CardDescription>
                Create a living NFT that evolves with your favorite crypto's market sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full sm:w-auto">
                Mint New NFT
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
