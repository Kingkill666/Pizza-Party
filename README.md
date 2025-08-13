# 🍕 Pizza Party dApp

A decentralized gaming platform on Base network where players compete for daily and weekly jackpots using VMF tokens. Features Chainlink VRF for secure randomness, referral system, toppings rewards, Farcaster native sharing, and multi-platform wallet support.

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Kingkill666/pizza-party-dapp.git
cd pizza-party-dapp

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🎯 New Features

### 📤 Farcaster Native Sharing
**NEW!** Pizza Party now features **native Farcaster sharing** allowing users to easily share their game experiences, wins, and referral codes directly to Farcaster.

📖 **[Read the Farcaster Integration Documentation](FARCASTER_INTEGRATION.md)** for detailed technical information.

#### Key Features:
- ✅ **Native Farcaster Integration** - Direct sharing to Farcaster platform
- ✅ **Multiple Share Templates** - Game entry, wins, referrals, jackpots
- ✅ **Dynamic Content** - Real-time game data in shares
- ✅ **Fallback Support** - Clipboard copy for non-Farcaster users
- ✅ **Social Growth** - Viral sharing for organic community building

### 🔗 Chainlink VRF Integration
**NEW!** Pizza Party now uses **Chainlink VRF v2.5** for provably fair and secure random winner selection.

📖 **[Read the Chainlink VRF Documentation](CHAINLINK_VRF_INTEGRATION.md)** for detailed technical information.

#### Key Features:
- ✅ **Provably Fair Randomness** - Chainlink VRF v2.5 integration
- ✅ **Automated Winner Selection** - Daily and weekly draws at 12pm PST
- ✅ **Subscription Method** - Cost-effective VRF usage
- ✅ **On-chain Verification** - All randomness verifiable on BaseScan
- ✅ **No Manual Intervention** - Fully automated system

### 💰 Dynamic Pricing System
Pizza Party features **dynamic VMF pricing** ensuring a consistent $1 USD entry fee regardless of VMF token price fluctuations.

📖 **[Read the Dynamic Pricing Documentation](DYNAMIC_PRICING_README.md)** for detailed technical information.

#### Key Features:
- ✅ **Always $1 USD** - Entry fee adjusts automatically with VMF price
- ✅ **Real-time Pricing** - Uses price oracle for current market rates
- ✅ **Fair Gameplay** - No advantage based on token price volatility
- ✅ **Transparent** - All pricing calculations visible on-chain

## 🎮 Game Overview

### Daily Game
- **Entry Fee**: $1 worth of VMF tokens (dynamic pricing)
- **Jackpot**: 100% of daily entry fees
- **Winners**: 8 random daily winners (Chainlink VRF)
- **Frequency**: One entry per wallet per day
- **Deadline**: Daily at 12pm PST
- **Automation**: Fully automated winner selection and payout

### Weekly Jackpot
- **Prize Pool**: Total toppings claimed × 1 VMF per topping
- **Funding**: Automatically calculated from on-chain data
- **Winners**: 10 random weekly winners (Chainlink VRF)
- **Deadline**: Monday 12pm PST
- **Automation**: Fully automated winner selection and payout

### Topping System
- **Daily Play**: 1 topping per game entry
- **Referrals**: 2 toppings per successful referral (max 3 referrals)
- **VMF Holdings**: 3 toppings per 10 VMF held (checked daily)
- **Weekly Jackpot**: Total toppings × 1 VMF per topping

## 🏆 Jackpot Winner Selection & Payout System

### Daily Jackpot Winners
- **Selection**: 8 random winners selected using Chainlink VRF
- **Randomness**: Provably fair randomness from Chainlink VRF v2.5
- **Payout**: Automatic VMF token distribution to winners' wallets
- **Timing**: Daily at 12pm PST when game ends
- **Process**: Fully automated - no manual intervention required

### Weekly Jackpot Winners  
- **Selection**: 10 random winners selected using Chainlink VRF
- **Randomness**: Provably fair randomness from Chainlink VRF v2.5
- **Payout**: Automatic VMF token distribution to winners' wallets
- **Timing**: Weekly on Monday at 12pm PST
- **Process**: Fully automated - no manual intervention required

