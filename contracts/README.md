# EchoMint Smart Contracts

This folder contains smart contracts for the EchoMint project - living NFTs that evolve with market sentiment on Kusama.

## Contracts

### 📦 echomint_nft

ink! smart contract for minting and managing dynamic NFTs on Kusama.

**Location:** `./echomint_nft/`

**Features:**
- Mint NFTs linked to crypto assets (SOL, DOT, BTC)
- Dynamic mood states that update based on market data
- Full NFT standard support (transfer, approve, query)
- Cross-chain mood updates via Hyperbridge
- AI-generated image support

**[→ Full Documentation](./echomint_nft/README.md)**

## Quick Start

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install cargo-contract
cargo install cargo-contract --force
```

### Build Contract

```bash
cd echomint_nft
./build.sh
```

### Deploy Locally

```bash
# Start local node
substrate-contracts-node --dev --tmp

# In another terminal
cd echomint_nft
cargo contract instantiate \
  --constructor new \
  --suri //Alice \
  --url ws://127.0.0.1:9944
```

### Deploy to Testnet

```bash
# Deploy to Rococo Contracts (testnet)
cargo contract instantiate \
  --constructor new \
  --suri "your seed phrase" \
  --url wss://rococo-contracts-rpc.polkadot.io
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│              Luno Kit + Dedot + Polkadot.js                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Kusama NFT Contract                        │
│                    (ink! / WASM)                             │
│  - mint()                                                    │
│  - update_mood()                                             │
│  - transfer()                                                │
│  - get_metadata()                                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Hyperbridge                             │
│              (Cross-chain messaging)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Arkiv Analytics                           │
│          (Market data + Sentiment analysis)                  │
└─────────────────────────────────────────────────────────────┘
```

## Development Workflow

1. **Build contracts**
   ```bash
   cd echomint_nft && ./build.sh
   ```

2. **Test locally**
   ```bash
   cargo test
   ```

3. **Deploy to testnet**
   - Get testnet tokens
   - Deploy using cargo-contract or Contracts UI
   - Test minting and mood updates

4. **Integrate with frontend**
   - Update contract address in frontend
   - Test wallet connection with Luno Kit
   - Verify minting flow

5. **Deploy to mainnet**
   - Audit contract code
   - Deploy to Kusama parachain
   - Update production frontend

## Contract Standards

The EchoMint NFT contract follows Polkadot's PSP34 NFT standard with custom extensions:

- **PSP34**: Core NFT functionality (mint, transfer, approve)
- **Metadata**: Extended metadata with mood states and dynamic images
- **Events**: Comprehensive event emission for indexing
- **Cross-chain**: Owner-controlled updates via Hyperbridge

## Testing Strategy

### Unit Tests
```bash
cargo test
```

### Integration Tests
```bash
cargo test --features e2e-tests
```

### Local Testing
```bash
# Start local node
substrate-contracts-node --dev --tmp

# Deploy and interact via Contracts UI
open https://contracts-ui.substrate.io/
```

## Security

- ✅ Owner-only mood updates (via Hyperbridge)
- ✅ Standard NFT approval system
- ✅ No zero-address transfers
- ✅ Event emission for all state changes
- ⚠️ Consider auditing before mainnet deployment

## Gas Optimization

The contract is optimized for gas efficiency:

- Minimal storage reads/writes
- Efficient data structures
- Release build with LTO and size optimization
- WASM binary optimized with `wasm-opt`

## Roadmap

- [x] Basic NFT minting and transfers
- [x] Dynamic mood state updates
- [x] Metadata queries
- [ ] Batch minting
- [ ] Royalty support (PSP34 extension)
- [ ] Pausable functionality
- [ ] Max supply cap
- [ ] Marketplace integration

## Resources

- [ink! Documentation](https://use.ink/)
- [Substrate Contracts](https://docs.substrate.io/tutorials/smart-contracts/)
- [PSP34 Standard](https://github.com/w3f/PSPs/blob/master/PSPs/psp-34.md)
- [Contracts UI](https://contracts-ui.substrate.io/)
- [cargo-contract](https://github.com/paritytech/cargo-contract)

## Support

For contract-related questions:
- Read the [echomint_nft README](./echomint_nft/README.md)
- Check [ink! documentation](https://use.ink/)
- Open an issue on GitHub
