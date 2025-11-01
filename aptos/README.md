# SenzTrade Perception Market - Aptos Smart Contracts

This directory contains the Move smart contracts for SenzTrade's Perception Market platform on Aptos blockchain.

## 📋 Overview

The **Perception Market** is a unique prediction market that not only captures users' predictions (YES/NO) but also their **perception** of how many others will agree with them. This creates a meta-layer of prediction that makes markets more engaging and insightful.

## 🏗️ Architecture

### Core Module: `perception_market.move`

The main smart contract includes:

- **Market Creation**: Create prediction markets with questions and resolution timestamps
- **Trading with Perception**: Buy YES/NO shares while recording agreement percentage (0-100%)
- **Market Settlement**: Admin-controlled resolution of markets
- **View Functions**: Query market data, prices, and user positions

### Key Features

1. **Perception Tracking**: Every trade records the user's prediction of what percentage of people will agree with them
2. **Event Emission**: All major actions emit events for off-chain indexing
3. **Simple Pricing**: Currently uses 1:1 ratio (can be enhanced with CPMM)
4. **User Positions**: Tracks individual user holdings and their perception data

## 📦 Installation

### Prerequisites

1. **Install Aptos CLI**:
   ```bash
   # macOS/Linux
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   
   # Windows (PowerShell)
   iwr "https://aptos.dev/scripts/install_cli.py" -useb | Select-Object -ExpandProperty Content | python3
   ```

2. **Verify Installation**:
   ```bash
   aptos --version
   ```

3. **Initialize Aptos Account** (if you don't have one):
   ```bash
   aptos init
   ```
   - Choose network: `testnet` or `mainnet`
   - This creates `~/.aptos/config.yaml` with your account details

## 🚀 Deployment

### Step 1: Compile the Module

```bash
cd aptos
aptos move compile --named-addresses senztrade=default
```

### Step 2: Deploy to Testnet

```bash
aptos move publish \
  --named-addresses senztrade=default \
  --network testnet \
  --assume-yes
```

Or use the deployment script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh testnet
```

### Step 3: Note the Module Address

After deployment, you'll see output like:
```
{
  "Result": {
    "transaction_hash": "0x...",
    "gas_used": 1234,
    "success": true
  }
}
```

Your module address is your account address from `~/.aptos/config.yaml`.

### Step 4: Initialize the Registry

After deployment, you need to initialize the market registry **once**:

```bash
aptos move run \
  --function-id 'YOUR_ADDRESS::perception_market::initialize' \
  --assume-yes
```

Replace `YOUR_ADDRESS` with your deployed module address.

## ⚙️ Configuration

### Update Frontend Environment Variables

In `apps/web/.env.local`, add:

```env
NEXT_PUBLIC_MOVE_MODULE_ADDRESS=0xYOUR_MODULE_ADDRESS_HERE
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com
```

## 📚 Smart Contract Functions

### Entry Functions (User-Callable)

#### `initialize(admin: &signer)`
- **Description**: Initialize the market registry (call once after deployment)
- **Caller**: Admin/deployer only
- **Parameters**: None

#### `create_market(creator: &signer, question: String, resolve_ts: u64)`
- **Description**: Create a new prediction market
- **Parameters**:
  - `question`: The market question (e.g., "Will Bitcoin reach $100k by 2025?")
  - `resolve_ts`: Unix timestamp when market can be resolved

#### `buy_yes(user: &signer, market_id: u64, amount: u64, agreement_percentage: u8)`
- **Description**: Buy YES shares with perception data
- **Parameters**:
  - `market_id`: ID of the market
  - `amount`: Amount to invest
  - `agreement_percentage`: 0-100, user's prediction of agreement

#### `buy_no(user: &signer, market_id: u64, amount: u64, agreement_percentage: u8)`
- **Description**: Buy NO shares with perception data
- **Parameters**: Same as `buy_yes`

#### `settle_market(admin: &signer, market_id: u64, result: bool)`
- **Description**: Settle a market (admin only)
- **Parameters**:
  - `market_id`: ID of the market to settle
  - `result`: `true` if YES wins, `false` if NO wins

### View Functions (Read-Only)

#### `get_market(market_id: u64)`
- **Returns**: Market details (question, creator, timestamps, shares, settlement status)

#### `get_markets_count()`
- **Returns**: Total number of markets created

#### `get_user_position(user: address, market_id: u64)`
- **Returns**: User's position (YES/NO shares, costs, agreement percentage)

#### `get_market_price(market_id: u64)`
- **Returns**: Current YES price as percentage (0-100)

## 🧪 Testing

### Run Move Unit Tests

```bash
aptos move test
```

### Manual Testing on Testnet

1. **Create a Market**:
   ```bash
   aptos move run \
     --function-id 'YOUR_ADDRESS::perception_market::create_market' \
     --args string:"Will AI surpass human intelligence by 2030?" u64:1735689600 \
     --assume-yes
   ```

2. **Buy YES Shares**:
   ```bash
   aptos move run \
     --function-id 'YOUR_ADDRESS::perception_market::buy_yes' \
     --args u64:0 u64:100 u8:75 \
     --assume-yes
   ```
   (Market ID 0, 100 units, 75% agreement)

3. **Query Market**:
   ```bash
   aptos move view \
     --function-id 'YOUR_ADDRESS::perception_market::get_market' \
     --args u64:0
   ```

## 📊 Data Structures

### Market
```move
struct Market {
    id: u64,
    question: String,
    creator: address,
    resolve_ts: u64,
    total_yes_shares: u64,
    total_no_shares: u64,
    total_yes_volume: u64,
    total_no_volume: u64,
    settled: bool,
    result: bool,
    created_at: u64,
}
```

### Position
```move
struct Position {
    market_id: u64,
    user: address,
    yes_shares: u64,
    no_shares: u64,
    yes_cost: u64,
    no_cost: u64,
    agreement_percentage: u8,  // The perception data!
    prediction_side: bool,
}
```

## 🔄 Integration with Frontend

The frontend uses the TypeScript SDK wrapper in `apps/web/src/lib/aptosClient.ts`:

```typescript
import { buyYesPayload, getMarket, getAllMarkets } from '@/lib/aptosClient'

// Fetch markets
const markets = await getAllMarkets()

// Create trade transaction
const payload = buyYesPayload(marketId, amount, agreementPercentage)
await signAndSubmitTransaction({ type: 'entry_function_payload', ...payload })
```

## 🛠️ Future Enhancements

- [ ] Implement CPMM (Constant Product Market Maker) pricing
- [ ] Add liquidity pools
- [ ] Implement claim winnings function
- [ ] Add perception-based rewards (reward users whose perception matches reality)
- [ ] Multi-outcome markets (beyond binary YES/NO)
- [ ] Market categories and tags
- [ ] Reputation system based on prediction accuracy

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR.

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Contact: [Your contact info]

---

**Built with ❤️ for the Aptos ecosystem**

