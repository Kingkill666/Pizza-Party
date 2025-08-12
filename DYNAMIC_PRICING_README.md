# 🍕 Pizza Party - Dynamic Pricing System

## Overview

Pizza Party is a decentralized gaming platform on Base network that uses **dynamic VMF pricing** to ensure a consistent $1 USD entry fee regardless of VMF token price fluctuations.

## 💰 Dynamic Pricing System

### How It Works

The game uses a **price oracle** to calculate the exact amount of VMF tokens needed for a $1 USD entry fee:

1. **Real-time Price Query**: The system queries the `FreePriceOracle` contract for current VMF/USD price
2. **Dynamic Calculation**: Calculates exact VMF amount needed for $1 USD
3. **VMF Approval**: User approves VMF tokens to the Pizza Party contract
4. **Token Transfer**: Contract transfers the calculated VMF amount via `transferFrom`
5. **Game Entry**: Player enters the game with the correct dynamic amount

### Key Benefits

- ✅ **Consistent Pricing**: Always $1 USD regardless of VMF price
- ✅ **Fair Entry**: No advantage/disadvantage based on token price
- ✅ **Real-time Updates**: Automatically adjusts to market conditions
- ✅ **User-Friendly**: Transparent pricing with clear USD value

## 🎮 Game Features

### Daily Game Entry
- **Entry Fee**: $1 worth of VMF tokens (dynamic)
- **Reward**: 1 topping per daily entry
- **Limit**: 10 entries per day maximum
- **Cooldown**: 1 hour between entries

### Jackpot System
- **Entry Fee**: $1 worth of VMF tokens (dynamic)
- **Multiplier**: 2x jackpot contribution
- **Limit**: 100 jackpot entries per user
- **Weekly Draws**: 10 winners selected weekly

### Referral System
- **Reward**: 2 toppings per successful referral
- **Code Generation**: Automatic unique referral codes
- **Validation**: Secure referral code format checking

## 🔧 Technical Implementation

### Smart Contract Functions

#### `enterDailyGame(string memory referralCode)`
```solidity
function enterDailyGame(string memory referralCode) external nonReentrant whenNotPaused notBlacklisted(msg.sender) rateLimited securityCheck {
    // Get dynamic entry fee ($1 worth of VMF)
    uint256 requiredVMF = _calculateDynamicEntryFee();
    
    // Check VMF balance and allowance
    require(vmfToken.balanceOf(msg.sender) >= requiredVMF, "Insufficient VMF balance");
    require(vmfToken.allowance(msg.sender, address(this)) >= requiredVMF, "Insufficient VMF allowance");
    
    // Transfer VMF tokens from player to contract
    require(vmfToken.transferFrom(msg.sender, address(this), requiredVMF), "VMF transfer failed");
    
    // Update game state and award toppings
    // ...
}
```

#### `_calculateDynamicEntryFee()`
```solidity
function _calculateDynamicEntryFee() internal returns (uint256) {
    // Get current VMF price from oracle
    uint256 vmfPrice = priceOracle.getVMFPrice();
    
    // Calculate required VMF for $1 entry fee
    uint256 requiredVMF = priceOracle.getRequiredVMFForDollar();
    
    // Validate price deviation
    _validatePriceDeviation(vmfPrice);
    
    emit DynamicEntryFeeCalculated(vmfPrice, requiredVMF, block.timestamp);
    
    return requiredVMF;
}
```

### Frontend Integration

#### VMF Approval Flow
```typescript
// Step 1: Get dynamic VMF amount for $1
const vmfPriceData = await this.provider.request({
  method: 'eth_call',
  params: [{
    to: this.priceOracleAddress,
    data: this.encodeFunctionCallWithABI('getRequiredVMFForDollar', [], FREE_PRICE_ORACLE_ABI)
  }, 'latest']
})

const requiredVMFAmount = this.decodeUint256(vmfPriceData)

// Step 2: Approve VMF tokens
const approveData = this.encodeFunctionCallWithABI('approve', [this.pizzaPartyAddress, vmfAmountHex], VMF_TOKEN_ABI)
const approveTxHash = await this.provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: account,
    to: vmfContractAddress,
    data: approveData,
    gas: approveGasEstimate
  }]
})

// Step 3: Call enterDailyGame (contract handles transfer)
const enterGameData = this.encodeFunctionCall('enterDailyGame', [referralCode])
const enterGameTxHash = await this.provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: account,
    to: this.pizzaPartyAddress,
    data: enterGameData,
    gas: enterGameGasEstimate
  }]
})
```

