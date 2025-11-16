# EchoMint 🎨⛓️

**Living NFTs That Reflect Market Sentiment**

EchoMint is a dynamic NFT platform built on Polkadot that creates "living" digital art reflecting real-time cryptocurrency market sentiment. Each NFT evolves its visual appearance based on market data from Arkiv Network, creating unique pieces that respond to market conditions.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![ink! v6](https://img.shields.io/badge/ink!-v6.0.0--beta.1-purple)](https://use.ink/)
[![Passet Hub](https://img.shields.io/badge/Deployed%20on-Passet%20Hub-green)](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Ftestnet-passet-hub.polkadot.io)

## 🔗 Links

- **Demo:** [Coming Soon - Deployed on Vercel]
- **Pitch Video:** [Pitch Video](https://youtu.be/csnKkrBI8fw)
- **Pitch Deck:** [Pitch Deck](https://docs.google.com/presentation/d/1XB5m_70E5a5EG0Hyl62MMb9jXLSnZMhtWWrXJW_h-AI/edit?usp=sharing)
- **Contract Address:** `0x7790cd497f1D21759F00B83407E16B908319B9FC` (Passet Hub)

## 🌟 Features

- **Dynamic NFTs**: NFT mood states change based on real market data
- **Real-Time Market Data**: Integration with Arkiv Network for live price feeds
- **6 Mood States**: Bullish, Bearish, Neutral, Volatile, Positive Sentiment, Negative Sentiment
- **Multi-Asset Support**: SOL, DOT, BTC (expandable to more)
- **IPFS Storage**: Decentralized metadata and image storage via Pinata
- **Wallet Integration**: Support for Polkadot.js, SubWallet, Talisman via LunoKit
- **pallet-revive Compatible**: Built for ink! v6 with H160 address support

## 🏗️ Tech Stack

### Smart Contract
- **ink! v6.0.0-beta.1**: Smart contract framework
- **pallet-revive**: EVM-compatible contracts pallet
- **Passet Hub**: Official ink! v6 testnet on Paseo

### Frontend
- **React Router v7**: Modern React framework with server-side routes
- **TypeScript**: Type-safe development
- **Vite**: Fast build tooling
- **LunoKit**: Polkadot wallet connection
- **@polkadot/api**: Blockchain interaction
- **TailwindCSS**: Styling

### Backend/Services
- **Arkiv Network**: Real-time market data indexer
- **Pinata**: IPFS pinning service
- **Google Gemini**: AI image generation (optional)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Rust and Cargo (for contract development)
- Polkadot wallet extension (Polkadot.js, SubWallet, or Talisman)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/[your-username]/echomint.git
cd echomint
```

#### 2. Smart Contract Setup

```bash
cd contracts

# Install dependencies
cargo build

# Build the contract
pop build --release
# OR
cargo contract build --release

# The compiled contract will be in target/ink/
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# OR
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

#### 4. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Gemini API (for AI image generation)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Pinata IPFS
VITE_PINATA_JWT=your_pinata_jwt_here

# Network Configuration
VITE_NETWORK=passet

# Contract Address
VITE_PASSET_CONTRACT_ADDRESS=0x7790cd497f1D21759F00B83407E16B908319B9FC
```

#### 5. Run Development Server

```bash
npm run dev
# OR
pnpm dev

# Open http://localhost:5173
```

## 📝 Smart Contract Deployment

### Using pop CLI

```bash
cd contracts

# Build contract
pop build --release

# Deploy to Passet Hub
pop up contract -p ./target/ink/echomint_nft.contract --url wss://testnet-passet-hub.polkadot.io

# Follow prompts to:
# 1. Map your account: call revive.mapAccount()
# 2. Deploy the contract
# 3. Save the contract address
```

### Manual Deployment via Polkadot.js Apps

1. Go to [Polkadot.js Apps](https://polkadot.js.org/apps/)
2. Connect to `wss://testnet-passet-hub.polkadot.io`
3. Navigate to **Developer > Extrinsics**
4. Call `revive.mapAccount()` to create H160 mapping
5. Navigate to **Developer > Contracts > Upload & Deploy**
6. Upload `echomint_nft.contract` from `target/ink/`
7. Set constructor parameters and deploy

## 🎮 Usage

### Minting an NFT

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Select Asset**: Choose SOL, DOT, or BTC
3. **View Market Data**: See real-time price and mood state
4. **Mint NFT**: Click "Mint Now" and approve the transaction
5. **View NFT**: Your minted NFT appears in the display with current mood

### Mood States

| Mood | Trigger | Visual |
|------|---------|--------|
| **Bullish** | Price change > +5% | Bright, vibrant colors |
| **Bearish** | Price change < -5% | Dark, muted tones |
| **Volatile** | Absolute change > 10% | Glitchy, dynamic effects |
| **Positive** | Price change > 0% | Warm color variations |
| **Negative** | Price change < 0% | Cool, corrupted aesthetics |
| **Neutral** | Price change ≈ 0% | Calm, balanced colors |

## 🏛️ Architecture

```
┌─────────────────┐
│  Arkiv Network  │  ← Market Data Source
└────────┬────────┘
         │
         │ Price Data
         ↓
┌─────────────────┐
│   Frontend      │  ← User Interface
│  (React/Vite)   │
└────────┬────────┘
         │
         │ Wallet Connection
         ↓
┌─────────────────┐
│  Passet Hub     │  ← Blockchain
│  (pallet-revive)│
└────────┬────────┘
         │
         │ Contract Calls
         ↓
┌─────────────────┐
│  EchoMint NFT   │  ← Smart Contract
│  (ink! v6)      │
└─────────────────┘
         │
         │ Metadata URI
         ↓
┌─────────────────┐
│  IPFS (Pinata)  │  ← Decentralized Storage
└─────────────────┘
```

## 🛣️ Roadmap

### Milestone 2 (30 Days)
- [ ] Hyperbridge integration for cross-chain messaging
- [ ] Dynamic NFT mood updates on-chain
- [ ] NFT gallery and portfolio view
- [ ] Production AI image generation with fallbacks
- [ ] Production deployment on Kusama/Polkadot

### Future Features
- [ ] Multi-chain deployment (Ethereum, Avalanche, Cosmos)
- [ ] NFT trading marketplace
- [ ] Portfolio-based NFTs (multiple assets)
- [ ] DAO governance for asset addition
- [ ] Mobile app (iOS/Android)

## 🧪 Testing

```bash
# Run contract tests
cd contracts
cargo test

# Run frontend tests (if applicable)
cd frontend
npm test
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Polkadot Sub0 Buenos Aires 2024** - Hackathon support and resources
- **Arkiv Network** - Real-time market data infrastructure
- **Parity Technologies** - ink! smart contract framework
- **Hyperbridge** - Cross-chain messaging protocol (planned integration)
- **Pinata** - IPFS pinning service

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

For questions, suggestions, or partnerships:
- **GitHub Issues**: [Open an issue](https://github.com/[your-username]/echomint/issues)
- **Twitter**: [@YourTwitterHandle]
- **Email**: your.email@example.com

---

Built with ❤️ at Polkadot Sub0 Buenos Aires 2024
