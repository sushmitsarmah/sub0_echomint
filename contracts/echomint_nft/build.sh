#!/bin/bash

# Build script for EchoMint NFT contract

set -e

echo "🔨 Building EchoMint NFT Contract..."

# Check if cargo-contract is installed
if ! command -v cargo-contract &> /dev/null; then
    echo "❌ cargo-contract not found. Installing..."
    cargo install cargo-contract --force
fi

# Build the contract
cargo contract build --release

echo "✅ Build complete!"
echo ""
echo "📦 Artifacts:"
echo "   - WASM: target/ink/echomint_nft.wasm"
echo "   - Contract: target/ink/echomint_nft.contract"
echo "   - Metadata: target/ink/metadata.json"
echo ""
echo "🚀 Ready to deploy to Kusama!"
