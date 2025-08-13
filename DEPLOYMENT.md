# Deployment Guide

## 🚀 Overview

This guide covers the complete deployment process for the Pizza Party dApp on Base Mainnet, including the main game contract (PizzaPartyCore), Chainlink VRF integration, and Farcaster sharing features.

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
- **Chainlink VRF** subscription for randomness

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

# Chainlink VRF Configuration
CHAINLINK_VRF_SUBSCRIPTION_ID=your_subscription_id
CHAINLINK_VRF_KEYHASH=0x08ba8f62ff6c40a58877a106147661db43bc58dab9e9e1daedc0b61041f4c803
CHAINLINK_VRF_COORDINATOR=0x41034678D6C633D8a95c75e1138A360a28bBc9dB
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
- Test all functionality including VRF and sharing

## 🚀 Mainnet Deployment (Base)

### 1. Pre-deployment Checklist
- [ ] Smart contract audited
- [ ] All tests passing
- [ ] Security review completed
- [ ] Team approval received
- [ ] VMF token integration tested
- [ ] Wallet connections verified
- [ ] Chainlink VRF subscription configured
- [ ] Farcaster sharing tested

### 2. Deploy to Mainnet
```bash
npx hardhat run scripts/deploy.ts --network base
```

### 3. Verify Contracts
```bash
# Verify PizzaPartyCore
npx hardhat verify --network base 0xPIZZA_PARTY_CORE_ADDRESS "0x2213414893259b0C48066Acd1763e7fbA97859E5"

# Verify ChainlinkVRF
npx hardhat verify --network base 0xCHAINLINK_VRF_ADDRESS "0x41034678D6C633D8a95c75e1138A360a28bBc9dB" "YOUR_SUBSCRIPTION_ID" "0x08ba8f62ff6c40a58877a106147661db43bc58dab9e9e1daedc0b61041f4c803"

# Verify PizzaPartyFeeAbstraction
npx hardhat verify --network base 0xFEE_ABSTRACTION_ADDRESS
```

### 4. Update Frontend Configuration
Update the contract addresses in your frontend configuration:

```typescript
// lib/contract-config.ts
export const PIZZA_PARTY_CORE_ADDRESS = "0xDEPLOYED_CORE_ADDRESS"
export const CHAINLINK_VRF_ADDRESS = "0xDEPLOYED_VRF_ADDRESS"
export const FEE_ABSTRACTION_ADDRESS = "0xDEPLOYED_FEE_ADDRESS"
```

### 5. Deploy Frontend
```bash
npm run build
npm run start
```

## 🔍 Post-Deployment Verification

### 1. Contract Verification
- [ ] PizzaPartyCore deployed successfully
- [ ] ChainlinkVRF deployed and linked
- [ ] PizzaPartyFeeAbstraction deployed
- [ ] All contracts verified on Basescan
- [ ] All functions accessible
- [ ] Events firing correctly
- [ ] VMF token integration working
- [ ] VRF randomness requests working

### 2. Frontend Verification
- [ ] Frontend deployed successfully
- [ ] Wallet connections working
- [ ] Game functionality operational
- [ ] Admin panel accessible
- [ ] VMF token approval working
- [ ] Farcaster sharing functional
- [ ] Gasless transactions working

### 3. Security Verification
- [ ] Access controls working
- [ ] Emergency functions tested
- [ ] VRF security verified
- [ ] Pause functionality working

## 📊 Monitoring Setup

### 1. Contract Monitoring
```bash
# Monitor contract events
npx hardhat console --network base
```

### 2. VRF Monitoring
- Monitor VRF request success rates
- Track randomness generation times
- Verify winner selection fairness

### 3. Frontend Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor user interactions
- Track performance metrics
- Monitor Farcaster sharing success rates

### 4. Security Monitoring
- Set up alerts for suspicious transactions
- Monitor VRF randomness verification
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
> const contract = await ethers.getContractAt("PizzaPartyCore", "0xCONTRACT_ADDRESS")
> await contract.pause()
```

### 2. Emergency Withdrawal
```bash
# Withdraw funds in emergency
npx hardhat console --network base
> const contract = await ethers.getContractAt("PizzaPartyCore", "0xCONTRACT_ADDRESS")
> await contract.emergencyWithdraw("0xVMF_TOKEN_ADDRESS", amount)
```

### 3. VRF Emergency
```bash
# Pause VRF requests if needed
npx hardhat console --network base
> const vrfContract = await ethers.getContractAt("ChainlinkVRF", "0xVRF_ADDRESS")
> await vrfContract.pause()
```

## 🔄 Update Procedures

### 1. Contract Updates
```bash
# Deploy new contracts
npx hardhat run scripts/deploy.ts --network base

# Verify new contracts
npx hardhat verify --network base 0xNEW_CORE_ADDRESS "0x2213414893259b0C48066Acd1763e7fbA97859E5"
npx hardhat verify --network base 0xNEW_VRF_ADDRESS "0x41034678D6C633D8a95c75e1138A360a28bBc9dB" "YOUR_SUBSCRIPTION_ID" "0x08ba8f62ff6c40a58877a106147661db43bc58dab9e9e1daedc0b61041f4c803"

# Update frontend configuration
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
# Update VRF configuration
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Code review completed
- [ ] Tests passing
- [ ] Security audit completed
- [ ] Environment configured
- [ ] Team approval received
- [ ] VMF token integration verified
- [ ] Chainlink VRF subscription active
- [ ] Farcaster sharing tested

### Deployment
- [ ] PizzaPartyCore deployed
- [ ] ChainlinkVRF deployed
- [ ] PizzaPartyFeeAbstraction deployed
- [ ] All contracts verified
- [ ] Frontend deployed
- [ ] Configuration updated
- [ ] Monitoring active

### Post-deployment
- [ ] Functionality tested
- [ ] Security verified
- [ ] VRF randomness tested
- [ ] Farcaster sharing verified
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

#### VRF Issues
```bash
# Check VRF subscription balance
# Verify subscription ID
# Check key hash configuration
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
# Verify contract addresses
# Check wallet connection
```

#### Farcaster Sharing Issues
```bash
# Check Farcaster API availability
# Verify sharing permissions
# Test fallback clipboard functionality
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