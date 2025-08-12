# Production Testing Guide

## 🎮 Welcome to Pizza Party Production Testing!

This guide will help you understand how to test the Pizza Party dApp in production on Base Mainnet and provide valuable feedback for improvements.

## 🚀 Getting Started

### 1. Connect Your Wallet
- **Supported Wallets**: MetaMask, Coinbase Wallet, Trust Wallet, Rainbow, Phantom, Farcaster
- **Network**: Base Mainnet
- **Token**: VMF tokens required for game entry

#### **How to Switch to Base Mainnet (MetaMask):**
1. **Open MetaMask**
2. **Click the network dropdown** (top of wallet)
3. **Select "Base"** from the list
4. **If Base isn't listed**, click "Add network" and enter:
   - **Network Name**: Base
   - **RPC URL**: https://mainnet.base.org
   - **Chain ID**: 8453
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://basescan.org

### 2. Get VMF Tokens
You'll need VMF tokens to play the game. Here's how to get them:

#### **VMF Token Information:**
- **Token Address**: 0x2213414893259b0C48066Acd1763e7fbA97859E5
- **Entry Fee**: $1 VMF tokens per game
- **Gas Fees**: ETH required for transaction fees

#### **How to Get VMF Tokens:**
1. **Visit a DEX** (like Uniswap on Base)
2. **Swap ETH for VMF tokens**
3. **Ensure you have enough for entry fees**
4. **Keep some ETH for gas fees**

#### **Important Notes:**
- **VMF tokens have real value** - this is mainnet
- **Keep some ETH for gas fees** - transactions cost ~0.001-0.01 ETH
- **Entry fee is $1 VMF** - ensure you have sufficient balance

### 3. Start Playing
- **Daily Game**: Enter once per day for $1 VMF tokens
- **Weekly Jackpot**: Earn toppings to participate in weekly draws
- **Referrals**: Invite friends to earn bonus toppings
- **All gameplay uses real VMF tokens for jackpots**

## 🎯 Game Mechanics

### Daily Game
- **Entry Fee**: $1 VMF tokens
- **Winners**: 8 random winners per day
- **Prize**: Equal split of daily jackpot (all entry fees collected)
- **Timing**: New game starts daily at 12pm PST

### Weekly Jackpot
- **Prize Pool**: Total toppings claimed by all users
- **Funding**: Automatically from VMF token contract
- **Winners**: 10 random winners
- **Timing**: Draw every Monday at 12pm PST
- **Weighting**: More toppings = higher chance to win

### Toppings System
- **Daily Play**: 1 topping per day (earned by playing)
- **VMF Holdings**: 3 toppings per 10 VMF held
- **Referrals**: 2 toppings per successful referral
- **Claiming Window**: Sunday 12pm PST to Monday 12pm PST

## 📱 Multi-Platform Support

### Desktop Experience
- **Full Features**: All functionality available
- **Multiple Wallets**: Support for all wallet types
- **Enhanced UI**: Optimized for larger screens

### Mobile Experience
- **Responsive Design**: Works on all mobile devices
- **Wallet Integration**: Native wallet app support
- **Touch Optimized**: Large buttons and touch-friendly interface

### Farcaster Integration
- **Social Gaming**: Share your referral code
- **Frame Support**: Play directly in Farcaster
- **Community Features**: Connect with other players

## 🔒 Security Features

### Smart Contract Security
- **Reentrancy Protection**: Prevents attack vectors
- **Access Control**: Admin functions restricted
- **Input Validation**: All inputs sanitized
- **Emergency Controls**: Pause functionality available

### Frontend Security
- **On-chain Data**: All critical data from blockchain
- **Wallet Security**: Secure connection protocols
- **Input Sanitization**: User input validation
- **Rate Limiting**: Prevents spam attacks

## 🎁 Referral System

### How It Works
1. **Create Referral**: Generate your unique referral code
2. **Share Code**: Share with friends via social media
3. **Earn Rewards**: Get 2 toppings per successful referral
4. **Track Progress**: Monitor your referral success

### Sharing Options
- **Social Media**: Twitter, Facebook, Telegram
- **Messaging**: WhatsApp, Discord, Reddit
- **Direct Link**: Share your referral URL
- **QR Code**: Mobile-friendly sharing

## 🏆 Winning Strategies

### Daily Game Tips
- **Consistent Play**: Enter every day for maximum chances
- **Timing**: Enter early in the game window
- **Network**: Ensure stable internet connection
- **Gas Fees**: Keep ETH for transaction fees

### Weekly Jackpot Tips
- **Earn Toppings**: Maximize your topping count
- **Referrals**: Invite friends to earn bonus toppings
- **VMF Holdings**: Hold more VMF for extra toppings
- **Claim Toppings**: Claim during the Sunday-Monday window

### General Tips
- **Wallet Security**: Never share private keys
- **Network Selection**: Always use Base Mainnet
- **Transaction Confirmation**: Wait for confirmations
- **Error Handling**: Check error messages carefully

## 🐛 Known Issues

### Current Limitations
- **Network Congestion**: May experience delays during peak times
- **Wallet Compatibility**: Some wallets may need updates
- **Mobile Optimization**: Some features optimized for desktop
- **Error Messages**: Some error messages may be technical

### Workarounds
- **Retry Transactions**: If transaction fails, try again
- **Refresh Page**: Reload if UI becomes unresponsive
- **Check Network**: Ensure you're on Base Mainnet
- **Clear Cache**: Clear browser cache if needed

## 📊 Analytics & Tracking

### What We Track
- **Game Participation**: Daily and weekly entry counts
- **Referral Activity**: Successful referral tracking
- **Wallet Usage**: Which wallets are most popular
- **Error Rates**: Technical issues and solutions

