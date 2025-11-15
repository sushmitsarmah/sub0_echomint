import type { Route } from "./+types/about";
import { Header } from "../components/Header";
import { AnimatedBackground } from "../components/AnimatedBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Activity, Zap, Database, Shield, Sparkles, TrendingUp } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - EchoMint" },
    { name: "description", content: "Learn about EchoMint - Living NFTs that evolve with market sentiment using Arkiv, Hyperbridge, and Kusama." },
  ];
}

const FEATURES = [
  {
    icon: Activity,
    title: "Real-Time Evolution",
    description: "Your NFT's appearance changes dynamically based on live market data, volatility, and sentiment analysis.",
  },
  {
    icon: Zap,
    title: "Cross-Chain Power",
    description: "Built on Kusama with Hyperbridge for seamless cross-chain data transfer and market analytics.",
  },
  {
    icon: Database,
    title: "Arkiv Analytics",
    description: "Powered by Arkiv for real-time blockchain data indexing and sentiment analysis across multiple chains.",
  },
  {
    icon: Shield,
    title: "On-Chain Verification",
    description: "All mood states and transformations are verifiable on-chain, ensuring transparency and authenticity.",
  },
  {
    icon: Sparkles,
    title: "AI-Generated Art",
    description: "Each mood state triggers unique AI-generated visuals, making every NFT transformation one-of-a-kind.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Track sentiment, volatility, and price movements of SOL, DOT, BTC and more through your NFT.",
  },
];

const MOOD_STATES = [
  {
    name: "Bullish",
    emoji: "🚀",
    description: "Strong upward price movement with positive sentiment. Your NFT glows bright green with ascending patterns.",
    color: "text-green-400",
  },
  {
    name: "Bearish",
    emoji: "📉",
    description: "Downward trend with negative market sentiment. Dark reds and oranges dominate with descending motifs.",
    color: "text-red-400",
  },
  {
    name: "Neutral",
    emoji: "😌",
    description: "Stable market with balanced sentiment. Calm blues and grays create a peaceful, balanced aesthetic.",
    color: "text-blue-400",
  },
  {
    name: "Volatile",
    emoji: "⚡",
    description: "High price swings and uncertainty. Electric yellows and oranges with chaotic, energetic patterns.",
    color: "text-yellow-400",
  },
  {
    name: "Positive Sentiment",
    emoji: "💚",
    description: "Strong community optimism regardless of price. Warm greens and yellows with organic growth patterns.",
    color: "text-emerald-400",
  },
  {
    name: "Negative Sentiment",
    emoji: "💔",
    description: "Community fear and doubt. Deep reds and purples with fractured, corrupted visuals.",
    color: "text-rose-400",
  },
];

const TECH_STACK = [
  {
    name: "Arkiv",
    description: "Real-time blockchain data indexing and analytics platform",
    link: "#",
  },
  {
    name: "Hyperbridge",
    description: "Cross-chain messaging protocol for seamless data transfer",
    link: "#",
  },
  {
    name: "Kusama",
    description: "Canary network for Polkadot with NFT capabilities",
    link: "#",
  },
  {
    name: "Luno Kit",
    description: "Polkadot wallet integration for seamless user experience",
    link: "#",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-16 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-8">
          <Badge className="mb-2">Built for Polkadot Sub0 BA</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">EchoMint</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The first NFT collection that lives and breathes with the crypto market.
            Every price swing, every sentiment shift, every moment of volatility
            transforms your digital art in real-time.
          </p>
        </section>

        {/* Mission Statement */}
        <section className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lg">
              <p>
                EchoMint bridges the gap between market data and digital art. We believe
                NFTs should be more than static images—they should be living reflections
                of the crypto ecosystem they exist in.
              </p>
              <p>
                By combining Arkiv's real-time analytics, Hyperbridge's cross-chain
                capabilities, and Kusama's robust NFT infrastructure, we've created
                a new category of dynamic, sentiment-aware digital collectibles.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Key Features</h2>
            <p className="text-muted-foreground">What makes EchoMint unique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mood States */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Six Mood States</h2>
            <p className="text-muted-foreground">Each state creates a unique visual transformation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOOD_STATES.map((mood, index) => (
              <Card key={index} className="hover:scale-105 transition-transform">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">{mood.emoji}</span>
                    <CardTitle className={mood.color}>{mood.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{mood.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Powered By</h2>
            <p className="text-muted-foreground">Built with cutting-edge blockchain technology</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TECH_STACK.map((tech, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl">{tech.name}</CardTitle>
                  <CardDescription>{tech.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" asChild>
                    <a href={tech.link} target="_blank" rel="noopener noreferrer">
                      Learn More
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground">The technology behind the magic</p>
          </div>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Data Collection",
                description: "Arkiv continuously indexes blockchain data, tracking price movements, trading volume, and on-chain activity across multiple chains.",
              },
              {
                step: "2",
                title: "Sentiment Analysis",
                description: "Our AI analyzes social media, news, and on-chain metrics to determine real-time market sentiment.",
              },
              {
                step: "3",
                title: "Cross-Chain Messaging",
                description: "Hyperbridge securely transmits mood states from analytics chains to Kusama, where your NFT lives.",
              },
              {
                step: "4",
                title: "Visual Transformation",
                description: "Your NFT's metadata and visual representation automatically update to reflect the current mood state.",
              },
              {
                step: "5",
                title: "On-Chain Verification",
                description: "Every transformation is recorded on-chain, creating a permanent history of your NFT's evolution.",
              },
            ].map((item) => (
              <Card key={item.step} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Badge className="text-lg px-4 py-2">{item.step}</Badge>
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-2xl mx-auto text-center space-y-6 py-8">
          <h2 className="text-3xl font-bold">Ready to Experience Living NFTs?</h2>
          <p className="text-lg text-muted-foreground">
            Mint your first EchoMint NFT and watch it evolve with the market
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/">View Dashboard</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/gallery">Browse Gallery</a>
            </Button>
          </div>
        </section>

        {/* Footer Info */}
        <section className="text-center text-muted-foreground border-t border-border pt-8">
          <p>
            Built for Polkadot Sub0 BA • Powered by Arkiv × Hyperbridge × Kusama
          </p>
          <p className="mt-2 text-sm">
            EchoMint is an experimental art project exploring the intersection of
            market data and generative NFTs.
          </p>
        </section>
      </main>
    </div>
  );
}
