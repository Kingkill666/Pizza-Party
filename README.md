# 🍕 Pizza Party dApp

A decentralized gaming platform on Base network where players compete for daily and weekly jackpots using VMF tokens. Features a referral system, toppings rewards, and multi-platform wallet support.

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

## 💰 Dynamic Pricing System

**NEW!** Pizza Party now features **dynamic VMF pricing** ensuring a consistent $1 USD entry fee regardless of VMF token price fluctuations.

📖 **[Read the Dynamic Pricing Documentation](DYNAMIC_PRICING_README.md)** for detailed technical information.

### Key Features:
- ✅ **Always $1 USD** - Entry fee adjusts automatically with VMF price
- ✅ **Real-time Pricing** - Uses price oracle for current market rates
- ✅ **Fair Gameplay** - No advantage based on token price volatility
- ✅ **Transparent** - All pricing calculations visible on-chain

## 🎮 Game Overview

### Daily Game
- **Entry Fee**: $1 worth of VMF tokens (dynamic pricing)
- **Jackpot**: 100% of daily entry fees
- **Winners**: 8 random daily winners
- **Frequency**: One entry per wallet per day
- **Deadline**: Daily at 12pm PST

### Weekly Jackpot
- **Prize Pool**: Total toppings claimed by all users
- **Funding**: Automatically from VMF token contract
- **Winners**: 10 random weekly winners
- **Deadline**: Monday 12pm PST

## 🏆 Jackpot Winner Selection & Payout System

### Daily Jackpot Winners
- **Selection**: 8 random winners selected from all daily players
- **Randomness**: Secure on-chain randomness using FreeRandomness contract
- **Payout**: Automatic VMF token distribution to winners' wallets
- **Timing**: Daily at 12pm PST when game ends
- **Process**: Fully automated - no manual intervention required

### Weekly Jackpot Winners  
- **Selection**: 10 random winners selected from all weekly players
- **Randomness**: Secure on-chain randomness using FreeRandomness contract
- **Payout**: Automatic VMF token distribution to winners' wallets
- **Timing**: Weekly on Monday at 12pm PST
- **Process**: Fully automated - no manual intervention required

### Random Selection Process
1. **Secure Randomness**: Uses FreeRandomness contract with multi-party commit-reveal scheme
2. **Fair Selection**: Winners selected using cryptographic hash functions
3. **Transparent**: All randomness generation is verifiable on-chain
4. **Tamper-Proof**: No single party can influence winner selection

### Automatic Payout System
1. **Game End Detection**: System automatically detects when daily/weekly games end
2. **Winner Selection**: 8 daily winners or 10 weekly winners selected randomly
3. **Prize Calculation**: Total jackpot divided equally among winners
4. **Automatic Transfer**: VMF tokens sent directly to winners' wallets
5. **Transaction Verification**: All transfers verified on-chain
6. **New Game Start**: New game automatically starts after payout

### Payout Example
- **Daily Jackpot**: 100 players × $1 VMF = 100 VMF total
- **Prize per Winner**: 100 VMF ÷ 8 winners = 12.5 VMF each
- **Automatic Transfer**: Each winner receives 12.5 VMF tokens directly to their wallet

### Security Features
- ✅ **No Manual Intervention**: Fully automated system
- ✅ **Secure Randomness**: Cryptographic random number generation
- ✅ **On-chain Verification**: All payouts verified on blockchain
- ✅ **Equal Distribution**: Fair prize distribution among winners
- ✅ **Immediate Payout**: Winners receive prizes instantly when game ends

## 🔧 Technical Architecture

### Smart Contract Security
- **ReentrancyGuard**: Prevents reentrancy attacks on all payable functions
- **Ownable**: Access control for admin functions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Sanitized inputs with length and format checks
- **Rate Limiting**: Cooldown periods to prevent abuse
- **Gas Optimization**: Batch processing for efficient operations

