# EchoMint Arkiv Indexer

Real-time market data indexer and mood analyzer for EchoMint dynamic NFTs. Tracks price movements, volatility, and sentiment across multiple chains, then sends mood updates to Kusama via Hyperbridge.

## Overview

The Arkiv Indexer is the brain of EchoMint - it continuously monitors market conditions and determines when NFTs should change their mood state.

```
┌─────────────────┐
│  CoinGecko API  │──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │    ┌──────────────────┐
│  On-chain Data  │──┼───→│  Arkiv Indexer   │
└─────────────────┘  │    └──────────────────┘
                     │             │
┌─────────────────┐  │             ↓
│ Social Signals  │──┘    ┌──────────────────┐
└─────────────────┘       │ Mood Calculator  │
                          └──────────────────┘
                                   │
                                   ↓
                          ┌──────────────────┐
                          │   Hyperbridge    │
                          └──────────────────┘
                                   │
                                   ↓
                          ┌──────────────────┐
                          │  Kusama NFT      │
                          │  Contract        │
                          └──────────────────┘
```

## Features

- 📊 **Real-time Market Data** - Tracks SOL, DOT, BTC prices and volumes
- 💭 **Sentiment Analysis** - Analyzes social and on-chain sentiment
- ⚡ **Volatility Tracking** - Calculates price volatility over time
- 🎭 **Mood Calculation** - Determines 6 mood states for NFTs
- 🌉 **Hyperbridge Integration** - Sends cross-chain mood updates
- 🔄 **Automatic Updates** - Runs analysis every 5 minutes
- 📈 **Historical Data** - Maintains price and sentiment history

## Mood States

The indexer calculates one of 6 mood states for each NFT:

1. **Bullish** 🚀 - Strong upward price movement + positive sentiment
2. **Bearish** 📉 - Downward trend + negative sentiment
3. **Neutral** 😌 - Stable market with balanced sentiment
4. **Volatile** ⚡ - High price swings (>50% volatility)
5. **PositiveSentiment** 💚 - Strong community optimism
6. **NegativeSentiment** 💔 - Community fear and doubt

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to market data APIs (CoinGecko)

### Setup

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env

# Build TypeScript
npm run build
```

## Configuration

Edit `.env` file:

```bash
# Hyperbridge settings
HYPERBRIDGE_RELAYER_URL=wss://kusama-rpc.polkadot.io
KUSAMA_CONTRACT_ADDRESS=your_contract_address_here
SIGNER_ACCOUNT=your_seed_phrase_here

# How often to run analysis (in minutes)
UPDATE_INTERVAL_MINUTES=5

# Optional API keys for production
COINGECKO_API_KEY=your_api_key
```

## Running

### Development Mode (with hot reload)

```bash
npm run dev
```

### Production Mode

```bash
# Build first
npm run build

# Then run
npm start
```

### Using PM2 (recommended for production)

```bash
# Install PM2
npm install -g pm2

# Start indexer
pm2 start dist/index.js --name echomint-indexer

# Monitor logs
pm2 logs echomint-indexer

# Restart
pm2 restart echomint-indexer

# Stop
pm2 stop echomint-indexer
```

## Project Structure

```
arkiv-indexer/
├── src/
│   ├── indexers/
│   │   └── marketDataIndexer.ts    # Fetches price/volume data
│   ├── analyzers/
│   │   ├── sentimentAnalyzer.ts    # Analyzes sentiment
│   │   └── moodCalculator.ts       # Determines mood states
│   ├── utils/
│   │   └── hyperbridgeClient.ts    # Cross-chain messaging
│   └── index.ts                     # Main orchestrator
├── config/
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### 1. Market Data Collection

The `MarketDataIndexer` fetches real-time data from CoinGecko:

```typescript
const marketData = await marketDataIndexer.getCurrentData('SOL');
// Returns: { price, volume, priceChange24h, high, low, etc. }
```

### 2. Sentiment Analysis

The `SentimentAnalyzer` combines multiple signals:

```typescript
const sentiment = await sentimentAnalyzer.analyzeSentiment(symbol, marketData);
// Returns: { score: -1 to 1, confidence, signals }
```

**Signals analyzed:**
- **Social**: Twitter mentions, Reddit sentiment
- **On-chain**: Transaction volume, active addresses
- **Technical**: Price action, volume patterns

### 3. Volatility Calculation

Calculates annualized volatility from price history:

```typescript
const volatility = marketDataIndexer.calculateVolatility('SOL', 60);
// Returns: percentage (e.g., 45.2 = 45.2% annualized volatility)
```

### 4. Mood Determination

The `MoodCalculator` determines the mood based on all factors:

```typescript
const mood = moodCalculator.calculateMood(marketData, sentiment, volatility);
// Returns: { mood: MoodState, confidence, factors }
```

**Logic:**
- High volatility (>50%) → **Volatile**
- Strong sentiment (>0.6) → **PositiveSentiment** / **NegativeSentiment**
- Price up + positive sentiment → **Bullish**
- Price down + negative sentiment → **Bearish**
- Otherwise → **Neutral**

### 5. Hyperbridge Updates

If mood changed, send cross-chain update:

```typescript
await hyperbridgeClient.sendMoodUpdate(tokenId, moodAnalysis);
```

This triggers the NFT contract on Kusama to:
1. Update the mood state
2. Generate new AI image
3. Emit event for frontends

## API Integration

### CoinGecko API

Free tier allows 10-50 calls/minute. For production, consider:

```bash
# Get API key from CoinGecko
COINGECKO_API_KEY=your_key_here
```

Then modify `marketDataIndexer.ts`:

```typescript
const response = await axios.get(url, {
  headers: {
    'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
  }
});
```

### Social Sentiment APIs

For production sentiment analysis:

**Twitter API:**
```bash
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
```

**Reddit API:**
```bash
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret
```

### On-chain Data APIs

**Subscan (for DOT):**
```bash
SUBSCAN_API_KEY=your_key
```

**Solscan (for SOL):**
```bash
SOLSCAN_API_KEY=your_key
```

## Testing

```bash
# Run unit tests
npm test

# Test specific module
npm test -- marketDataIndexer.test.ts

# Run with coverage
npm test -- --coverage
```

## Monitoring

### Logs

The indexer outputs structured logs:

```
🚀 EchoMint Arkiv Indexer Starting...
📋 Loaded 3 NFTs to track
🌉 Connecting to Hyperbridge...
✅ Hyperbridge connected
📊 Tracking: SOL, DOT, BTC
⏰ Analysis will run every 5 minutes

═══════════════════════════════════════════════════
🔍 Running Analysis - 2024-01-15T10:30:00.000Z
═══════════════════════════════════════════════════

📊 Fetching market data...
✅ SOL: $142.35 (+5.2%)
✅ DOT: $7.82 (-2.1%)
✅ BTC: $43250.00 (+1.8%)

💭 Analyzing sentiment...
📊 SOL Sentiment: Positive (0.72)
📊 DOT Sentiment: Neutral (0.50)
📊 BTC Sentiment: Positive (0.65)

⚡ Calculating volatility...
   SOL: 38.50%
   DOT: 42.30%
   BTC: 23.10%

🎭 Calculating moods...
🎭 SOL Mood: Bullish (confidence: 85%)
🎭 DOT Mood: Neutral (confidence: 70%)
🎭 BTC Mood: Bullish (confidence: 75%)

   Token #1 (SOL): New → Bullish 🚀
   Token #2 (DOT): New → Neutral 😌
   Token #3 (BTC): New → Bullish 🚀

🌉 Sending 3 mood updates via Hyperbridge...
   ✅ 3/3 updates sent successfully

✅ Analysis complete
```

### Health Checks

Add to your monitoring system:

```bash
# Check if indexer is running
pm2 list | grep echomint-indexer

# Check logs
tail -f logs/indexer.log

# Check Hyperbridge connection
curl http://localhost:3000/health
```

## Production Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t echomint-indexer .
docker run -d \
  --name echomint-indexer \
  --env-file .env \
  --restart unless-stopped \
  echomint-indexer
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: echomint-indexer
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: indexer
        image: echomint-indexer:latest
        envFrom:
        - secretRef:
            name: echomint-secrets
```

## Troubleshooting

### Rate Limiting

If you hit CoinGecko rate limits:

1. Increase `UPDATE_INTERVAL_MINUTES`
2. Get a pro API key
3. Implement caching

### Hyperbridge Connection Issues

```bash
# Check if Kusama node is reachable
wscat -c wss://kusama-rpc.polkadot.io

# Verify contract address
echo $KUSAMA_CONTRACT_ADDRESS

# Check signer account balance
# (needs funds for gas)
```

### Memory Issues

```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 dist/index.js
```

## Performance Optimization

### Caching

Implement Redis caching for market data:

```typescript
const cached = await redis.get(`market:${symbol}`);
if (cached) return JSON.parse(cached);
```

### Batch Processing

Process multiple NFTs in parallel:

```typescript
const moodPromises = tokens.map(async (token) => {
  return calculateMood(token);
});
await Promise.all(moodPromises);
```

### Database Storage

Store historical data for analytics:

```typescript
await db.moodHistory.insert({
  tokenId,
  mood,
  timestamp,
  factors
});
```

## Development

### Adding New Data Sources

1. Create new indexer in `src/indexers/`
2. Implement `start()` and `getCurrentData()` methods
3. Add to main orchestrator in `src/index.ts`

### Adding New Mood States

1. Add enum value in `moodCalculator.ts`
2. Update mood logic in `calculateMood()`
3. Update smart contract
4. Update frontend

### Testing Locally

```bash
# Use mock data instead of live APIs
export USE_MOCK_DATA=true
npm run dev
```

## Contributing

See main project README for contribution guidelines.

## License

MIT

## Support

For indexer-related issues:
- Check logs first: `pm2 logs echomint-indexer`
- Review configuration: `.env` file
- Test connectivity: APIs and Hyperbridge
- Open GitHub issue with logs

## Resources

- [Arkiv Documentation](https://arkiv.network/docs)
- [Hyperbridge Docs](https://hyperbridge.network)
- [CoinGecko API](https://coingecko.com/api/documentation)
- [Polkadot.js API](https://polkadot.js.org/docs/)
