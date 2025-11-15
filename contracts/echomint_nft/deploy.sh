#!/bin/bash

# Deployment script for EchoMint NFT Contract

set -e

echo "🚀 EchoMint NFT Contract Deployment"
echo ""

# Check if contract is built
if [ ! -f "target/ink/echomint_nft.contract" ]; then
    echo "❌ Contract not built. Running build first..."
    ./build.sh
    echo ""
fi

# Deployment options
echo "Select deployment target:"
echo "1) Local node (ws://127.0.0.1:9944)"
echo "2) Rococo Contracts (testnet)"
echo "3) Custom RPC endpoint"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        RPC_URL="ws://127.0.0.1:9944"
        echo "📍 Deploying to: Local node"
        ;;
    2)
        RPC_URL="wss://rococo-contracts-rpc.polkadot.io"
        echo "📍 Deploying to: Rococo Contracts (testnet)"
        ;;
    3)
        read -p "Enter RPC URL: " RPC_URL
        echo "📍 Deploying to: $RPC_URL"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
read -p "Enter signer account (e.g., //Alice or seed phrase): " SURI

echo ""
echo "🔐 Signer: $SURI"
echo "🌐 RPC: $RPC_URL"
echo ""
read -p "Proceed with deployment? [y/N]: " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "📤 Deploying contract..."
echo ""

# Deploy contract
cargo contract instantiate \
    --constructor new \
    --suri "$SURI" \
    --url "$RPC_URL" \
    --skip-confirm

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Note the contract address from above"
echo "   2. Update frontend with contract address"
echo "   3. Test minting via frontend or CLI"
echo ""
