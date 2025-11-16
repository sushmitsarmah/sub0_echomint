# EchoMint Arkiv Indexer

Decentralized market data storage for EchoMint dynamic NFTs using **Arkiv Network** - a blockchain-native database layer on Ethereum.

## What is Arkiv Network?

**Arkiv Network** is a decentralized data layer that brings queryable, time-scoped storage to Ethereum. It's NOT a traditional indexer - it's a blockchain database where data:
- Lives on-chain with automatic expiration
- Is queryable with SQL-like syntax
- Has attributes for filtering and searching
- Can be accessed directly from frontends

## Overview

This indexer:
1. **Fetches** cryptocurrency market data from CoinGecko API (price, volume, 24h changes)
2. **Stores** the data on Arkiv Network as time-scoped entities
3. **Expires** old data automatically (default: 3 hours)
4. Allows the **frontend to query** Arkiv directly for real-time data

```
┌─────────────────┐
│  CoinGecko API  │
│  (Market Data)  │
└────────┬────────┘
         │
         │ Fetch prices every minute
         ↓
┌────────────────────┐
│  Arkiv Indexer     │
│  (This Service)    │
└────────┬───────────┘
         │
         │ Store entities with expiration
         ↓
┌────────────────────┐
│  Arkiv Network     │
│  (Mendoza Testnet) │
│  Blockchain DB     │
└────────┬───────────┘
         │
         │ Query directly
         ↓
┌────────────────────┐
│  Frontend          │
│  (React App)       │
└────────────────────┘
```

## Features

- ✅ **Real Arkiv Network Integration** - Uses `@arkiv-network/sdk` properly
- 📊 **Market Data Storage** - Stores SOL, DOT, BTC, ETH, KSM prices
- ⏰ **Time-Scoped Entities** - Data expires automatically (configurable)
- 🔍 **Queryable Attributes** - Filter by token, timestamp, type
- 🚀 **Periodic Updates** - Fetches and stores data every 1 minute (configurable)
- 📦 **Batch Storage** - Stores all tokens in a single transaction

## Installation

### Prerequisites

- Node.js 18+ or Bun 1.x
- Ethereum wallet private key (for Arkiv testnet)
- Network access to Arkiv Mendoza testnet

### Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your private key to .env
nano .env
# Replace YOUR_PRIVATE_KEY_HERE with your actual private key
```

## Configuration

Edit `.env` file:

```bash
# Arkiv Network Configuration (Mendoza Testnet)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
RPC_URL=https://mendoza.hoodi.arkiv.network/rpc
WS_URL=wss://mendoza.hoodi.arkiv.network/rpc/ws

# Update interval (how often to fetch and store)
UPDATE_INTERVAL_MINUTES=1

# Tracked cryptocurrency symbols
TRACKED_SYMBOLS=SOL,DOT,BTC

# Data expiration (in seconds) - 3 hours default
DATA_EXPIRATION_SECONDS=10800
```

### Getting a Private Key

You can use any Ethereum wallet:

```bash
# Using ethers.js to generate new wallet
npx ethers@6 --version
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

⚠️ **Note**: This is for Arkiv testnet. Don't use wallets with mainnet funds.

## Running

### Development Mode (with hot reload)

```bash
npm run dev
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Run the compiled code
npm start
```

### Quick Start Script

```bash
# Uses tsx to run directly
chmod +x start.sh
./start.sh
```

## How It Works

### 1. Fetch Market Data

The indexer fetches real-time data from CoinGecko's public API:

```typescript
GET https://api.coingecko.com/api/v3/coins/solana

Returns:
{
  market_data: {
    current_price: { usd: 142.35 },
    total_volume: { usd: 2500000000 },
    price_change_24h: 5.2,
    price_change_percentage_24h: 3.79,
    high_24h: { usd: 145.00 },
    low_24h: { usd: 138.50 },
    market_cap: { usd: 65000000000 }
  }
}
```

### 2. Create Arkiv Entities

Each snapshot becomes an entity with:

```typescript
{
  payload: JSON.stringify({
    symbol: "SOL",
    price: 142.35,
    volume24h: 2500000000,
    priceChange24h: 5.2,
    priceChangePercent24h: 3.79,
    high24h: 145.00,
    low24h: 138.50,
    marketCap: 65000000000,
    timestamp: 1706184600000
  }),
  contentType: "application/json",
  expiresIn: 10800, // 3 hours
  attributes: {
    token: "SOL",
    type: "market_snapshot",
    timestamp: "1706184600000"
  }
}
```

### 3. Store to Arkiv Network

All entities are batched and sent in a single transaction:

```typescript
const tx = await walletClient.mutateEntities({
  creates: [entity1, entity2, entity3],
  updates: []
});

const signedTx = await wallet.signTransaction(tx);
// Broadcast to Arkiv Mendoza testnet
```