## 🛡️ Security Features

### Smart Contract Security
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Access control for admin functions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Sanitized inputs and format checking
- **Rate Limiting**: Cooldown periods and daily limits
- **Suspicious Activity Detection**: Monitors for unusual patterns

### Dynamic Pricing Security
- **Price Deviation Validation**: Prevents extreme price manipulation
- **Oracle Integration**: Reliable external price data
- **Fallback Mechanisms**: Graceful handling of oracle failures
- **Transaction Validation**: Comprehensive error checking

## 📊 Real-time Data Updates

### Live Game Statistics
- **Daily Player Count**: Real-time from blockchain
- **Weekly Player Count**: Real-time from blockchain
- **Current Jackpot**: Real-time VMF amount
- **Player Toppings**: Real-time from player data
- **VMF Balance**: Real-time wallet balance

### Data Refresh
- **Automatic Updates**: Every 30 seconds when connected
- **Manual Refresh**: After successful transactions
- **Fallback Data**: localStorage when blockchain unavailable

## 🎨 User Interface

### Design Features
- **Comic Sans MS Font**: Playful, game-friendly typography
- **Colorful Buttons**: Distinct colors for different actions
- **Real-time Counters**: Live updates of game statistics
- **Wallet Integration**: Seamless connection with multiple wallets
- **Mobile Responsive**: Optimized for all device sizes

### User Experience
- **Daily Entry Warning**: Prevents multiple entries per day
- **Transaction Status**: Real-time transaction confirmation
- **Error Handling**: Clear error messages and fallbacks
- **Loading States**: Visual feedback during transactions

## 🔄 Recent Updates

### Dynamic Pricing Implementation
- ✅ **Fixed Entry Fee**: Changed from 1 VMF token to $1 worth of VMF
- ✅ **Price Oracle Integration**: Real-time VMF/USD price calculation
- ✅ **VMF Approval Flow**: Proper token approval and transfer
- ✅ **Frontend Updates**: Dynamic amount calculation and display

### Error Handling Improvements
- ✅ **NaN Error Fix**: Comprehensive error handling for invalid data
- ✅ **Contract Call Validation**: Proper response validation
- ✅ **Fallback Mechanisms**: Graceful degradation when services unavailable

### Font Consistency
- ✅ **No Cursive Fonts**: Removed all cursive fonts from mobile/desktop
- ✅ **Comic Sans MS**: Consistent playful font across all devices
- ✅ **UI Locked**: No changes to layout or functionality

## 🚀 Deployment

### Vercel Integration
- **Automatic Deployments**: Triggered on git push to main branch
- **Environment Variables**: Secure configuration management
- **Build Optimization**: Fast, optimized production builds

### Contract Deployment
- **Base Network**: Deployed on Base mainnet
- **Verified Contracts**: All contracts verified on BaseScan
- **Price Oracle**: Integrated with reliable price feed

## 📈 Future Enhancements

### Planned Features
- **Enhanced Randomness**: Multi-party commit-reveal scheme
- **Weekly Challenges**: Additional reward mechanisms
- **Loyalty System**: Points-based rewards for regular players
- **Social Features**: Enhanced referral and community features

### Technical Improvements
- **Gas Optimization**: Continued gas efficiency improvements
- **Security Audits**: Regular security assessments
- **Performance Monitoring**: Real-time system monitoring
- **User Analytics**: Enhanced user behavior tracking

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### Testing
- **Unit Tests**: Comprehensive test coverage
- **Integration Tests**: End-to-end functionality testing
- **Security Tests**: Vulnerability assessment
- **Gas Tests**: Transaction cost optimization

## 📞 Support

For questions, issues, or contributions:
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive guides and API references
- **Community**: Join our Discord for discussions

---

**Pizza Party** - Where every slice costs exactly $1! 🍕💰 