### Chainlink VRF Integration
1. **Secure Randomness**: Uses Chainlink VRF v2.5 for provably fair randomness
2. **Subscription Method**: Cost-effective VRF usage with subscription model
3. **Automated Triggers**: Daily and weekly draws automatically triggered
4. **On-chain Verification**: All randomness verifiable on BaseScan
5. **No Manipulation**: Impossible to predict or influence results

### Automatic Payout System
1. **Game End Detection**: System automatically detects when daily/weekly games end
2. **VRF Request**: Chainlink VRF requested for random number generation
3. **Winner Selection**: Winners selected using VRF randomness
4. **Prize Calculation**: Total jackpot divided equally among winners
5. **Automatic Transfer**: VMF tokens sent directly to winners' wallets
6. **Transaction Verification**: All transfers verified on-chain
7. **New Game Start**: New game automatically starts after payout

### Payout Example
- **Daily Jackpot**: 100 players × $1 VMF = 100 VMF total
- **Prize per Winner**: 100 VMF ÷ 8 winners = 12.5 VMF each
- **Automatic Transfer**: Each winner receives 12.5 VMF tokens directly to their wallet

### Security Features
- ✅ **Chainlink VRF** - Provably fair randomness
- ✅ **No Manual Intervention** - Fully automated system
- ✅ **On-chain Verification** - All payouts verified on blockchain
- ✅ **Equal Distribution** - Fair prize distribution among winners
- ✅ **Immediate Payout** - Winners receive prizes instantly when game ends

## 🔧 Technical Architecture

### Smart Contract Architecture
- **PizzaPartyCore.sol** - Main game contract with VRF integration
- **ChainlinkVRF.sol** - VRF coordinator and winner selection
- **PizzaPartyFeeAbstraction.sol** - Gasless transaction support
- **Modular Design** - Separated concerns for maintainability

### Smart Contract Security
- **ReentrancyGuard**: Prevents reentrancy attacks on all payable functions
- **Ownable**: Access control for admin functions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Sanitized inputs with length and format checks
- **Rate Limiting**: Cooldown periods to prevent abuse
- **Gas Optimization**: Batch processing for efficient operations
- **Chainlink VRF**: Provably fair randomness

### Prize Distribution Logic
```solidity
// Daily jackpot distribution with VRF
function processDailyWinners(uint256[] memory randomWords) external {
    address[] memory winners = _selectWinners(DAILY_WINNERS_COUNT, randomWords);
    uint256 prizePerWinner = currentDailyJackpot / DAILY_WINNERS_COUNT;
    
    // Automatic VMF token transfer to winners
    for (uint256 i = 0; i < winners.length; i++) {
        IERC20(vmfToken).transfer(winners[i], prizePerWinner);
    }
}
```

### Event Tracking System
The contract emits comprehensive events for monitoring:
- `PlayerEntered`: When players enter the game
- `DailyWinnersSelected`: When daily winners are chosen
- `WeeklyWinnersSelected`: When weekly winners are chosen
- `JackpotUpdated`: When jackpot amounts change
- `ToppingsAwarded`: When players earn toppings
- `RandomnessRequested`: When VRF is requested
- `WinnersSelected`: When VRF completes winner selection

### Farcaster Sharing Integration
- **Native Farcaster API** - Direct integration with Farcaster platform
- **Multiple Share Templates** - Game entry, wins, referrals, jackpots
- **Dynamic Content** - Real-time game data in shares
- **Fallback Support** - Clipboard copy for non-Farcaster users
- **React Hooks** - Easy integration with React components

### Wallet Integration
- **Multi-Wallet Support**: MetaMask, Coinbase, Trust, Rainbow, Phantom
- **Mobile Optimization**: Automatic mobile browser detection and deep linking
- **Security Disconnect**: Complete localStorage cleanup and session management
- **Network Switching**: Automatic Base Mainnet network detection and switching
- **Farcaster Integration**: Native Farcaster wallet support

### Gas Efficiency Features
- **Batch Processing**: Gas-optimized operations for multiple players
- **Storage Pointers**: Efficient data access patterns
- **Event Optimization**: Minimal event emissions for cost reduction
- **Memory Management**: Proper cleanup of temporary data structures
- **Gasless Transactions**: Fee abstraction for improved UX

## 🚀 Live on Base Mainnet

