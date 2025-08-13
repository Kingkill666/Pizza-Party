# 🍕 Frontend Integration Guide - Advanced Pizza Party Contracts

## 📋 Overview

This guide explains how to integrate the new modular Pizza Party contracts into your frontend application. The system has been upgraded from a single large contract to a modular architecture with 6 specialized contracts.

## 🚀 Quick Start

### 1. Updated Contract Addresses

All new contract addresses are now available in `lib/contract-config.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  // Core contracts
  PIZZA_PARTY_CORE: "0xCD8a3a397CdE223c47602d2C37a3b8a5B99a6460",
  VMF_TOKEN: "0x2213414893259b0C48066Acd1763e7fbA97859E5",
  
  // New Advanced Modular Contracts
  PIZZA_PARTY_REFERRAL: "0xb976e0400e88f78AA85029D138fFD11A65de9CE8",
  PIZZA_PARTY_DYNAMIC_PRICING: "0x0F5a91907039eecebEA78ad2d327C7521d4F7892",
  PIZZA_PARTY_LOYALTY: "0xC8a44e0587f7BeDa623b75DF5415E85Bf1163ac7",
  PIZZA_PARTY_ADVANCED_RANDOMNESS: "0xCcF33C77A65849e19Df6e66A9daEBC112D5BDBCE",
  PIZZA_PARTY_ANALYTICS: "0xf32156203A70Bbf1e3db6C664F3F7eA8310a8841",
  PIZZA_PARTY_WEEKLY_CHALLENGES: "0x87fee21FB855Ae44600B79b38709E4587f5b60CF",
  
  // Chainlink VRF
  CHAINLINK_VRF: "0xefAe49039ADB963b1183869D1632D4CbC8F0603b"
};
```

### 2. Using the Advanced Contracts Service

The easiest way to interact with the new contracts is using the `AdvancedContractsService`:

```typescript
import { AdvancedContractsService } from '@/lib/services/advanced-contracts-service'
import { ethers } from 'ethers'

// Initialize the service
const provider = new ethers.BrowserProvider(window.ethereum)
const service = new AdvancedContractsService(provider)

// For transactions, get a signer
const signer = await provider.getSigner()
const serviceWithSigner = new AdvancedContractsService(provider, signer)
```

### 3. Using the Custom Hook

For React components, use the `useAdvancedContracts` hook:

```typescript
import { useAdvancedContracts } from '@/hooks/useAdvancedContracts'

function MyComponent() {
  const {
    enterDailyGame,
    getDailyJackpot,
    getPlayerToppings,
    createReferralCode,
    isLoading,
    error
  } = useAdvancedContracts()

  const handleEnterGame = async () => {
    try {
      await enterDailyGame()
      console.log('Successfully entered daily game!')
    } catch (err) {
      console.error('Failed to enter game:', err)
    }
  }

  return (
    <div>
      <button onClick={handleEnterGame} disabled={isLoading}>
        {isLoading ? 'Entering...' : 'Enter Daily Game'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

## 🔧 Core Game Functions

### Enter Daily Game
```typescript
// Using the service directly
const tx = await service.enterDailyGame()

// Using the hook
const { enterDailyGame } = useAdvancedContracts()
await enterDailyGame()
```

### Get Game Information
```typescript
// Get current game ID
const gameId = await service.getCurrentGameId()

// Get jackpots
const dailyJackpot = await service.getDailyJackpotFormatted()
const weeklyJackpot = await service.getWeeklyJackpotFormatted()

// Check if draws are ready
const isDailyReady = await service.isDailyDrawReady()
const isWeeklyReady = await service.isWeeklyDrawReady()

// Get player toppings
const toppings = await service.getPlayerToppings(playerAddress)
```

## 🔗 Referral System

### Create Referral Code
```typescript
const referralCode = await service.createReferralCode()
console.log('Your referral code:', referralCode)
```

### Process Referral Code
```typescript
const success = await service.processReferralCode('PIZZA123ABC')
if (success) {
  console.log('Referral processed successfully!')
}
```

### Get Referral Information
```typescript
// Get info about a specific referral code
const codeInfo = await service.getReferralCodeInfo('PIZZA123ABC')
console.log('Code creator:', codeInfo.creator)
console.log('Uses:', codeInfo.uses)
console.log('Total rewards:', codeInfo.totalRewards)

