# 🍕 Pizza Party Modular Contracts System

## Overview

The Pizza Party game now uses a **modular contract architecture** to solve the contract size limit issue while providing all the advanced features you requested. Instead of one large contract, we now have **7 specialized contracts** that work together.

## 🏗️ Contract Architecture

### Core Contract
- **`PizzaPartyCore.sol`** - Essential game logic, VRF integration, winner selection

### Advanced Feature Contracts
- **`PizzaPartyReferral.sol`** - Referral system with codes and rewards
- **`PizzaPartyDynamicPricing.sol`** - Dynamic entry fees based on VMF price
- **`PizzaPartyLoyalty.sol`** - Loyalty points and tier system
- **`PizzaPartyAdvancedRandomness.sol`** - Multi-party commit-reveal randomness
- **`PizzaPartyAnalytics.sol`** - Batch processing and gas optimization
- **`PizzaPartyWeeklyChallenges.sol`** - Weekly challenges and rewards

## 📋 Contract Details

### 🔗 PizzaPartyReferral
**Features:**
- Create referral codes (6-50 characters, alphanumeric)
- Process referral codes with rewards
- Track referral analytics and claims
- Anti-abuse measures (cooldowns, limits)
- Referral reward distribution (2 toppings for referee, 5 for referrer)

**Key Functions:**
- `createReferralCode()` - Generate new referral code
- `processReferralCode(code, user)` - Use referral code
- `getReferralCodeInfo(code)` - Get code details
- `getUserReferralData(user)` - Get user referral stats

### 💰 PizzaPartyDynamicPricing
**Features:**
- Dynamic entry fees based on VMF price
- Price oracle integration
- Fee calculation algorithms
- Price deviation protection
- Fee history tracking

**Key Functions:**
- `calculateDynamicEntryFee()` - Get current entry fee
- `collectEntryFee(user)` - Collect dynamic fee
- `getVMFPrice()` - Get current VMF price
- `updatePricingConfig()` - Update pricing parameters

### 🏆 PizzaPartyLoyalty
**Features:**
- Earn loyalty points for game participation
- Tier-based loyalty system (Bronze, Silver, Gold, Platinum)
- Point redemption for VMF rewards
- Streak tracking and bonuses
- Point expiration management

**Key Functions:**
- `awardLoyaltyPoints(user, points, reason)` - Award points
- `redeemPoints(points)` - Redeem points for VMF
- `awardEntryPoints(user)` - Award points for game entry
- `getUserLoyaltyData(user)` - Get loyalty stats

### 🎲 PizzaPartyAdvancedRandomness
**Features:**
- Multi-party commit-reveal randomness
- Entropy contribution from multiple sources
- Round-based randomness collection
- Anti-manipulation measures
- Reputation system for contributors

**Key Functions:**
- `startNewRound()` - Start new randomness round
- `commitEntropy(commitment)` - Commit entropy
- `revealEntropy(entropy, salt)` - Reveal entropy
- `generateRandomNumber(seed, maxValue)` - Generate random number

### 📊 PizzaPartyAnalytics
**Features:**
- Batch player processing
- Gas optimization
- Game statistics tracking
- Performance analytics
- Data aggregation

**Key Functions:**
- `recordPlayerActivity(player, entries, rewards)` - Record activity
- `processPlayerBatch(players, entries, rewards)` - Process batch
- `updateGameAnalytics()` - Update game stats
- `calculateOptimalBatchSize()` - Optimize batch size

### 🎯 PizzaPartyWeeklyChallenges
**Features:**
- Weekly challenge creation and management
- Challenge completion tracking
- Reward distribution with streak bonuses
- Challenge leaderboards
- Multiple categories and difficulty levels

**Key Functions:**
- `createChallenge(title, description, reward, difficulty, category)` - Create challenge
- `joinChallenge(challengeId)` - Join challenge
- `completeChallenge(challengeId, proof)` - Complete challenge
- `getChallengeInfo(challengeId)` - Get challenge details

## 🚀 Deployment

### Deploy All Advanced Contracts
```bash
npx hardhat run scripts/deploy-advanced-contracts.js --network base
```

### Contract Addresses
After deployment, you'll get addresses for all contracts in `advanced-contracts-deployment.json`.

## 🔧 Integration Guide

### 1. Frontend Integration
Update your frontend to interact with multiple contracts:

```javascript
// Example: Using referral system
const referralContract = new ethers.Contract(REFERRAL_ADDRESS, REFERRAL_ABI, signer);
await referralContract.createReferralCode();

// Example: Using loyalty system
const loyaltyContract = new ethers.Contract(LOYALTY_ADDRESS, LOYALTY_ABI, signer);
await loyaltyContract.redeemPoints(100);
```