### Mainnet Information
- **Network**: Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
- **Entry Fee**: $1 VMF tokens (dynamic pricing)
- **VMF Token Address**: 0x2213414893259b0C48066Acd1763e7fbA97859E5

### Contract Addresses
- **PizzaPartyCore**: [View on BaseScan](https://basescan.org/address/0x...)
- **ChainlinkVRF**: [View on BaseScan](https://basescan.org/address/0x...)
- **PizzaPartyFeeAbstraction**: [View on BaseScan](https://basescan.org/address/0x...)

### Adding Base Mainnet to MetaMask
1. Open MetaMask
2. Click network dropdown
3. Select "Base" or add manually:
   - **Network Name**: Base
   - **RPC URL**: https://mainnet.base.org
   - **Chain ID**: 8453
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://basescan.org

## 🔒 Security Features

### Smart Contract Security
- ✅ **ReentrancyGuard** - Prevents reentrancy attacks
- ✅ **Access Control** - Admin functions restricted to owner
- ✅ **Input Validation** - All inputs validated and sanitized
- ✅ **Emergency Controls** - Pause/stop functionality
- ✅ **Blacklist System** - Block malicious addresses
- ✅ **Chainlink VRF** - Provably fair randomness

### Frontend Security
- ✅ **On-chain Data Only** - No off-chain calculations for critical data
- ✅ **Input Sanitization** - All user inputs validated
- ✅ **Secure Wallet Integration** - Multiple wallet support with security checks
- ✅ **Rate Limiting** - Prevents spam attacks
- ✅ **Farcaster Security** - Secure sharing integration

### Critical Security Fix
- ✅ **Fixed Off-chain/On-chain Integration Vulnerability**
  - Removed localStorage jackpot calculations
  - All jackpot data now from on-chain sources only
  - Eliminated data manipulation vulnerability

## 🏗️ Architecture

### Smart Contracts
```
contracts/
├── PizzaPartyCore.sol           # Main game contract with VRF
├── ChainlinkVRF.sol             # VRF coordinator and winner selection
├── PizzaPartyFeeAbstraction.sol # Gasless transaction support
└── README-SMART-CONTRACTS.md
```

### Frontend Structure
```
app/
├── page.tsx               # Main landing page
├── game/page.tsx          # Game interface with sharing
├── jackpot/page.tsx       # Jackpot display
├── leaderboard/page.tsx   # Leaderboard display with sharing
├── admin/page.tsx         # Admin panel
└── debug/page.tsx         # Debug tools

components/
├── PlatformWallet.tsx     # Multi-platform wallet support
├── WalletStatus.tsx       # Wallet connection status
├── ShareButton.tsx        # Farcaster sharing component
└── ui/                    # UI components

hooks/
├── useFarcasterSharing.ts # Farcaster sharing hook
└── useWallet.ts           # Wallet integration hook

lib/
├── farcaster-sharing.ts   # Farcaster sharing service
├── pizza-party-contract.ts # Contract integration
├── wallet-config.ts       # Wallet configuration
├── platform-config.ts     # Platform detection
└── jackpot-data.ts        # On-chain jackpot utilities
```

## 🔧 Technology Stack

### Smart Contracts
- **Solidity 0.8.24** - Smart contract language
- **Hardhat** - Development framework
- **OpenZeppelin** - Security libraries
- **Chainlink VRF** - Provably fair randomness
- **Base Network** - L2 blockchain

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Ethers.js v6** - Blockchain interaction
- **Farcaster Kit** - Farcaster integration

### Wallets Supported
- **MetaMask** - Desktop extension
- **Coinbase Wallet** - Mobile & extension
- **Trust Wallet** - Mobile
- **Rainbow** - Mobile
- **Phantom** - Mobile
- **Farcaster** - Social wallet

## 📱 Multi-Platform Support

### Platforms
- **Desktop** - Full web experience
- **Mobile** - Responsive design
- **Base App** - Native Base integration
- **Farcaster** - Social platform integration with native sharing

### Features by Platform
- **Universal Wallet Support** - Works with any VMF holder
- **Platform Detection** - Optimized experience per platform
- **Deep Linking** - Mobile app integration
- **Social Sharing** - Native Farcaster sharing integration

## 🚀 Deployment

### Mainnet Deployment
```bash
# Deploy to Base mainnet
npx hardhat run scripts/deploy.ts --network base
```

### Verification
```bash
# Verify on Basescan
npx hardhat verify --network base 0xCONTRACT_ADDRESS "0x2213414893259b0C48066Acd1763e7fbA97859E5"
```

## 🧪 Testing

### Run Tests
```bash
# All tests
npx hardhat test

# Security tests
npx hardhat test test/security/

# Integration tests
npx hardhat test test/integration/

# VRF tests
npx hardhat test test/vrf/

# Gas optimization
REPORT_GAS=true npx hardhat test
```

### Test Coverage
- ✅ Smart Contract Functions
- ✅ Security Features
- ✅ Wallet Integration
- ✅ Multi-platform Support
- ✅ Error Handling
- ✅ Chainlink VRF Integration
- ✅ Farcaster Sharing

## 📊 Monitoring

### Contract Monitoring
- Daily Jackpot Tracking
- Weekly Jackpot Monitoring
- Referral Activity
- Gas Usage Patterns
- VRF Request Monitoring
- Winner Selection Verification

### Security Monitoring
- Suspicious Transactions
- Blacklist Management
- Emergency Response
- Vulnerability Detection
- VRF Randomness Verification

## 🔧 Development

### Local Development
```bash
# Start development server
npm run dev

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy locally
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

### Environment Variables
```bash
# .env
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_api_key
PRIVATE_KEY=your_private_key
CHAINLINK_VRF_SUBSCRIPTION_ID=your_subscription_id
CHAINLINK_VRF_KEYHASH=your_keyhash
```

## 📚 Documentation

### Comprehensive Documentation
- **README-SMART-CONTRACTS.md** - Smart contract documentation
- **CHAINLINK_VRF_INTEGRATION.md** - VRF integration guide
- **FARCASTER_INTEGRATION.md** - Farcaster sharing guide
- **SECURITY.md** - Security documentation
- **DEPLOYMENT.md** - Deployment guide
- **BETA_USER_GUIDE.md** - User guide

### Key Features Documented
- **Game Mechanics** - Complete game rules
- **Security Features** - All security measures
- **Deployment Process** - Step-by-step deployment
- **Troubleshooting** - Common issues and solutions
- **VRF Integration** - Chainlink VRF setup and usage
- **Farcaster Sharing** - Social sharing implementation

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

### Code Standards
- **TypeScript** - Type safety required
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Security First** - All changes security reviewed

## 🚨 Security

### Security Contact
- **Email**: vmf@vmfcoin.com
- **GitHub Issues**: [SECURITY] tag
- **Discord**: #security channel

### Bug Bounty
- **Critical**: $10,000 USD
- **High**: $5,000 USD
- **Medium**: $2,000 USD
- **Low**: $500 USD

### Security Audits
- **Smart Contract Audit** - Required before mainnet
- **Frontend Security Review** - Regular reviews
- **Penetration Testing** - Ongoing testing
- **VRF Security Review** - Chainlink VRF implementation audit

## 📈 Roadmap

### Phase 1: Core Features ✅
- Daily jackpot system
- Weekly jackpot system
- Referral system
- Toppings rewards
- Multi-platform support

### Phase 2: Security & Scale ✅
- Security audit
- Gas optimization
- Emergency controls
- Monitoring systems
- Chainlink VRF integration

### Phase 3: Advanced Features ✅
- Farcaster native sharing
- Gasless transactions
- Advanced analytics
- Mobile app
- Governance system

### Phase 4: Future Enhancements 📋
- Multi-signature admin
- Advanced VRF features
- Cross-chain integration
- DAO governance

## 📞 Support

### Community
- **Discord**: Pizza Party community
- **Twitter**: @PizzaPartyApp
- **GitHub**: Issues and discussions
- **Farcaster**: @pizzaparty

### Resources
- **Base Network**: https://base.org
- **VMF Token**: https://vmfcoin.com
- **Chainlink VRF**: https://docs.chain.link/vrf
- **Farcaster**: https://farcaster.xyz
- **Documentation**: This repository

## 🍕 Built with ❤️ for the Base community. Happy Pizza Partying! 🍕

---

## 📄 License

MIT License - see LICENSE file for details.
