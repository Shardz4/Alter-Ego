# Alter-Ego: Universal Market Prediction System

Alter-Ego is a decentralized prediction market platform that allows users to create, trade, and resolve prediction markets for any future event. Built on Ethereum with a modern React frontend, it provides a comprehensive ecosystem for prediction market trading.

## 🏗️ Architecture

### Smart Contracts
- **MarketFactory**: Creates and manages prediction markets
- **Market**: Individual prediction markets with YES/NO tokens
- **UnifiedPool**: Liquidity pool using Constant Product Market Maker (CPMM)
- **OracleModule**: Decentralized oracle system for market resolution
- **Governance**: DAO governance for platform decisions
- **uUSD**: Platform's native stablecoin

### Frontend
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **RainbowKit** for wallet connection
- **Wagmi** for blockchain interactions
- **Viem** for Ethereum utilities

## 🚀 Key Features

### Core Functionality
- ✅ **Market Creation**: Create prediction markets for any binary question
- ✅ **Trading Interface**: Buy/sell YES/NO shares with slippage protection
- ✅ **Oracle Resolution**: Decentralized market resolution system
- ✅ **Governance**: DAO-based platform governance
- ✅ **Liquidity Pool**: Unified liquidity pool for all markets
- ✅ **Portfolio Tracking**: Track positions and earnings

### Advanced Features
- 🔄 **CPMM Pricing**: Constant Product Market Maker for price discovery
- 🛡️ **Security**: Access controls and validation mechanisms
- 📊 **Analytics**: Market data and trading statistics
- 💰 **Fee System**: 2% trading fees for liquidity providers
- 🎯 **Slippage Protection**: Configurable slippage tolerance
- ⏰ **Time-based Resolution**: Automatic market expiration

## 📋 Smart Contract Details

### Market Contract
```solidity
contract Market {
    string public question;
    uint64 public resolveTs;
    address public oracle;
    UnifiedPool public pool;
    
    ERC20 public yesToken;
    ERC20 public noToken;
    
    function buyYes(uint256 uUsdIn, uint256 minYesOut, address to) external;
    function buyNo(uint256 uUsdIn, uint256 minNoOut, address to) external;
    function sellYes(uint256 yesIn, uint256 minUusdOut, address to) external;
    function sellNo(uint256 noIn, uint256 minUusdOut, address to) external;
    function settle(bytes32 result) external;
    function claim(address to) external returns (uint256 uUsdOut);
}
```

### UnifiedPool Contract
```solidity
contract UnifiedPool {
    uUSD public immutable uUsd;
    uint256 public constant FEE_BASIS_POINTS = 200; // 2%
    
    function buyYes(uint256 uUsdIn, uint256 minYesOut, address to) external;
    function buyNo(uint256 uUsdIn, uint256 minNoOut, address to) external;
    function sellYes(uint256 yesIn, uint256 minUusdOut, address to) external;
    function sellNo(uint256 noIn, uint256 minUusdOut, address to) external;
    function getPriceYes() external view returns (uint256 priceRay);
}
```

## 🎨 Frontend Components

### MarketCard
- Real-time market data display
- Interactive trading interface
- Status indicators (Active/Expired/Settled)
- Price and volume information

### TradeForm
- YES/NO prediction selection
- Amount input with slippage protection
- Real-time price updates
- Transaction status tracking

### CreateMarketForm
- Market question input
- Resolution date/time selection
- Validation and guidelines
- Market creation workflow

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Hardhat (for smart contracts)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd PushChain
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install web app dependencies
cd apps/web
npm install

# Install contract dependencies
cd ../../packages/contracts
npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp packages/contracts/.env.example packages/contracts/.env
```

4. **Start development servers**
```bash
# Terminal 1: Start Next.js frontend
cd apps/web
npm run dev

# Terminal 2: Start Hardhat node
cd packages/contracts
npx hardhat node

# Terminal 3: Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

## 🚀 Deployment

### Smart Contracts
```bash
cd packages/contracts

# Deploy to testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Deploy to mainnet
npx hardhat run scripts/deploy.ts --network mainnet
```

### Frontend
```bash
cd apps/web

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart          │    │   Oracle        │
│   (Next.js)     │◄──►│   Contracts      │◄──►│   System        │
│                 │    │   (Solidity)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Wallet        │    │   Liquidity     │    │   Governance    │
│   Connection    │    │   Pool          │    │   (DAO)         │
│   (RainbowKit)  │    │   (UnifiedPool) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Security Features

- **Access Controls**: Role-based permissions for critical functions
- **Input Validation**: Comprehensive parameter validation
- **Slippage Protection**: Configurable slippage tolerance
- **Oracle Security**: Multi-oracle validation system
- **Governance**: Decentralized decision making

## 📈 Performance Optimizations

- **Gas Optimization**: Efficient contract design
- **Batch Operations**: Multiple operations in single transaction
- **Lazy Loading**: On-demand data fetching
- **Caching**: Smart contract data caching
- **Compression**: Optimized frontend assets

## 🧪 Testing

### Smart Contracts
```bash
cd packages/contracts
npx hardhat test
```

### Frontend
```bash
cd apps/web
npm run test
```

## 📝 API Documentation

### Smart Contract Events
- `MarketCreated(address indexed market, string question, uint64 resolveTs)`
- `TradeExecuted(address indexed trader, bool isYes, uint256 amount, uint256 shares)`
- `MarketSettled(bytes32 result)`
- `Claimed(address indexed user, uint256 amount)`

### Frontend Hooks
- `useMarketInfo(marketAddress)` - Get market details
- `usePriceData(marketAddress)` - Get current prices
- `useUserPositions(address)` - Get user positions
- `useTradingHistory(address)` - Get trading history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: [docs.pushchain.com](https://docs.pushchain.com)
- Discord: [discord.gg/pushchain](https://discord.gg/pushchain)
- Twitter: [@PushChain](https://twitter.com/pushchain)

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core prediction market functionality
- ✅ Basic trading interface
- ✅ Oracle system
- ✅ Governance framework

### Phase 2 (Q2 2024)
- 🔄 Advanced analytics dashboard
- 🔄 Mobile application
- 🔄 Cross-chain support
- 🔄 API marketplace

### Phase 3 (Q3 2024)
- 🔄 AI-powered market insights
- 🔄 Social trading features
- 🔄 Institutional tools
- 🔄 Advanced derivatives

---

**Alter-Ego** - Predicting the future, one market at a time. 🚀
