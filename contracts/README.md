# EchoMint NFT Smart Contract

ink! smart contract for minting and managing living NFTs on Kusama that evolve with market sentiment.

## Features

- ✅ Mint NFTs linked to crypto assets (SOL, DOT, BTC)
- ✅ Dynamic mood states (Bullish, Bearish, Neutral, Volatile, Positive, Negative)
- ✅ Update mood via Hyperbridge (cross-chain oracle)
- ✅ Update AI-generated images
- ✅ Full NFT transfer and approval functionality
- ✅ Query token metadata on-chain
- ✅ Event emission for indexing

## Prerequisites

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Add WebAssembly Target

```bash
rustup target add wasm32-unknown-unknown
rustup component add rust-src
```

### 3. Install cargo-contract

```bash
cargo install cargo-contract --force
```

Verify installation:
```bash
cargo contract --version
```

### 4. Install Substrate Contracts Node (for local testing)

```bash
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --force
```

## Building the Contract

### Option 1: Using the build script

```bash
./build.sh
```

### Option 2: Manual build

```bash
cargo contract build --release
```

This will generate three files in `target/ink/`:
- `echomint_nft.wasm` - The contract bytecode
- `echomint_nft.contract` - Bundle with metadata
- `metadata.json` - Contract ABI

## Testing

Run unit tests:

```bash
cargo test
```

Run integration tests:

```bash
cargo test --features e2e-tests
```

## Local Deployment

### 1. Start a local Substrate node

```bash
substrate-contracts-node --dev --tmp
```

### 2. Deploy via Contracts UI

