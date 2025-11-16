#!/bin/bash

# Deployment script for EchoMint NFT Contract

set -e

# Load environment variables if .env exists
ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
    echo "📁 Loading configuration from .env..."
    source "$ENV_FILE"
    echo "✅ Configuration loaded"
    echo ""
fi

echo "🚀 EchoMint NFT Contract Deployment"
echo ""

# Check if contract is built
if [ ! -f "target/ink/echomint_nft.contract" ]; then
    echo "❌ Contract not built. Running build first..."
    ./build.sh
    echo ""
fi

# Check if network is preset from .env
if [ -n "$DEPLOYMENT_NETWORK" ]; then
    echo "📍 Using network from .env: $DEPLOYMENT_NETWORK"
    case $DEPLOYMENT_NETWORK in
        local)
            RPC_URL="ws://127.0.0.1:9944"
            echo "   Deploying to: Local node"
            ;;
        passet)
            RPC_URL="wss://testnet-passet-hub.polkadot.io"
            echo "   Deploying to: Passet Hub (Paseo Parachain 1111)"
            ;;
        rococo)
            RPC_URL="wss://rococo-contracts-rpc.polkadot.io"
            echo "   Deploying to: Rococo Contracts"
            ;;
        kusama)
            RPC_URL="wss://kusama-rpc.polkadot.io"
            echo "   Deploying to: Kusama (PRODUCTION)"
            ;;
        *)
            echo "❌ Invalid network: $DEPLOYMENT_NETWORK"
            exit 1
            ;;
    esac
else
    # Deployment options
    echo "Select deployment target:"
    echo "1) Local node (ws://127.0.0.1:9944)"
    echo "2) Passet Hub (testnet - RECOMMENDED for Sub0 Hackathon)"
    echo "3) Rococo Contracts (testnet)"
    echo "4) Custom RPC endpoint"
    read -p "Enter choice [1-4]: " choice

    case $choice in
        1)
            RPC_URL="ws://127.0.0.1:9944"
            echo "📍 Deploying to: Local node"
            ;;
        2)
            RPC_URL="wss://testnet-passet-hub.polkadot.io"
            echo "📍 Deploying to: Passet Hub (Paseo Parachain 1111)"
            echo "ℹ️  Passet Hub is the official ink! v6 testnet for Paseo"
            echo "ℹ️  Get tokens: https://faucet.polkadot.io/?parachain=1111"
            ;;
        3)
            RPC_URL="wss://rococo-contracts-rpc.polkadot.io"
            echo "📍 Deploying to: Rococo Contracts (testnet)"
            ;;
        4)
            read -p "Enter RPC URL: " RPC_URL
            echo "📍 Deploying to: $RPC_URL"
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
fi

echo ""

# Check if seed phrase is already set from .env
if [ -n "$DEPLOYMENT_SEED_PHRASE" ]; then
    SURI="$DEPLOYMENT_SEED_PHRASE"
    echo "🔐 Using seed phrase from .env"
else
    read -p "Enter signer account (e.g., //Alice or seed phrase): " SURI
fi

echo ""
echo "🔐 Signer: ${SURI:0:20}..." # Show only first 20 chars for security
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