### 4. Query from Frontend

Frontend can query Arkiv directly using the public client:

```typescript
import { createPublicClient } from '@arkiv-network/sdk';

const publicClient = createPublicClient({
  arkivRpcUrl: 'https://mendoza.hoodi.arkiv.network/rpc'
});

// Get latest SOL price
const entities = await publicClient.queryEntities({
  filter: {
    attributes: {
      token: 'SOL',
      type: 'market_snapshot'
    },
    owner: '0xYOUR_INDEXER_WALLET_ADDRESS'
  },
  includePayload: true,
  orderBy: { timestamp: 'desc' },
  limit: 1
});

const marketData = JSON.parse(entities[0].payload);
console.log(`SOL Price: $${marketData.price}`);
```

## Project Structure

```
arkiv-indexer/
├── src/
│   ├── indexers/
│   │   └── marketDataIndexer.ts    # Fetches from CoinGecko, stores to Arkiv
│   └── index.ts                     # Main entry point
├── .env                             # Configuration (your private key)
├── .env.example                     # Example configuration
├── package.json                     # Dependencies (@arkiv-network/sdk)
├── tsconfig.json                    # TypeScript config
├── start.sh                         # Quick start script
└── README.md                        # This file
```

## Example Output

When running, you'll see:

```
═══════════════════════════════════════════════════
🎨 EchoMint Arkiv Indexer
═══════════════════════════════════════════════════
Decentralized market data storage for dynamic NFTs
═══════════════════════════════════════════════════

📍 Arkiv Wallet Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
📊 Tracking symbols: SOL, DOT, BTC
⏰ Data expires after: 10800s (3h)

🚀 Starting Market Data Indexer with Arkiv Network...

════════════════════════════════════════════════════════════
📊 Fetching Market Data - 2024-01-25T10:30:00.000Z
════════════════════════════════════════════════════════════
✅ SOL: $142.35 (+3.79%)
✅ DOT: $7.82 (-2.10%)
✅ BTC: $43250.00 (+1.80%)

💾 Storing 3 snapshots to Arkiv Network...
📤 Transaction signed, sending to Arkiv...
   Entities: 3
   Expires in: 10800s
✅ Signed transaction ready (1234 bytes)

✅ Successfully stored 3 snapshots to Arkiv

✅ Indexer is now running
📊 Market data is being stored to Arkiv Network
🔄 Updates are running on schedule

Press Ctrl+C to stop
```

## Tracked Cryptocurrencies

Default symbols (configurable in `.env`):

- **SOL** - Solana
- **DOT** - Polkadot
- **BTC** - Bitcoin

To add more, edit `TRACKED_SYMBOLS` in `.env`:

```bash
TRACKED_SYMBOLS=SOL,DOT,BTC,ETH,KSM,AVAX,MATIC
```

And update the `coinIds` mapping in `marketDataIndexer.ts`:

```typescript
const coinIds: Record<string, string> = {
  'SOL': 'solana',
  'DOT': 'polkadot',
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'KSM': 'kusama',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network'
};
```

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start dist/index.js --name echomint-arkiv

# Monitor
pm2 logs echomint-arkiv

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Using Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t echomint-arkiv .
docker run -d \
  --name echomint-arkiv \
  --env-file .env \
  --restart unless-stopped \
  echomint-arkiv
```

## Troubleshooting

### "PRIVATE_KEY not found"

Make sure you've:
1. Created `.env` file: `cp .env.example .env`
2. Added your private key: `PRIVATE_KEY=0xYOUR_KEY_HERE`

### CoinGecko Rate Limits

Free tier: 10-50 calls/minute

If you hit limits:
- Increase `UPDATE_INTERVAL_MINUTES` to `5` or `10`
- Get a CoinGecko Pro API key

### Arkiv Network Connection Issues

Check testnet status:
```bash
curl https://mendoza.hoodi.arkiv.network/rpc
```

Try different RPC:
```bash
# In .env
RPC_URL=https://mendoza.hoodi.arkiv.network/rpc
```

## Resources

- **Arkiv Network Docs**: https://arkiv.network/docs
- **Arkiv TypeScript Guide**: https://arkiv.network/getting-started/typescript
- **Arkiv Fullstack Tutorial**: https://arkiv.network/docs/guides/fullstack-tutorial
- **CoinGecko API**: https://coingecko.com/api/documentation
- **Ethers.js Docs**: https://docs.ethers.org/v6/

## What's Next?

1. **Frontend Integration**: Query Arkiv from React app
2. **NFT Mood System**: Use market data to determine NFT moods
3. **Historical Analytics**: Query time-series data from Arkiv
4. **Alerts**: Subscribe to price changes using Arkiv's real-time events

## License

MIT
