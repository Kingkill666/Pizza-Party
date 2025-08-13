# 🍕 Pizza Party - Simplified Contract System

## Overview

The Pizza Party game now uses a **simplified, streamlined contract architecture** with only **3 essential contracts** that handle all game functionality efficiently.

## 🎯 **Active Contracts (3 Total)**

### 1. **PizzaPartyCore** - Main Game Contract
**Address:** `0xCD8a3a397CdE223c47602d2C37a3b8a5B99a6460`

**Purpose:** Central game logic and state management
- Daily and weekly game entry
- Jackpot management
- Player tracking and eligibility
- Winner processing
- VRF integration

**Key Functions:**
```solidity
function enterDailyGame() external
function processDailyWinners() external
function processWeeklyWinners() external
function getCurrentGameId() external view returns (uint256)
function getDailyJackpot() external view returns (uint256)
function getWeeklyJackpot() external view returns (uint256)
function getEligibleDailyPlayers(uint256 gameId) external view returns (address[] memory)
function getEligibleWeeklyPlayers(uint256 gameId) external view returns (address[] memory)
```

### 2. **VMF_TOKEN** - Token Contract
**Address:** `0x2213414893259b0C48066Acd1763e7fbA97859E5`

**Purpose:** VMF token for game payments and rewards
- Token transfers for entry fees
- Winner prize distribution
- Balance checking

### 3. **ChainlinkVRF** - Automated Randomness
**Address:** `0xefAe49039ADB963b1183869D1632D4CbC8F0603b`

**Purpose:** Automated winner selection using Chainlink VRF v2.5
- Daily winner selection at 12pm PST
- Weekly winner selection at 12pm PST on Mondays
- Verifiable randomness for fair selection
- Automatic prize distribution

**Key Functions:**
```solidity
function requestDailyRandomness() external
function requestWeeklyRandomness() external
function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external
```

## 🚀 **Deployment**

### Quick Deploy (Recommended)
```bash
npx hardhat run scripts/deploy-all-contracts.js --network base
```

This deploys all 3 essential contracts:
1. FreeRandomness (utility)
2. FreePriceOracle (utility)
3. UniswapPriceOracle (utility)
4. ChainlinkVRF (automated randomness)
5. PizzaPartyCore (main game)

### Manual Deploy
```bash
# Deploy PizzaPartyCore
npx hardhat run scripts/deploy-pizza-party-core.js --network base

# Deploy ChainlinkVRF
npx hardhat run scripts/deploy-chainlink-vrf.js --network base
```

## 🔗 **Contract Verification**

Verify all contracts on BaseScan:
```bash
npx hardhat run scripts/verify-all-contracts.js --network base
```

## 📊 **Benefits of Simplified System**

### ✅ **Advantages:**
- **Reduced Complexity:** Only 3 contracts to manage
- **Lower Gas Costs:** Fewer contract interactions
- **Easier Maintenance:** Simpler codebase
- **Better Security:** Fewer attack vectors
- **Faster Development:** Less integration work
- **Cleaner Frontend:** Simpler contract interactions

### 🎯 **Game Features:**
- ✅ Daily game entry (8 winners)
- ✅ Weekly game entry (10 winners)
- ✅ Automated winner selection
- ✅ Chainlink VRF randomness
- ✅ Jackpot management
- ✅ Player tracking
- ✅ VMF token integration

## 🔧 **Frontend Integration**

### Using AdvancedContractsService
```typescript
import { AdvancedContractsService } from '@/lib/services/advanced-contracts-service'

const service = new AdvancedContractsService(provider, signer)

// Enter daily game
await service.enterDailyGame()

// Get current game stats
const gameId = await service.getCurrentGameId()
const dailyJackpot = await service.getDailyJackpot()
const weeklyJackpot = await service.getWeeklyJackpot()
```

### Using React Hook
```typescript
import { useAdvancedContracts } from '@/hooks/useAdvancedContracts'

const { enterDailyGame, getCurrentGameId, isLoading, error } = useAdvancedContracts()

// Enter game
await enterDailyGame()
```

## 🎮 **Game Flow**

1. **Player Entry:** Users call `enterDailyGame()` on PizzaPartyCore
2. **Automatic Selection:** ChainlinkVRF selects winners at scheduled times
3. **Prize Distribution:** VMF tokens automatically sent to winners
4. **State Updates:** Game state updated for next round

## 🔒 **Security Features**

- **ReentrancyGuard:** Prevents reentrancy attacks
- **Ownable:** Admin functions protected
- **Pausable:** Emergency pause functionality
- **Input Validation:** All inputs validated
- **Chainlink VRF:** Verifiable randomness
- **Rate Limiting:** Prevents spam

## 📈 **Monitoring**

### Automated Systems
- **Scheduled Winner Selection:** Runs automatically
- **VRF Monitoring:** Tracks randomness requests
- **Payment Logging:** Records all prize distributions

### Manual Monitoring
- **Contract Events:** Monitor game events
- **BaseScan:** Track transactions and state
- **Analytics:** Player activity and jackpot growth

## 🚀 **Next Steps**

1. **Test Game Flow:** Verify all functions work correctly
2. **Monitor VRF:** Ensure automated winner selection works
3. **Frontend Testing:** Test all user interactions
4. **Production Launch:** Deploy to mainnet

---

**🎉 The simplified system provides all the functionality you need with much less complexity!**
