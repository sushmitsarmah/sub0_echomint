#!/bin/bash

# EchoMint Arkiv Indexer Startup Script

set -e

echo "🚀 EchoMint Arkiv Indexer"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  Please edit .env with your configuration:"
    echo "   - KUSAMA_CONTRACT_ADDRESS"
    echo "   - SIGNER_ACCOUNT"
    echo "   - HYPERBRIDGE_RELAYER_URL"
    echo ""
    read -p "Press Enter after configuring .env..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "🔨 Building TypeScript..."
    npm run build
    echo ""
fi

# Ask how to run
echo "Select run mode:"
echo "1) Development (with hot reload)"
echo "2) Production (built code)"
echo "3) PM2 (background daemon)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "🔥 Starting in development mode..."
        npm run dev
        ;;
    2)
        echo ""
        echo "🚀 Starting in production mode..."
        npm start
        ;;
    3)
        if ! command -v pm2 &> /dev/null; then
            echo "❌ PM2 not installed"
            read -p "Install PM2 globally? [y/N]: " install_pm2
            if [[ $install_pm2 =~ ^[Yy]$ ]]; then
                npm install -g pm2
            else
                echo "❌ Cannot start with PM2"
                exit 1
            fi
        fi

        echo ""
        echo "🔄 Starting with PM2..."
        pm2 start dist/index.js --name echomint-indexer
        echo ""
        echo "✅ Indexer started in background"
        echo ""
        echo "Useful PM2 commands:"
        echo "   pm2 logs echomint-indexer    # View logs"
        echo "   pm2 restart echomint-indexer # Restart"
        echo "   pm2 stop echomint-indexer    # Stop"
        echo "   pm2 delete echomint-indexer  # Remove"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