### Privacy Protection
- **No Personal Data**: We don't collect personal information
- **Anonymous Analytics**: All data anonymized
- **Wallet Privacy**: Your wallet data stays private
- **Opt-out Available**: Can disable analytics

## 🆘 Troubleshooting

### Common Issues

#### Wallet Connection Problems
```
Issue: "No Web3 wallet detected"
Solution: 
1. Install MetaMask or another supported wallet
2. Switch to Base Mainnet
3. Refresh the page
4. Try connecting again
```

#### Transaction Failures
```
Issue: "Transaction failed"
Solution:
1. Check your VMF balance
2. Ensure you have ETH for gas fees
3. Verify you're on Base Mainnet
4. Try again with higher gas limit
```

#### Network Issues
```
Issue: "Wrong network"
Solution:
1. Switch wallet to Base Mainnet
2. Add Base network if not available
3. Refresh the page
4. Reconnect wallet
```

#### VMF Token Issues
```
Issue: "Insufficient VMF balance"
Solution:
1. Purchase VMF tokens from a DEX
2. Ensure you have at least $1 VMF for entry
3. Account for gas fees (~0.001-0.01 ETH)
4. Try entry again
```

#### Entry Fee Issues
```
Issue: "Insufficient balance for entry fee"
Solution:
1. Ensure you have at least $1 VMF tokens
2. Account for gas fees (~0.001-0.01 ETH)
3. Purchase more VMF tokens if needed
4. Try entry again
```

#### UI Problems
```
Issue: "Page not loading"
Solution:
1. Clear browser cache
2. Try different browser
3. Check internet connection
4. Disable browser extensions
```

### Getting Help
- **Discord**: Join our community for support
- **GitHub Issues**: Report bugs and feature requests
- **Email**: Contact vmf@vmfcoin.com
- **Documentation**: Check our comprehensive docs

## 🎯 Testing Goals

### What We're Testing
- **User Experience**: How intuitive is the interface
- **Performance**: Speed and reliability
- **Security**: Vulnerability testing
- **Scalability**: Handle multiple users

### Feedback We Need
- **Bug Reports**: Technical issues you encounter
- **Feature Requests**: What you'd like to see
- **UI/UX Feedback**: Design and usability
- **Performance Issues**: Speed and responsiveness

## 🏅 Community Rewards

### Player Benefits
- **Daily Rewards**: Earn VMF tokens daily
- **Weekly Jackpots**: Big prizes for top players
- **Referral Bonuses**: Earn extra toppings
- **Community Recognition**: Top player badges

### How to Earn Rewards
- **Active Participation**: Play regularly
- **Referrals**: Bring friends to the platform
- **Community Engagement**: Help other players
- **Feedback**: Provide valuable suggestions

## 📈 Development Timeline

### Phase 1: Core Features ✅
- **Smart Contract**: Security and functionality
- **Wallet Integration**: Multi-wallet compatibility
- **Basic Gameplay**: Daily and weekly games

### Phase 2: Enhanced Features 🔄
- **Referral System**: Social features and rewards
- **Admin Panel**: Management and monitoring tools
- **Mobile Optimization**: Responsive design

### Phase 3: Advanced Features 📋
- **Advanced Analytics**: Player statistics
- **Governance**: Community voting
- **Mobile App**: Native mobile application

## 🔄 Updates & Changes

### Regular Updates
- **Feature Updates**: New features and improvements
- **Bug Fixes**: Address reported issues
- **Security Updates**: Enhanced security measures
- **Performance Improvements**: Speed and reliability

### Change Log
- **Version Tracking**: Document all changes
- **Release Notes**: Detailed update information
- **Migration Support**: Seamless updates
- **Backward Compatibility**: Preserve user data

## 🎉 Community

### Join the Community
- **Discord Server**: Real-time chat and support
- **Telegram Group**: Updates and announcements
- **Twitter**: Follow for latest news
- **GitHub**: Contribute to development

### Community Guidelines
- **Respectful**: Be kind to other community members
- **Constructive**: Provide helpful feedback
- **Supportive**: Help other players
- **Positive**: Maintain a positive gaming environment

## 📞 Contact & Support

### Support Team
- **Technical Issues**: vmf@vmfcoin.com
- **General Questions**: vmf@vmfcoin.com
- **Security Issues**: vmf@vmfcoin.com
- **Feature Requests**: vmf@vmfcoin.com

### Response Times
- **Critical Issues**: 2-4 hours
- **General Support**: 24 hours
- **Feature Requests**: 48 hours
- **Bug Reports**: 72 hours

---

**Welcome to Pizza Party! Start playing and earning VMF tokens today!**

🍕 **Happy Pizza Partying!** 🍕 

## 💰 Jackpot Mechanics

### Daily Jackpot
- **Entry Fee**: $1 VMF tokens per player
- **Prize Pool**: 100% of all daily entry fees
- **Distribution**: Equal split among 8 winners
- **Example**: If 100 players enter, jackpot = 100 VMF tokens
- **Winner Prize**: 12.5 VMF tokens each (100 ÷ 8)

### Weekly Jackpot
- **Prize Pool**: Total toppings claimed by all users
- **Funding**: Automatically from VMF token contract
- **Distribution**: Equal split among 10 winners
- **Example**: If 1000 toppings claimed, jackpot = 1000 VMF tokens
- **Winner Prize**: 100 VMF tokens each (1000 ÷ 10)

### Important Notes
- **VMF tokens have real value** - this is mainnet
- **Entry fees fund the daily jackpots** - community-driven
- **Toppings fund the weekly jackpots** - earned through gameplay
- **More players = bigger jackpots** - community-driven
- **Gas fees are separate** - ~0.001-0.01 ETH per transaction 