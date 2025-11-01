#!/bin/bash

# SenzTrade Perception Market Deployment Script
# This script deploys the perception_market module to Aptos

echo "🚀 SenzTrade Perception Market Deployment"
echo "=========================================="

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI not found. Please install it first:"
    echo "   https://aptos.dev/tools/aptos-cli/install-cli/"
    exit 1
fi

# Set network (default to testnet)
NETWORK=${1:-testnet}
echo "📡 Network: $NETWORK"

# Compile the Move module
echo ""
echo "📦 Compiling Move module..."
aptos move compile --named-addresses senztrade=default

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Compilation successful"

# Publish the module
echo ""
echo "🌐 Publishing to $NETWORK..."
aptos move publish \
    --named-addresses senztrade=default \
    --network $NETWORK \
    --assume-yes

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the deployed module address"
echo "2. Update NEXT_PUBLIC_MOVE_MODULE_ADDRESS in apps/web/.env.local"
echo "3. Initialize the market registry by calling initialize()"
echo ""
echo "🎉 Happy trading!"

