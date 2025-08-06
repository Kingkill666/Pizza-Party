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

## 🎮 Game Overview

### Daily Game
- **Entry Fee**: $1 VMF token
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
- **Payout**: Automatic Base Sepolia ETH distribution to winners' wallets
- **Timing**: Daily at 12pm PST when game ends
- **Process**: Fully automated - no manual intervention required

### Weekly Jackpot Winners  
- **Selection**: 10 random winners selected from all weekly players
- **Randomness**: Secure on-chain randomness using FreeRandomness contract
- **Payout**: Automatic Base Sepolia ETH distribution to winners' wallets
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
4. **Automatic Transfer**: Base Sepolia ETH sent directly to winners' wallets
5. **Transaction Verification**: All transfers verified on-chain
6. **New Game Start**: New game automatically starts after payout

### Payout Example
- **Daily Jackpot**: 100 players × 0.001 ETH = 0.1 ETH total
- **Prize per Winner**: 0.1 ETH ÷ 8 winners = 0.0125 ETH each
- **Automatic Transfer**: Each winner receives 0.0125 Base Sepolia ETH directly to their wallet

### Security Features
- ✅ **No Manual Intervention**: Fully automated system
- ✅ **Secure Randomness**: Cryptographic random number generation
- ✅ **On-chain Verification**: All payouts verified on blockchain
- ✅ **Equal Distribution**: Fair prize distribution among winners
- ✅ **Immediate Payout**: Winners receive prizes instantly when game ends

### Toppings System
- **Daily Play**: 1 topping per day
- **VMF Holdings**: 2 toppings per 10 VMF
- **Referrals**: 2 toppings per accepted referral
- **7-Day Streak**: 3 toppings bonus

## 🧪 Beta Testing on Base Sepolia

### Testnet Information
- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Entry Fee**: 0.001 Base Sepolia ETH (for testing)

### Recommended Base Sepolia ETH Faucets
For beta testing, you'll need Base Sepolia ETH for gas fees. Get free testnet ETH from:

- **Chainlink Faucet**: https://faucets.chain.link/base-sepolia
- **QuickNode Faucet**: https://faucet.quicknode.com/base/sepolia

### Adding Base Sepolia to MetaMask
1. Open MetaMask
2. Click network dropdown
3. Select "Base Sepolia" or add manually:
   - **Network Name**: Base Sepolia
   - **RPC URL**: https://sepolia.base.org
   - **Chain ID**: 84532
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://sepolia.basescan.org

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

### Testnet Deployment
```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network baseSepolia
```

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
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_api_key
PRIVATE_KEY=your_private_key
```

## 📚 Documentation

### Comprehensive Documentation
- **README-SMART-CONTRACTS.md** - Smart contract documentation
- **SECURITY.md** - Security documentation
- **DEPLOYMENT.md** - Deployment guide
- **BETA_USER_GUIDE.md** - Beta testing guide

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
