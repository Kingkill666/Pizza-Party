# 🍕 Pizza Party - Frontend Integration Guide

## 🎯 **Simplified Contract System**

The Pizza Party game now uses a **streamlined architecture** with only **3 essential contracts** that provide all necessary functionality.

## 📋 **Updated Contract Addresses**

### **Core Game Contracts**

```typescript
// lib/contract-config.ts
export const CONTRACT_ADDRESSES = {
  // Core Game Contracts
  PIZZA_PARTY_CORE: "0xCD8a3a397CdE223c47602d2C37a3b8a5B99a6460",
  VMF_TOKEN: "0x2213414893259b0C48066Acd1763e7fbA97859E5",
  CHAINLINK_VRF: "0xefAe49039ADB963b1183869D1632D4CbC8F0603b",
  
  // Utility Contracts
  FREE_RANDOMNESS: "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255",
  FREE_PRICE_ORACLE: "0x28FCF71EBEAc23Ba02c86aF69f289425db56e049",
  UNISWAP_PRICE_ORACLE: "0x9B3d675FD42f1eC93E6f221E95c9c824B0d29F31",
}
```

## 🔧 **Using AdvancedContractsService**

### **Initialization**

```typescript
import { AdvancedContractsService } from '@/lib/services/advanced-contracts-service'
import { ethers } from 'ethers'

// Initialize with provider and signer
const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()
const service = new AdvancedContractsService(provider, signer)
```

### **Core Game Functions**

```typescript
// Enter daily game
await service.enterDailyGame()

// Get current game stats
const gameId = await service.getCurrentGameId()
const dailyJackpot = await service.getDailyJackpot()
const weeklyJackpot = await service.getWeeklyJackpot()

// Get player info
const playerToppings = await service.getPlayerToppings(userAddress)
const playerBalance = await service.getVMFBalance(userAddress)
```

### **Jackpot Functions**

```typescript
// Get jackpot amounts
const dailyJackpot = await service.getDailyJackpot()
const weeklyJackpot = await service.getWeeklyJackpot()

// Get formatted jackpot amounts
const dailyJackpotFormatted = await service.getDailyJackpotFormatted()
const weeklyJackpotFormatted = await service.getWeeklyJackpotFormatted()
```

### **VMF Token Functions**

```typescript
// Get VMF balance
const balance = await service.getVMFBalance(userAddress)
const balanceFormatted = await service.getVMFBalanceFormatted(userAddress)

// Check allowance
const allowance = await service.getVMFAllowance(userAddress, contractAddress)
```

## 🎣 **Using React Hook**

### **Setup**

```typescript
import { useAdvancedContracts } from '@/hooks/useAdvancedContracts'

function GameComponent() {
  const { 
    enterDailyGame, 
    getCurrentGameId, 
    getDailyJackpot,
    getWeeklyJackpot,
    getPlayerToppings,
    getVMFBalance,
    isLoading, 
    error 
  } = useAdvancedContracts()

  // Use the functions...
}
```

### **Example Usage**