// Get user's referral data
const userData = await service.getUserReferralData(userAddress)
console.log('User referral code:', userData.referralCode)
console.log('Total referrals:', userData.totalReferrals)
```

## 💰 Dynamic Pricing

### Get Current Entry Fee
```typescript
const entryFee = await service.getCurrentEntryFeeFormatted()
console.log('Current entry fee:', entryFee, 'VMF')
```

### Get VMF Price
```typescript
const vmfPrice = await service.getVMFPriceFormatted()
console.log('Current VMF price:', vmfPrice, 'USD')
```

### Calculate Dynamic Fee
```typescript
const [feeAmount, vmfPrice] = await service.calculateDynamicEntryFee()
console.log('Dynamic fee:', feeAmount.toString(), 'wei')
console.log('VMF price used:', vmfPrice.toString(), 'wei')
```

## 🏆 Loyalty System

### Get User Loyalty Data
```typescript
const loyaltyData = await service.getUserLoyaltyData(userAddress)
console.log('Total points:', loyaltyData.totalPoints)
console.log('Current tier:', loyaltyData.currentTier)
console.log('Streak days:', loyaltyData.streakDays)
console.log('Total rewards:', loyaltyData.totalRewards)
```

### Redeem Points
```typescript
const rewardAmount = await service.redeemPoints(userAddress, 1000)
console.log('Redeemed 1000 points for:', rewardAmount.toString(), 'VMF')
```

### Award Points (Admin/System Functions)
```typescript
// Award points for game entry
await service.awardEntryPoints(userAddress)

// Award points for spending
await service.awardSpendingPoints(userAddress, ethers.parseEther('100'))

