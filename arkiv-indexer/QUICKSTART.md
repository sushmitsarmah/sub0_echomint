# Quick Start Guide

Get EchoMint Arkiv Indexer running in 5 minutes.

## 1. Install Dependencies

```bash
cd arkiv-indexer
npm install
```

## 2. Configure Environment

```bash
# Copy example config
cp .env.example .env

# Edit with your settings
nano .env
```

**Required settings:**
```bash
KUSAMA_CONTRACT_ADDRESS=5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty
SIGNER_ACCOUNT=//Alice  # Or your seed phrase
HYPERBRIDGE_RELAYER_URL=wss://kusama-rpc.polkadot.io
```

## 3. Run the Indexer

### Option A: Quick Start Script

```bash
./start.sh
```

### Option B: Manual

```bash
# Development mode (hot reload)
npm run dev

# Production mode
npm run build
npm start
```

## 4. Verify It's Working

You should see output like:

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

🎭 Calculating moods...
🎭 SOL Mood: Bullish (confidence: 85%)

🌉 Sending 1 mood updates via Hyperbridge...
✅ Analysis complete
```

## 5. Monitor

```bash
# Watch logs (if using PM2)
pm2 logs echomint-indexer

# Or just watch console output
# (if running with npm run dev)
```

## What It Does

Every 5 minutes (configurable), the indexer:

1. ✅ Fetches price data for SOL, DOT, BTC from CoinGecko
2. ✅ Analyzes sentiment (social + on-chain + technical)
3. ✅ Calculates volatility from price history
4. ✅ Determines mood state for each NFT
5. ✅ Sends mood updates to Kusama via Hyperbridge (if changed)

## Mood States

- **Bullish** 🚀 - Price up + positive sentiment
- **Bearish** 📉 - Price down + negative sentiment
- **Neutral** 😌 - Stable market
- **Volatile** ⚡ - High price swings (>50% volatility)
- **PositiveSentiment** 💚 - Strong community optimism
- **NegativeSentiment** 💔 - Community fear

## Troubleshooting

### "Cannot find module"
```bash
npm install
npm run build
```

### "Hyperbridge connection failed"
- Check `HYPERBRIDGE_RELAYER_URL` in `.env`
- Verify network connectivity
- Indexer will run in offline mode if Hyperbridge is unavailable

### "Rate limit exceeded"
- Increase `UPDATE_INTERVAL_MINUTES` in `.env`
- Get a CoinGecko Pro API key
- Add `COINGECKO_API_KEY` to `.env`

### High memory usage
```bash
# Increase Node.js memory
node --max-old-space-size=4096 dist/index.js
```

## Configuration Options

Edit `.env`:

```bash
# How often to analyze (minutes)
UPDATE_INTERVAL_MINUTES=5

# Enable/disable features
ENABLE_HYPERBRIDGE=true
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_VOLATILITY_TRACKING=true

# Logging
LOG_LEVEL=info
```

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start
pm2 start dist/index.js --name echomint-indexer

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Using Docker

```bash
# Build
docker build -t echomint-indexer .

# Run
docker run -d \
  --name echomint-indexer \
  --env-file .env \
  --restart unless-stopped \
  echomint-indexer
```

## Next Steps

1. ✅ Deploy NFT contract to Kusama
2. ✅ Update `KUSAMA_CONTRACT_ADDRESS` in `.env`
3. ✅ Mint test NFTs
4. ✅ Watch them change moods in real-time!

## Need Help?

- Read full docs: `README.md`
- Check logs for errors
- Verify all environment variables
- Test API connectivity: `curl https://api.coingecko.com/api/v3/ping`

## Development

### Add New Coin

1. Edit `src/index.ts`
2. Add to `tokenRegistry`:
   ```typescript
   this.tokenRegistry = {
     1: 'SOL',
     2: 'DOT',
     3: 'BTC',
     4: 'ETH', // New coin
   };
   ```
3. Restart indexer

### Change Update Frequency

Edit `.env`:
```bash
UPDATE_INTERVAL_MINUTES=1  # Every 1 minute (careful with rate limits!)
```

### Test Without Hyperbridge

```bash
ENABLE_HYPERBRIDGE=false npm run dev
```

This runs analysis but doesn't send updates to Kusama.

---

**That's it!** Your indexer is now monitoring markets and updating NFT moods in real-time. 🎉