### Prize Distribution Logic
```solidity
// Daily jackpot distribution
function drawDailyWinners() external {
    address[] memory winners = _selectWinners(DAILY_WINNERS_COUNT, totalEntries);
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

### Wallet Integration
- **Multi-Wallet Support**: MetaMask, Coinbase, Trust, Rainbow, Phantom
- **Mobile Optimization**: Automatic mobile browser detection and deep linking
- **Security Disconnect**: Complete localStorage cleanup and session management
- **Network Switching**: Automatic Base Mainnet network detection and switching

### Gas Efficiency Features
- **Batch Processing**: Gas-optimized operations for multiple players
- **Storage Pointers**: Efficient data access patterns
- **Event Optimization**: Minimal event emissions for cost reduction
- **Memory Management**: Proper cleanup of temporary data structures

## 🚀 Live on Base Mainnet

### Mainnet Information
- **Network**: Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
- **Entry Fee**: $1 VMF tokens
- **VMF Token Address**: 0x2213414893259b0C48066Acd1763e7fbA97859E5

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

### Frontend Security
- ✅ **On-chain Data Only** - No off-chain calculations for critical data
- ✅ **Input Sanitization** - All user inputs validated
- ✅ **Secure Wallet Integration** - Multiple wallet support with security checks
- ✅ **Rate Limiting** - Prevents spam attacks

### Critical Security Fix
- ✅ **Fixed Off-chain/On-chain Integration Vulnerability**
  - Removed localStorage jackpot calculations
  - All jackpot data now from on-chain sources only
  - Eliminated data manipulation vulnerability

## 🏗️ Architecture

### Smart Contracts
```
contracts/
├── PizzaParty.sol          # Main game contract
└── README-SMART-CONTRACTS.md
```

### Frontend Structure
```
app/
├── page.tsx               # Main landing page
├── game/page.tsx          # Game interface
├── jackpot/page.tsx       # Jackpot display
├── leaderboard/page.tsx   # Leaderboard display
├── admin/page.tsx         # Admin panel
└── debug/page.tsx         # Debug tools

components/
├── PlatformWallet.tsx     # Multi-platform wallet support
├── WalletStatus.tsx       # Wallet connection status
└── ui/                    # UI components

lib/
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
- **Base Network** - L2 blockchain

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Ethers.js v6** - Blockchain interaction

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
- **Farcaster** - Social platform integration

### Features by Platform
- **Universal Wallet Support** - Works with any VMF holder
- **Platform Detection** - Optimized experience per platform
- **Deep Linking** - Mobile app integration
- **Social Sharing** - Referral code sharing

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

# Gas optimization
REPORT_GAS=true npx hardhat test
```

### Test Coverage
- ✅ Smart Contract Functions
- ✅ Security Features
- ✅ Wallet Integration
- ✅ Multi-platform Support
- ✅ Error Handling

## 📊 Monitoring

### Contract Monitoring
- Daily Jackpot Tracking
- Weekly Jackpot Monitoring
- Referral Activity
- Gas Usage Patterns

### Security Monitoring
- Suspicious Transactions
- Blacklist Management
- Emergency Response
- Vulnerability Detection

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
```

## 📚 Documentation

### Comprehensive Documentation
- **README-SMART-CONTRACTS.md** - Smart contract documentation
- **SECURITY.md** - Security documentation
- **DEPLOYMENT.md** - Deployment guide
- **BETA_USER_GUIDE.md** - User guide

### Key Features Documented
- **Game Mechanics** - Complete game rules
- **Security Features** - All security measures
- **Deployment Process** - Step-by-step deployment
- **Troubleshooting** - Common issues and solutions

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

## 📈 Roadmap

### Phase 1: Core Features ✅
- Daily jackpot system
- Weekly jackpot system
- Referral system
- Toppings rewards
- Multi-platform support

### Phase 2: Security & Scale 🔄
- Security audit
- Gas optimization
- Emergency controls
- Monitoring systems

### Phase 3: Advanced Features 📋
- Multi-signature admin
- Advanced analytics
- Mobile app
- Governance system

## 📞 Support

### Community
- **Discord**: Pizza Party community
- **Twitter**: @PizzaPartyApp
- **GitHub**: Issues and discussions

### Resources
- **Base Network**: https://base.org
- **VMF Token**: https://vmfcoin.com
- **Documentation**: This repository

## 🍕 Built with ❤️ for the Base community. Happy Pizza Partying! 🍕

---

## 📄 License

MIT License - see LICENSE file for details.