### 2. Game Logic Integration
Modify your game logic to use the appropriate contracts:

```javascript
// For entry fees
const pricingContract = new ethers.Contract(PRICING_ADDRESS, PRICING_ABI, signer);
const entryFee = await pricingContract.getCurrentEntryFee();

// For loyalty points
const loyaltyContract = new ethers.Contract(LOYALTY_ADDRESS, LOYALTY_ABI, signer);
await loyaltyContract.awardEntryPoints(playerAddress);
```

### 3. Winner Selection Integration
The core winner selection still uses `PizzaPartyCore` with VRF, but you can add advanced randomness:

```javascript
// For advanced randomness
const randomnessContract = new ethers.Contract(RANDOMNESS_ADDRESS, RANDOMNESS_ABI, signer);
await randomnessContract.commitEntropy(commitment);
```

## 📈 Benefits of Modular System

### ✅ Size Compliance
- Each contract stays under 24,576 byte limit
- No more deployment size errors
- Easy to deploy and verify

### ✅ Feature Separation
- Clear separation of concerns
- Easy to maintain and upgrade
- Independent feature development

### ✅ Gas Optimization
- Only deploy features you need
- Optimize gas usage per feature
- Batch processing capabilities

### ✅ Scalability
- Add new features without affecting core
- Upgrade individual components
- Better testing and debugging

## 🔄 Contract Interactions

### Core Game Flow
1. **Entry**: `PizzaPartyCore.enterDailyGame()` + `PizzaPartyDynamicPricing.collectEntryFee()`
2. **Loyalty**: `PizzaPartyLoyalty.awardEntryPoints()` + `PizzaPartyLoyalty.awardSpendingPoints()`
3. **Referral**: `PizzaPartyReferral.processReferralCode()` (if applicable)
4. **Analytics**: `PizzaPartyAnalytics.recordPlayerActivity()`
5. **Winner Selection**: `PizzaPartyCore.processDailyWinners()` (with VRF)

### Advanced Features Flow
1. **Weekly Challenges**: `PizzaPartyWeeklyChallenges.joinChallenge()` + `PizzaPartyWeeklyChallenges.completeChallenge()`
2. **Advanced Randomness**: `PizzaPartyAdvancedRandomness.commitEntropy()` + `PizzaPartyAdvancedRandomness.revealEntropy()`
3. **Batch Processing**: `PizzaPartyAnalytics.processPlayerBatch()`

## 🛡️ Security Features

### All Contracts Include:
- **ReentrancyGuard** - Prevents reentrancy attacks
- **Ownable** - Access control for admin functions
- **Pausable** - Emergency pause functionality
- **Input Validation** - Sanitized inputs
- **Rate Limiting** - Cooldown periods
- **Blacklisting** - User management

### Additional Security:
- **Referral**: Code format validation, expiry management
- **Dynamic Pricing**: Price deviation protection
- **Loyalty**: Tier-based access control
- **Randomness**: Multi-party verification
- **Analytics**: Gas optimization thresholds
- **Challenges**: Completion verification

## 📊 Monitoring and Analytics

### Contract Metrics
- **Gas Usage**: Track gas consumption per contract
- **User Activity**: Monitor feature usage
- **Performance**: Optimize based on analytics
- **Rewards**: Track reward distribution

### Key Events to Monitor
- `ReferralCodeGenerated` - Referral system usage
- `DynamicFeeCalculated` - Pricing changes
- `PointsEarned` - Loyalty system activity
- `RoundCompleted` - Randomness generation
- `BatchProcessed` - Analytics performance
- `ChallengeCompleted` - Challenge participation

## 🚀 Next Steps

### Immediate Actions
1. **Deploy Contracts**: Run the deployment script
2. **Update Frontend**: Integrate with new contract addresses
3. **Test Features**: Verify all functionality works
4. **Monitor Performance**: Track gas usage and optimization

### Future Enhancements
1. **Cross-Contract Integration**: Add more contract interactions
2. **Advanced Analytics**: Implement more detailed tracking
3. **Feature Expansion**: Add new specialized contracts
4. **Optimization**: Further gas and performance improvements

## 📞 Support

If you need help with:
- **Contract Integration**: Check the integration examples
- **Feature Configuration**: Review the contract documentation
- **Deployment Issues**: Check the deployment logs
- **Performance Optimization**: Monitor the analytics contract

---

**🎉 Congratulations!** You now have a complete, modular Pizza Party game system with all the advanced features you requested, while staying within contract size limits!