1. Go to [Contracts UI](https://contracts-ui.substrate.io/)
2. Connect to local node (ws://127.0.0.1:9944)
3. Click "Add New Contract"
4. Upload `target/ink/echomint_nft.contract`
5. Click "Deploy"
6. Instantiate the contract

## Testnet Deployment (Paseo AssetHub) - RECOMMENDED

### Why Paseo?

Paseo AssetHub is a Polkadot testnet parachain that:
- ✅ Supports smart contracts (ink!)
- ✅ Has asset and NFT functionality
- ✅ Mirrors production environment (safe for testing)
- ✅ Has a faucet for free testnet tokens

### Deploy to Paseo AssetHub

#### Option 1: Using the deployment script (Easiest)

```bash
./deploy.sh
# Select option 2 (Paseo AssetHub)
```

#### Option 2: Using cargo-contract CLI

```bash
# 1. Get PAS testnet tokens
# Visit: https://faucet.polkadot.io/paseo

# 2. Deploy contract
cargo contract instantiate \
  --constructor new \
  --suri "your seed phrase here" \
  --url wss://paseo-asset-hub-rpc.polkadot.io \
  --skip-confirm

# 3. Note the contract address from output
```

#### Option 3: Using Contracts UI

1. Go to [Contracts UI](https://contracts-ui.substrate.io/)
2. Add custom endpoint: `wss://paseo-asset-hub-rpc.polkadot.io`
3. Upload `target/ink/echomint_nft.contract`
4. Deploy and instantiate

### Verify Deployment

Check your contract on Paseo AssetHub explorer:
- **Explorer**: https://assethub-paseo.subscan.io
- Search for your contract address

## Alternative Testnets

### Deploy to Rococo Contracts

If Paseo is unavailable, use Rococo Contracts:

```bash
# Get ROC tokens from faucet
# https://paritytech.github.io/polkadot-testnet-faucet/

cargo contract instantiate \
  --constructor new \
  --suri "your seed phrase here" \
  --url wss://rococo-contracts-rpc.polkadot.io
```

## Production Deployment (Kusama)

⚠️ **IMPORTANT**: Test thoroughly on Paseo before deploying to Kusama mainnet.

Kusama is a production network with real economic value. Only deploy after:
- [ ] Complete testing on Paseo AssetHub
- [ ] Security audit completed
- [ ] Frontend integration tested
- [ ] Gas costs analyzed
- [ ] Emergency procedures documented

```bash
# Deploy to Kusama (use with caution)
cargo contract instantiate \
  --constructor new \
  --suri "your seed phrase here" \
  --url wss://kusama-rpc.polkadot.io
```

## Contract Interaction

### Minting an NFT

```bash
cargo contract call \
  --contract <CONTRACT_ADDRESS> \
  --message mint \
  --args <TO_ADDRESS> "SOL" Bullish \
  --suri //Alice
```

### Updating Mood State

```bash
cargo contract call \
  --contract <CONTRACT_ADDRESS> \
  --message update_mood \
  --args <TOKEN_ID> Bearish \
  --suri //Alice
```

### Query Token Metadata

```bash
cargo contract call \
  --contract <CONTRACT_ADDRESS> \
  --message get_metadata \
  --args <TOKEN_ID> \
  --dry-run
```

### Transfer NFT

```bash
cargo contract call \
  --contract <CONTRACT_ADDRESS> \
  --message transfer \
  --args <TO_ADDRESS> <TOKEN_ID> \
  --suri //Alice
```

## Integration with Frontend

### Using Dedot (Polkadot.js alternative)

The frontend already uses `dedot` for Polkadot interaction. Example integration:

```typescript
import { DedotClient, WsProvider } from 'dedot';

// Connect to contract
const provider = new WsProvider('wss://rococo-contracts-rpc.polkadot.io');
const client = await DedotClient.new(provider);

// Load contract
const contract = new ContractPromise(
  client,
  metadata, // from metadata.json
  contractAddress
);

// Mint NFT
await contract.tx.mint(
  { gasLimit, storageDepositLimit: null },
  recipientAddress,
  "SOL",
  "Bullish"
).signAndSend(signer);

// Query metadata
const { output } = await contract.query.getMetadata(
  senderAddress,
  { gasLimit: -1 },
  tokenId
);
```

### Using Luno Kit

Since you're using Luno Kit for wallet connections, you can use it with contracts:

```typescript
import { useWallet } from '@luno-kit/react';

function MintNFT() {
  const { selectedAccount, injector } = useWallet();

  const mintNFT = async (coin: string) => {
    if (!selectedAccount || !injector) return;

    const contract = new ContractPromise(api, metadata, contractAddress);

    await contract.tx
      .mint({ gasLimit }, selectedAccount.address, coin, "Bullish")
      .signAndSend(selectedAccount.address, { signer: injector.signer });
  };

  return <button onClick={() => mintNFT("SOL")}>Mint SOL NFT</button>;
}
```

## Contract Architecture

### Storage

- `total_supply`: Counter for minted NFTs
- `token_owners`: Mapping of token ID → owner address
- `token_metadata`: Mapping of token ID → NFT metadata (name, coin, mood, image URL)
- `owned_tokens`: Mapping of (owner, index) → token ID
- `owner`: Contract owner (for mood updates via Hyperbridge)

### Key Functions

#### Minting
- `mint(to, coin, initial_mood)` - Mint a new NFT

#### Mood Updates
- `update_mood(token_id, new_mood)` - Update mood state (owner only)
- `update_image(token_id, new_image_url)` - Update AI-generated image (owner only)

#### NFT Standard
- `transfer(to, token_id)` - Transfer NFT
- `approve(to, token_id)` - Approve address for token
- `set_approval_for_all(operator, approved)` - Set operator approval
- `balance_of(owner)` - Get token count for owner
- `owner_of(token_id)` - Get owner of token
- `tokens_of_owner(owner)` - Get all tokens owned by address

#### Queries
- `get_metadata(token_id)` - Get full NFT metadata
- `total_supply()` - Get total minted NFTs

### Mood States

The contract supports 6 mood states:

1. **Bullish** - Strong upward price movement
2. **Bearish** - Downward trend
3. **Neutral** - Stable market
4. **Volatile** - High price swings
5. **PositiveSentiment** - Community optimism
6. **NegativeSentiment** - Community fear

## Hyperbridge Integration

The contract owner can update mood states via Hyperbridge messages:

1. Arkiv indexes market data
2. Analytics determine mood state
3. Hyperbridge sends cross-chain message to Kusama
4. Contract owner calls `update_mood()` with new state
5. NFT metadata updates on-chain
6. AI generates new image based on mood
7. Contract owner calls `update_image()` with IPFS URL

## Events

The contract emits the following events for indexing:

- `Transfer { from, to, token_id }` - NFT transferred or minted
- `Approval { owner, approved, token_id }` - Token approval granted
- `ApprovalForAll { owner, operator, approved }` - Operator approval set
- `Minted { token_id, owner, coin }` - New NFT minted
- `MoodUpdated { token_id, new_mood }` - Mood state changed

## Security Considerations

- ✅ Only contract owner can update moods (via Hyperbridge)
- ✅ Transfer checks ownership and approvals
- ✅ No zero-address transfers
- ✅ Events for all state changes
- ⚠️ Consider adding pausable functionality for emergencies
- ⚠️ Consider adding max supply cap
- ⚠️ Consider adding royalty support (PSP34 extension)

## Troubleshooting

### Build errors

```bash
# Update Rust
rustup update

# Clean build
cargo clean
cargo contract build --release
```

### Gas limit exceeded

Increase gas limit in contract calls or optimize contract code.

### Storage deposit issues

Ensure sufficient balance to cover storage deposits when minting.

## Resources

- [ink! Documentation](https://use.ink/)
- [Substrate Contracts Workshop](https://docs.substrate.io/tutorials/smart-contracts/)
- [Polkadot.js API](https://polkadot.js.org/docs/)
- [Contracts UI](https://contracts-ui.substrate.io/)
- [Dedot Documentation](https://github.com/dedotdev/dedot)

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Join Polkadot community channels
