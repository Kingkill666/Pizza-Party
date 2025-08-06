# 🧪 Base Sepolia Testnet Setup Guide

## Overview

This guide will help you set up and test Pizza Party on Base Sepolia testnet. Base Sepolia is the official testnet for Base network, providing a safe environment for testing before mainnet deployment.

## 🌐 Network Information

### Base Sepolia Testnet
- **Network Name**: Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532
- **Currency Symbol**: ETH
- **Block Explorer**: https://sepolia.basescan.org
- **Faucet**: Multiple options available (see below)

## 💰 Free Base Sepolia ETH Faucets

### Official Faucets
Based on the [Base documentation](https://docs.base.org/base-chain/tools/network-faucets), here are the available faucets:

#### 1. Coinbase Developer Platform Faucet
- **URL**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Limit**: One claim per 24 hours
- **Requirements**: Coinbase account
- **Amount**: 0.1-0.5 Base Sepolia ETH

#### 2. thirdweb Faucet
- **URL**: https://thirdweb.com/faucet/base-sepolia
- **Limit**: One claim per 24 hours
- **Requirements**: Wallet connection (EOA or social logins)
- **Amount**: 0.1-0.5 Base Sepolia ETH

#### 3. Superchain Faucet
- **URL**: https://superchain.com/faucet
- **Limit**: One claim per 24 hours
- **Requirements**: Onchain identity authentication
- **Amount**: More ETH for authenticated users
- **Note**: Supports all OP Chains including Base

#### 4. Alchemy Faucet
- **URL**: https://www.alchemy.com/faucets/base-sepolia-faucet
- **Limit**: One claim per 24 hours
- **Requirements**: Free Alchemy account
- **Amount**: 0.1-0.5 Base Sepolia ETH

#### 5. Bware Labs Faucet
- **URL**: https://faucet.bwarelabs.com/
- **Limit**: One claim per 24 hours
- **Requirements**: No registration required
- **Amount**: 0.1-0.5 Base Sepolia ETH

#### 6. Chainstack Faucet
- **URL**: https://faucet.chainstack.com/
- **Limit**: 0.5 ETH every 24 hours
- **Requirements**: Chainstack platform API key
- **Amount**: 0.5 Base Sepolia ETH

#### 7. QuickNode Faucet
- **URL**: https://faucet.quicknode.com/base-sepolia
- **Limit**: One drip every 12 hours
- **Requirements**: Multi-chain faucet
- **Amount**: 0.1-0.5 Base Sepolia ETH

#### 8. LearnWeb3 Faucet
- **URL**: https://learnweb3.io/faucets/base-sepolia
- **Limit**: One claim every 24 hours
- **Requirements**: LearnWeb3 account
- **Amount**: 0.1-0.5 Base Sepolia ETH

#### 9. Ethereum Ecosystem Faucet
- **URL**: https://base-sepolia-faucet.pk910.de/
- **Limit**: 0.5 ETH every 24 hours
- **Requirements**: No login required
- **Amount**: 0.5 Base Sepolia ETH
- **Note**: Very generous drips, no authentication needed

## 🔧 Wallet Setup

### MetaMask Configuration

#### Adding Base Sepolia to MetaMask

1. **Open MetaMask**
2. **Click the network dropdown** (top of wallet)
3. **Select "Base Sepolia"** if available
4. **If not available**, click "Add network" and enter:
   ```
   Network Name: Base Sepolia
   RPC URL: https://sepolia.base.org
   Chain ID: 84532
   Currency Symbol: ETH
   Block Explorer: https://sepolia.basescan.org
   ```

#### Manual Network Addition
If Base Sepolia doesn't appear in the list:

1. **Open MetaMask Settings**
2. **Go to Networks**
3. **Click "Add Network"**
4. **Enter the details above**
5. **Save the network**

### Other Wallet Support

#### Coinbase Wallet
- **Automatic Detection**: Base Sepolia should be auto-detected
- **Manual Addition**: Use the same network details as MetaMask

#### Trust Wallet
- **Network**: Add custom network with Base Sepolia details
- **RPC**: https://sepolia.base.org

#### Rainbow Wallet
- **Built-in Support**: Base Sepolia should be available
- **Manual Addition**: Use network configuration

## 🚀 Getting Testnet ETH

### Step-by-Step Process

1. **Choose a Faucet**
   - Start with Coinbase or thirdweb for easiest access
   - Try multiple faucets if you need more ETH

2. **Connect Your Wallet**
   - Use MetaMask or your preferred wallet
   - Ensure you're on Base Sepolia network

3. **Request Testnet ETH**
   - Enter your wallet address
   - Complete any verification steps
   - Wait for confirmation (usually 1-5 minutes)

4. **Verify Receipt**
   - Check your wallet balance
   - Verify on https://sepolia.basescan.org

### Recommended Faucet Order

1. **Coinbase Developer Platform** (easiest)
2. **thirdweb Faucet** (no account needed)
3. **Ethereum Ecosystem Faucet** (generous amounts)
4. **Superchain Faucet** (more for authenticated users)
5. **Other faucets** as needed

## 🧪 Testing Pizza Party

### Beta Testing Requirements

- **Network**: Base Sepolia testnet
- **Entry Fee**: 0.001 Base Sepolia ETH per game
- **Gas Fees**: ~0.0001-0.001 Base Sepolia ETH per transaction
- **Minimum Balance**: 0.01 Base Sepolia ETH recommended

### Testing Process

1. **Deploy Contract**
   ```bash
   npm run deploy:testnet
   ```

2. **Get Testnet ETH**
   - Use faucets listed above
   - Get at least 0.01 Base Sepolia ETH

3. **Test Game Features**
   - Daily game entries
   - Weekly jackpot participation
   - Referral system
   - Toppings rewards

4. **Monitor Transactions**
   - Use https://sepolia.basescan.org
   - Track gas usage and costs

## 🔍 Troubleshooting

### Common Issues

#### "Insufficient Balance"
```
Solution:
1. Get more Base Sepolia ETH from faucets
2. Account for gas fees (~0.001 ETH per transaction)
3. Keep some ETH for future transactions
```

#### "Wrong Network"
```
Solution:
1. Switch wallet to Base Sepolia
2. Add network if not available
3. Refresh the page
4. Reconnect wallet
```

#### "Transaction Failed"
```
Solution:
1. Check gas fees
2. Ensure sufficient balance
3. Try with higher gas limit
4. Check network congestion
```

#### "Faucet Not Working"
```
Solution:
1. Try different faucet
2. Wait 24 hours between requests
3. Check faucet status
4. Use alternative faucet
```

### Gas Optimization

- **Base Sepolia**: Generally low gas fees
- **Recommended**: 1-2 gwei gas price
- **Max Fee**: 5 gwei for reliability
- **Priority Fee**: 0.1 gwei

## 📊 Monitoring

### Block Explorer
- **URL**: https://sepolia.basescan.org
- **Features**: Transaction tracking, contract verification
- **Search**: By address, transaction hash, or block

### Network Status
- **Base Status**: https://status.base.org
- **Network Stats**: https://basescan.org
- **Gas Tracker**: https://basescan.org/gastracker

## 🔗 Useful Links

### Official Resources
- **Base Documentation**: https://docs.base.org
- **Base Sepolia Faucets**: https://docs.base.org/base-chain/tools/network-faucets
- **Base Explorer**: https://basescan.org
- **Base Sepolia Explorer**: https://sepolia.basescan.org

### Community Resources
- **Base Discord**: https://discord.gg/base
- **Base Twitter**: https://twitter.com/buildonbase
- **Base GitHub**: https://github.com/base-org

## 🎯 Beta Testing Checklist

### Pre-Testing
- [ ] Wallet configured for Base Sepolia
- [ ] Sufficient testnet ETH (0.01+)
- [ ] Contract deployed to testnet
- [ ] Environment variables set

### Testing Tasks
- [ ] Daily game entry
- [ ] Weekly jackpot entry
- [ ] Referral code generation
- [ ] Toppings claiming
- [ ] Wallet connection
- [ ] Transaction monitoring

### Post-Testing
- [ ] Report any bugs
- [ ] Provide feedback
- [ ] Test edge cases
- [ ] Document issues

## 📞 Support

### Technical Support
- **Email**: vmf@vmfcoin.com
- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Community support

### Faucet Issues
- **Contact faucet providers directly**
- **Try alternative faucets**
- **Check faucet status pages**

---

**Happy testing on Base Sepolia! 🍕**

Remember: Base Sepolia ETH has no real value and is only for testing purposes. 