import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { getMoodColor, getMoodLabel } from "../config/theme";

interface NFTDisplayProps {
  coin: string;
  mood: string;
  imageUrl?: string;
  tokenId?: string;
}

export function NFTDisplay({ coin, mood, imageUrl, tokenId }: NFTDisplayProps) {
  // Placeholder image if no imageUrl provided
  const displayImage = imageUrl || `/placeholder-nft-${mood.toLowerCase()}.png`;
  const moodColor = getMoodColor(mood);
  const moodLabel = getMoodLabel(mood);

  return (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {coin} Market Mood
            </CardTitle>
            <CardDescription>
              {tokenId ? `Token #${tokenId}` : 'Live NFT'}
            </CardDescription>
          </div>
          <Badge
            className="text-sm px-3 py-1"
            style={{
              backgroundColor: moodColor,
              color: 'white',
              border: 'none'
            }}
          >
            {moodLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* NFT Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-background to-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${coin} ${mood} NFT`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-6xl">{getMoodEmoji(mood)}</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  AI-generated artwork will appear here
                </p>
              </div>
            )}
          </div>

          {/* Glow effect overlay */}
          <div
            className="absolute inset-0 opacity-20 blur-2xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${moodColor}, transparent 70%)`
            }}
          />
        </div>

        {/* NFT Info Footer */}
        <div className="p-4 bg-card border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">Chain:</span> Kusama
            </div>
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">Status:</span>{' '}
              <span className="text-primary">Live</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getMoodEmoji(mood: string): string {
  const moodLower = mood.toLowerCase();

  if (moodLower.includes('bullish')) return '🚀';
  if (moodLower.includes('bearish')) return '📉';
  if (moodLower.includes('neutral')) return '😌';
  if (moodLower.includes('volatile')) return '⚡';
  if (moodLower.includes('positive')) return '💚';
  if (moodLower.includes('negative')) return '💔';

  return '🎨';
}