// Award custom points
await service.awardLoyaltyPoints(userAddress, 500, 'Special Event Bonus')
```

## 🎲 Advanced Randomness

### Start New Round
```typescript
const roundId = await service.startNewRound()
console.log('Started new randomness round:', roundId)
```

### Commit Entropy
```typescript
const entropy = ethers.randomBytes(32)
const entropyHash = ethers.keccak256(entropy)
await service.commitEntropy(roundId, entropyHash)
```

### Reveal Entropy
```typescript
const salt = ethers.randomBytes(32)
await service.revealEntropy(roundId, entropy, salt)
```

### Complete Round
```typescript
const finalSeed = await service.completeRound(roundId)
console.log('Final randomness seed:', finalSeed)
```

### Generate Random Number
```typescript
const randomNumber = await service.generateRandomNumber(finalSeed)
console.log('Random number:', randomNumber.toString())
```

## 📊 Analytics

### Record Player Activity
```typescript
await service.recordPlayerActivity(
  userAddress,
  'game_entry',
  ethers.parseEther('1')
)
```

### Get Player Analytics
```typescript
const analytics = await service.getPlayerAnalytics(userAddress)
console.log('Total activities:', analytics.totalActivities)
console.log('Last activity:', analytics.lastActivity)
console.log('Total value:', analytics.totalValue.toString())
```

### Get Analytics Summary
```typescript
const summary = await service.getAnalyticsSummary()
console.log('Total players:', summary.totalPlayers)
console.log('Total activities:', summary.totalActivities)
console.log('Total value:', summary.totalValue.toString())
```

## 🎯 Weekly Challenges

### Get Challenge Information
```typescript
const challengeInfo = await service.getChallengeInfo(challengeId)
console.log('Challenge title:', challengeInfo.title)
console.log('Description:', challengeInfo.description)
console.log('Reward amount:', challengeInfo.rewardAmount.toString())
console.log('Is active:', challengeInfo.isActive)
```

### Join Challenge
```typescript
await service.joinChallenge(challengeId)
console.log('Successfully joined challenge!')
```

### Complete Challenge
```typescript
const reward = await service.completeChallenge(challengeId)
console.log('Challenge completed! Reward:', reward.toString(), 'VMF')
```

### Get User Challenge Data
```typescript
const challengeData = await service.getUserChallengeData(userAddress)
console.log('Total challenges:', challengeData.totalChallenges)
console.log('Completed challenges:', challengeData.completedChallenges)
console.log('Total rewards:', challengeData.totalRewards.toString())
```

## 🔄 Migration from Old Contracts

### What Changed

1. **Contract Structure**: Single large contract → 6 modular contracts
2. **Function Names**: Some functions have been renamed or moved
3. **Return Types**: Some functions now return BigInt instead of numbers
4. **Gasless Transactions**: Temporarily disabled in new system

### Migration Checklist

- [ ] Update contract addresses in your configuration
- [ ] Replace `createPizzaPartyContract()` calls with `AdvancedContractsService`
- [ ] Update function calls to use new service methods
- [ ] Handle BigInt return types properly
- [ ] Test all functionality with new contracts
- [ ] Update error handling for new contract structure

### Common Migration Patterns

**Old:**
```typescript
const contract = createPizzaPartyContract(window.ethereum)
const jackpot = await contract.getCurrentJackpot()
```

**New:**
```typescript
const service = new AdvancedContractsService(provider)
const jackpot = await service.getDailyJackpotFormatted()
```

**Old:**
```typescript
const toppings = await contract.getPlayerToppings(address)
```

**New:**
```typescript
const toppings = await service.getPlayerToppings(address)
// Returns BigInt, convert to string for display
const toppingsDisplay = toppings.toString()
```

## 🛠️ Error Handling

### Common Errors and Solutions

1. **"Service not initialized"**
   - Ensure window.ethereum is available
   - Check if provider is properly connected

2. **"Failed to get signer"**
   - User needs to connect wallet
   - Check if wallet is unlocked

3. **"Contract call failed"**
   - Check if contract is deployed
   - Verify contract addresses are correct
   - Check if user has sufficient VMF balance

### Error Handling Example

```typescript
const { enterDailyGame, error, isLoading } = useAdvancedContracts()

const handleEnterGame = async () => {
  try {
    await enterDailyGame()
    // Success handling
  } catch (err: any) {
    if (err.message.includes('insufficient balance')) {
      alert('You need more VMF tokens to enter the game')
    } else if (err.message.includes('already entered')) {
      alert('You have already entered today')
    } else {
      alert('Failed to enter game: ' + err.message)
    }
  }
}
```

## 🧪 Testing

### Test Contract Integration

```typescript
// Test basic functionality
const testBasicFunctions = async () => {
  const service = new AdvancedContractsService(provider)
  
  // Test read functions
  const gameId = await service.getCurrentGameId()
  const dailyJackpot = await service.getDailyJackpot()
  const vmfPrice = await service.getVMFPrice()
  
  console.log('Game ID:', gameId)
  console.log('Daily Jackpot:', dailyJackpot.toString())
  console.log('VMF Price:', vmfPrice.toString())
}

// Test transaction functions
const testTransactions = async () => {
  const signer = await provider.getSigner()
  const service = new AdvancedContractsService(provider, signer)
  
  // Test entering game
  const tx = await service.enterDailyGame()
  await tx.wait()
  console.log('Successfully entered game!')
}
```

## 📚 Additional Resources

- **Contract Documentation**: See `MODULAR_CONTRACTS_SYSTEM.md`
- **Deployment Info**: See `advanced-contracts-deployment.json`
- **Contract Source**: See `contracts/` directory
- **Type Definitions**: See `typechain-types/` directory

## 🆘 Support

If you encounter issues:

1. Check the contract addresses are correct
2. Verify your wallet is connected to Base mainnet
3. Ensure you have sufficient VMF tokens
4. Check the browser console for detailed error messages
5. Review the contract ABIs in `lib/contract-config.ts`

---

**🎉 Congratulations!** Your frontend is now integrated with the advanced modular Pizza Party contract system!
