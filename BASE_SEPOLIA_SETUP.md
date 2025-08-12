# Base Mainnet Setup Guide

## 🚀 Overview

This guide covers the complete setup process for the Pizza Party dApp on Base Mainnet, including network configuration, wallet setup, and deployment procedures.

## 📋 Prerequisites

### Required Tools
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **Git**
- **Hardhat** (installed globally or locally)

### Required Accounts
- **Base Network** account with ETH for gas
- **Basescan** API key for contract verification
- **Private Key** for deployment

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/Kingkill666/pizza-party-dapp.git
cd pizza-party-dapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```bash
# Base Network RPC URLs
BASE_RPC_URL=https://mainnet.base.org

# Basescan API Key (for contract verification)
BASESCAN_API_KEY=your_api_key

# Private Key (for deployment)
PRIVATE_KEY=your_private_key

# Gas Reporter
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# VMF Token Contract Address on Base
VMF_TOKEN_ADDRESS=0x2213414893259b0C48066Acd1763e7fbA97859E5
```

### 4. Verify Configuration
```bash
# Test configuration
npx hardhat compile
```

## 🧪 Local Development

### 1. Start Local Network
```bash
npx hardhat node
```

### 2. Deploy to Local Network
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. Start Frontend
```bash
npm run dev
```

### 4. Test Locally
- Open http://localhost:3000
- Connect wallet to local network
- Test all functionality

## 🚀 Mainnet Deployment (Base)

### 1. Pre-deployment Checklist
- [ ] Smart contract audited
- [ ] All tests passing
- [ ] Security review completed
- [ ] Team approval received
- [ ] VMF token integration tested
- [ ] Wallet connections verified

### 2. Deploy to Mainnet
```bash
npx hardhat run scripts/deploy.ts --network base
```

### 3. Verify Contract
```bash
npx hardhat verify --network base 0xCONTRACT_ADDRESS "0x2213414893259b0C48066Acd1763e7fbA97859E5"
```

### 4. Update Frontend
Update the contract address in your frontend configuration:

```typescript
// lib/contract-config.ts
export const PIZZA_PARTY_CONTRACT_ADDRESS = "0xDEPLOYED_CONTRACT_ADDRESS"
```

### 5. Deploy Frontend
```bash
npm run build
npm run start
```

## 🔍 Post-Deployment Verification

### 1. Contract Verification
- [ ] Contract deployed successfully
- [ ] Contract verified on Basescan
- [ ] All functions accessible
- [ ] Events firing correctly
- [ ] VMF token integration working

### 2. Frontend Verification
- [ ] Frontend deployed successfully
- [ ] Wallet connections working
- [ ] Game functionality operational
- [ ] Admin panel accessible
- [ ] VMF token approval working

### 3. Security Verification
- [ ] Access controls working
- [ ] Emergency functions tested
- [ ] Blacklist system operational
- [ ] Pause functionality working

## 📊 Monitoring Setup

### 1. Contract Monitoring
   ```bash
# Monitor contract events
npx hardhat console --network base
```

### 2. Frontend Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor user interactions
- Track performance metrics

### 3. Security Monitoring
- Set up alerts for suspicious transactions
- Monitor blacklist changes
- Track emergency function calls

## 🔧 Configuration Management

### Environment Variables
```bash
# Development
NODE_ENV=development
BASE_RPC_URL=https://mainnet.base.org

# Production
NODE_ENV=production
BASE_RPC_URL=https://mainnet.base.org
```

### Network Configuration
```typescript
// hardhat.config.ts
networks: {
  base: {
    url: process.env.BASE_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 8453,
  },
}
```

## 🚨 Emergency Procedures

### 1. Contract Pause
```bash
# Pause contract in emergency
npx hardhat console --network base
> const contract = await ethers.getContractAt("PizzaParty", "0xCONTRACT_ADDRESS")
> await contract.emergencyPause(true)
```

### 2. Emergency Withdrawal
```bash
# Withdraw funds in emergency
npx hardhat console --network base
> const contract = await ethers.getContractAt("PizzaParty", "0xCONTRACT_ADDRESS")
> await contract.emergencyWithdraw()
```

### 3. Blacklist Management
```bash
# Blacklist malicious address
npx hardhat console --network base
> const contract = await ethers.getContractAt("PizzaParty", "0xCONTRACT_ADDRESS")
> await contract.setPlayerBlacklist("0xMALICIOUS_ADDRESS", true)
```

## 🔄 Update Procedures

### 1. Contract Updates
```bash
# Deploy new contract
npx hardhat run scripts/deploy.ts --network base

# Verify new contract
npx hardhat verify --network base 0xNEW_CONTRACT_ADDRESS "0x2213414893259b0C48066Acd1763e7fbA97859E5"

# Update frontend
# Update contract address in configuration
```

### 2. Frontend Updates
```bash
# Build new version
npm run build

# Deploy to hosting platform
# (Vercel, Netlify, etc.)
```

### 3. Configuration Updates
```bash
# Update environment variables
# Update contract addresses
# Update RPC endpoints
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Code review completed
- [ ] Tests passing
- [ ] Security audit completed
- [ ] Environment configured
- [ ] Team approval received
- [ ] VMF token integration verified

### Deployment
- [ ] Contract deployed
- [ ] Contract verified
- [ ] Frontend deployed
- [ ] Configuration updated
- [ ] Monitoring active

### Post-deployment
- [ ] Functionality tested
- [ ] Security verified
- [ ] Performance monitored
- [ ] Documentation updated
- [ ] Team notified

## 🛠️ Troubleshooting

### Common Issues

#### Contract Deployment Fails
```bash
# Check gas settings
npx hardhat run scripts/deploy.ts --network base --gas-price 1000000000

# Check network connection
npx hardhat console --network base
```

#### Contract Verification Fails
```bash
# Verify manually on Basescan
# Check constructor arguments
# Verify network configuration
```

#### Frontend Connection Issues
```bash
# Check RPC endpoint
# Verify contract address
# Check wallet connection
```

#### VMF Token Issues
```bash
# Verify VMF token address
# Check token approval
# Verify token balance
```

### Support Resources
- **Documentation**: This repository
- **Discord**: Pizza Party community
- **GitHub Issues**: Bug reports
- **Security**: vmf@vmfcoin.com

## 📞 Support

### Deployment Support
- **Email**: deploy@pizzaparty.app
- **Discord**: #deployment channel
- **GitHub**: Issues and discussions

### Emergency Support
- **24/7**: Emergency contact available
- **Response Time**: 1 hour for critical issues
- **Escalation**: Team lead contact available

---

**Remember**: Always test thoroughly in local development before mainnet deployment! 