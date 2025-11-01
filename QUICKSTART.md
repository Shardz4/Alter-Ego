# SenzTrade Perception Market - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you deploy and test the Perception Market smart contracts on Aptos testnet.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Terminal/Command line access

## Step 1: Install Aptos CLI (2 minutes)

### macOS/Linux
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### Windows (PowerShell as Administrator)
```powershell
iwr "https://aptos.dev/scripts/install_cli.py" -useb | Select-Object -ExpandProperty Content | python3
```

### Verify Installation
```bash
aptos --version
# Should output: aptos 2.x.x
```

## Step 2: Initialize Aptos Account (1 minute)

```bash
aptos init
```

**Prompts:**
1. Choose network: Enter `testnet`
2. Private key: Press Enter (generates new key)
3. Confirm: Type `yes`

**Save these details:**
- Your account address (starts with `0x...`)
- Location: `~/.aptos/config.yaml`

## Step 3: Fund Your Account (30 seconds)

```bash
aptos account fund-with-faucet --account default
```

This gives you test APT tokens for deployment.

## Step 4: Deploy Smart Contract (1 minute)

```bash
cd aptos
aptos move publish --named-addresses senztrade=default --network testnet --assume-yes
```

**Expected output:**
```json
{
  "Result": {
    "transaction_hash": "0x...",
    "success": true
  }
}
```

## Step 5: Initialize Market Registry (30 seconds)

Replace `YOUR_ADDRESS` with your account address from Step 2:

```bash
aptos move run \
  --function-id 'YOUR_ADDRESS::perception_market::initialize' \
  --assume-yes
```

**Example:**
```bash
aptos move run \
  --function-id '0x1234...::perception_market::initialize' \
  --assume-yes
```

## Step 6: Configure Frontend (1 minute)

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_MOVE_MODULE_ADDRESS=0xYOUR_ADDRESS_HERE
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com
```

Replace `0xYOUR_ADDRESS_HERE` with your address from Step 2.

## Step 7: Start Development Server (30 seconds)

```bash
cd apps/web
npm install  # If not already done
npm run dev
```

Open http://localhost:3002

## 🎉 You're Done!

Your Perception Market is now live on Aptos testnet!

## 🧪 Test the Full Flow

### 1. Connect Wallet
- Click "Account" in top right
- Click "Sign in with Google"
- Click "Connect Wallet"
- Choose Petra or another Aptos wallet

### 2. Create a Test Market (Optional)

```bash
aptos move run \
  --function-id 'YOUR_ADDRESS::perception_market::create_market' \
  --args string:"Will AI surpass human intelligence by 2030?" u64:1735689600 \
  --assume-yes
```

### 3. Trade on a Market

1. Go to http://localhost:3002
2. Click **YES** or **NO** on any market card
3. Adjust the slider: "How much % will agree with you?"
4. Click **Confirm Trade**
5. Enter amount (e.g., 100)
6. Click **Execute Trade**
7. Approve in your wallet

### 4. Verify Trade On-Chain

```bash
aptos move view \
  --function-id 'YOUR_ADDRESS::perception_market::get_user_position' \
  --args address:YOUR_ADDRESS u64:0
```

This shows your position in market 0, including your agreement percentage!

## 📊 Query Market Data

### Get Market Details
```bash
aptos move view \
  --function-id 'YOUR_ADDRESS::perception_market::get_market' \
  --args u64:0
```

### Get Total Markets
```bash
aptos move view \
  --function-id 'YOUR_ADDRESS::perception_market::get_markets_count'
```

### Get Market Price
```bash
aptos move view \
  --function-id 'YOUR_ADDRESS::perception_market::get_market_price' \
  --args u64:0
```

## 🔧 Troubleshooting

### Error: "Module not found"
- Make sure you ran `initialize` after deployment
- Check that `NEXT_PUBLIC_MOVE_MODULE_ADDRESS` is set correctly

### Error: "Insufficient balance"
- Run: `aptos account fund-with-faucet --account default`

### Error: "Transaction failed"
- Check that market hasn't expired
- Ensure you're connected to the correct network (testnet)

### Frontend not loading markets
- Check browser console for errors
- Verify `.env.local` has correct module address
- Restart dev server: `npm run dev`

## 📚 Next Steps

### Learn More
- Read `aptos/README.md` for detailed documentation
- Read `PERCEPTION_MARKET_IMPLEMENTATION.md` for architecture details

### Customize
- Edit market questions in `apps/web/src/app/page.tsx`
- Modify UI styling in component files
- Add more features to the smart contract

### Deploy to Mainnet
1. Change network to `mainnet` in `aptos init`
2. Fund account with real APT
3. Deploy: `aptos move publish --named-addresses senztrade=default --network mainnet --assume-yes`
4. Update `.env.local` with mainnet node URL

## 🎯 Key Concepts

### Perception Market
Unlike traditional prediction markets, users predict:
1. **The outcome** (YES/NO)
2. **How many will agree** (0-100%)

This creates a meta-layer of prediction!

### Market Lifecycle
1. **Created** → Users can trade
2. **Expired** → No more trades (after resolve_ts)
3. **Settled** → Admin resolves with final result
4. **Claimed** → Users claim winnings (coming soon)

### Data Stored On-Chain
Every trade records:
- YES/NO shares purchased
- Cost basis
- **Agreement percentage** (the perception!)
- Timestamp

## 💡 Tips

1. **Test with small amounts** first
2. **Check transaction status** in Aptos Explorer: https://explorer.aptoslabs.com/
3. **Use testnet** for development
4. **Back up your private key** from `~/.aptos/config.yaml`

## 🆘 Need Help?

- Check `aptos/README.md` for detailed docs
- View smart contract: `aptos/sources/perception_market.move`
- Check frontend integration: `apps/web/src/lib/aptosClient.ts`

## ✅ Checklist

- [ ] Aptos CLI installed
- [ ] Account initialized and funded
- [ ] Smart contract deployed
- [ ] Market registry initialized
- [ ] Frontend configured with module address
- [ ] Dev server running
- [ ] Wallet connected
- [ ] Test trade executed successfully

## 🎊 Success!

You now have a fully functional Perception Market running on Aptos!

**Share your markets and let users predict not just outcomes, but perceptions!**

---

**Time to Complete**: ~5 minutes  
**Difficulty**: Beginner-friendly  
**Cost**: Free (testnet)  

Happy trading! 🚀