```typescript
function GameComponent() {
  const { enterDailyGame, getDailyJackpot, isLoading, error } = useAdvancedContracts()
  const [jackpot, setJackpot] = useState('0')

  useEffect(() => {
    const loadJackpot = async () => {
      try {
        const dailyJackpot = await getDailyJackpot()
        setJackpot(dailyJackpot.toString())
      } catch (err) {
        console.error('Failed to load jackpot:', err)
      }
    }
    loadJackpot()
  }, [getDailyJackpot])

  const handleEnterGame = async () => {
    try {
      await enterDailyGame()
      console.log('Successfully entered game!')
    } catch (err) {
      console.error('Failed to enter game:', err)
    }
  }

  return (
    <div>
      <p>Daily Jackpot: {jackpot} VMF</p>
      <button onClick={handleEnterGame} disabled={isLoading}>
        {isLoading ? 'Entering...' : 'Enter Game'}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

## 🎮 **Game Integration Examples**

### **Enter Daily Game**

```typescript
const handleEnterDailyGame = async () => {
  try {
    const service = new AdvancedContractsService(provider, signer)
    const tx = await service.enterDailyGame()
    await tx.wait()
    console.log('✅ Successfully entered daily game!')
  } catch (error) {
    console.error('❌ Failed to enter game:', error)
  }
}
```

### **Get Game Statistics**

```typescript
const getGameStats = async () => {
  try {
    const service = new AdvancedContractsService(provider, signer)
    
    const gameId = await service.getCurrentGameId()
    const dailyJackpot = await service.getDailyJackpot()
    const weeklyJackpot = await service.getWeeklyJackpot()
    const playerToppings = await service.getPlayerToppings(userAddress)
    
    console.log('Game ID:', gameId.toString())
    console.log('Daily Jackpot:', dailyJackpot.toString(), 'VMF')
    console.log('Weekly Jackpot:', weeklyJackpot.toString(), 'VMF')
    console.log('Player Toppings:', playerToppings.toString())
  } catch (error) {
    console.error('Failed to get game stats:', error)
  }
}
```

### **Check Player Balance**

```typescript
const checkPlayerBalance = async (userAddress: string) => {
  try {
    const service = new AdvancedContractsService(provider, signer)
    const balance = await service.getVMFBalance(userAddress)
    const balanceFormatted = await service.getVMFBalanceFormatted(userAddress)
    
    console.log('VMF Balance:', balance.toString(), 'wei')
    console.log('VMF Balance:', balanceFormatted, 'VMF')
  } catch (error) {
    console.error('Failed to check balance:', error)
  }
}
```

## 🔄 **Migration from Old System**

### **What Changed:**

1. **Removed Unused Contracts:** All advanced modular contracts removed
2. **Simplified Service:** Only essential functions available
3. **Cleaner Architecture:** 3 contracts instead of 10+

### **What Stays the Same:**

1. **Core Functions:** `enterDailyGame()`, `getCurrentGameId()`, etc.
2. **Service Pattern:** Same `AdvancedContractsService` usage
3. **Hook Pattern:** Same `useAdvancedContracts` hook
4. **Error Handling:** Same error handling patterns

### **Migration Steps:**

1. **Update Imports:** No changes needed
2. **Update Service Calls:** Remove unused function calls
3. **Update Error Handling:** Same error handling
4. **Test Integration:** Verify all functions work

## 🚨 **Common Errors & Solutions**

### **Network Connection Issues**

```typescript
// Error: Failed to fetch
// Solution: Check RPC endpoint and network connection
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org')
```

### **Insufficient Balance**

```typescript
// Error: insufficient funds
// Solution: Check VMF balance before entering game
const balance = await service.getVMFBalance(userAddress)
if (balance < requiredAmount) {
  console.log('Insufficient VMF balance')
}
```

### **Contract Not Found**

```typescript
// Error: contract not found
// Solution: Verify contract addresses are correct
console.log('Contract addresses:', CONTRACT_ADDRESSES)
```

## 🧪 **Testing Examples**

### **Test Game Entry**

```typescript
const testGameEntry = async () => {
  try {
    const service = new AdvancedContractsService(provider, signer)
    
    // Get initial state
    const initialGameId = await service.getCurrentGameId()
    console.log('Initial Game ID:', initialGameId.toString())
    
    // Enter game
    const tx = await service.enterDailyGame()
    await tx.wait()
    console.log('✅ Game entry successful!')
    
    // Check updated state
    const updatedGameId = await service.getCurrentGameId()
    console.log('Updated Game ID:', updatedGameId.toString())
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}
```

### **Test Jackpot Retrieval**

```typescript
const testJackpotRetrieval = async () => {
  try {
    const service = new AdvancedContractsService(provider, signer)
    
    const dailyJackpot = await service.getDailyJackpot()
    const weeklyJackpot = await service.getWeeklyJackpot()
    
    console.log('Daily Jackpot:', dailyJackpot.toString(), 'wei')
    console.log('Weekly Jackpot:', weeklyJackpot.toString(), 'wei')
    
    const dailyFormatted = await service.getDailyJackpotFormatted()
    const weeklyFormatted = await service.getWeeklyJackpotFormatted()
    
    console.log('Daily Jackpot:', dailyFormatted, 'VMF')
    console.log('Weekly Jackpot:', weeklyFormatted, 'VMF')
  } catch (error) {
    console.error('❌ Jackpot test failed:', error)
  }
}
```

## 📞 **Support**

### **Getting Help**

1. **Check Documentation:** Review this guide and other .md files
2. **Test Functions:** Use the testing examples above
3. **Check Console:** Look for error messages in browser console
4. **Verify Contracts:** Ensure contracts are deployed and verified

### **Common Issues**

- **RPC Issues:** Try different RPC endpoints
- **Network Issues:** Ensure you're on Base mainnet
- **Balance Issues:** Check VMF token balance
- **Contract Issues:** Verify contract addresses

---

**🎉 The simplified system makes integration much easier!**

**🍕 Happy Pizza Partying! 🎮**
