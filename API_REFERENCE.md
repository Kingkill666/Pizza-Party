# API Reference

## Overview

The Pizza Party dApp consists of several key components working together to create a decentralized gaming platform. This document provides comprehensive API documentation, architectural diagrams, and usage examples.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pizza Party dApp Architecture               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Frontend  │    │   Smart     │    │   VMF       │        │
│  │   (Next.js) │◄──►│   Contract  │◄──►│   Token     │        │
│  │             │    │   (Base)    │    │   Contract  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Wallet     │    │  Game       │    │  Referral   │        │
│  │  Integration│    │  Logic      │    │  System     │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Jackpot    │    │  Toppings   │    │  Multi-     │        │
│  │  System     │    │  Rewards    │    │  Platform   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
User Action → Wallet Connection → Smart Contract → VMF Transfer → Game Entry
     ↓              ↓                ↓              ↓              ↓
localStorage ← UI Update ← Event Emission ← Balance Check ← Entry Validation
     ↓              ↓                ↓              ↓              ↓
Jackpot Calc ← Toppings Award ← Referral Process ← Daily/Weekly Logic
```

## Smart Contract API

### PizzaParty Contract

#### Core Functions

##### `enterDailyGame(string memory referralCode)`
Enter the daily game with optional referral code.

**Parameters:**
- `referralCode` (string): Optional referral code

**Requirements:**
- User must have at least $1 worth of VMF token
- User must not have entered today
- User must not be blacklisted

**Events:**
- `PlayerEntered(address indexed player, uint256 gameId, uint256 entryFee)`
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`

**Example Usage:**
```solidity
// Enter without referral
await pizzaParty.enterDailyGame("");

// Enter with referral code
await pizzaParty.enterDailyGame("FRIEND123");
```

##### `createReferralCode()`
Create a unique referral code for the player.

**Requirements:**
- Player must not already have a referral code
- Player must not be blacklisted

**Events:**
- `ReferralCreated(address indexed referrer, string referralCode)`

**Example Usage:**
```solidity
// Create referral code
await pizzaParty.createReferralCode();
// Returns: "ABC123" (example referral code)
```

##### `awardVMFHoldingsToppings()`
Award toppings based on VMF token holdings.

**Requirements:**
- Player must not be blacklisted

**Events:**
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`

**Example Usage:**
```solidity
// Award toppings based on VMF holdings
await pizzaParty.awardVMFHoldingsToppings();
// 1 topping per 10 VMF held
```

#### Admin Functions

##### `drawDailyWinners()`
Draw 8 random winners for daily game.

**Requirements:**
- Only owner can call
- Game must be completed

**Events:**
- `DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount)`

**Example Usage:**
```solidity
// Draw daily winners (admin only)
await pizzaParty.drawDailyWinners();
// Returns: Array of 8 winner addresses
```

##### `drawWeeklyWinners()`
Draw 10 random winners for weekly game.

**Requirements:**
- Only owner can call
- Weekly draw must be ready

**Events:**
- `WeeklyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount)`

**Example Usage:**
```solidity
// Draw weekly winners (admin only)
await pizzaParty.drawWeeklyWinners();
// Returns: Array of 10 winner addresses
```

##### `emergencyPause(bool pause)`
Pause/unpause contract in emergency.

**Requirements:**
- Only owner can call

**Events:**
- `EmergencyPause(bool paused)`

**Example Usage:**
```solidity
// Pause contract
await pizzaParty.emergencyPause(true);

// Unpause contract
await pizzaParty.emergencyPause(false);
```

##### `setPlayerBlacklist(address player, bool blacklisted)`
Blacklist/unblacklist specific players.

**Requirements:**
- Only owner can call

**Events:**
- `PlayerBlacklisted(address indexed player, bool blacklisted)`

**Example Usage:**
```solidity
// Blacklist player
await pizzaParty.setPlayerBlacklist("0x123...", true);

// Remove from blacklist
await pizzaParty.setPlayerBlacklist("0x123...", false);
```

##### `emergencyWithdraw()`
Withdraw accumulated VMF (emergency only).

**Requirements:**
- Only owner can call
- Contract must have balance

**Example Usage:**
```solidity
// Emergency withdraw (admin only)
await pizzaParty.emergencyWithdraw();
```

#### View Functions

##### `hasEnteredToday(address player)`
Check if player has entered today's game.

**Returns:**
- `bool`: True if player has entered today

**Example Usage:**
```solidity
// Check if player has entered today
const hasEntered = await pizzaParty.hasEnteredToday("0x123...");
// Returns: true/false
```

##### `getPlayerInfo(address player)`
Get complete player information.

**Returns:**
```solidity
struct Player {
    uint256 totalToppings;
    uint256 dailyEntries;
    uint256 weeklyEntries;
    uint256 lastEntryTime;
    uint256 streakDays;
    uint256 lastStreakUpdate;
    bool isBlacklisted;
}
```

**Example Usage:**
```solidity
// Get player info
const playerInfo = await pizzaParty.getPlayerInfo("0x123...");
console.log("Total toppings:", playerInfo.totalToppings);
console.log("Daily entries:", playerInfo.dailyEntries);
console.log("Streak days:", playerInfo.streakDays);
```

## Frontend Component APIs

### Wallet Configuration (`lib/wallet-config.ts`)

The wallet configuration system provides multi-platform wallet support with automatic detection and connection management.

#### Architecture

```
Wallet Detection → Platform Check → Connection Method → Error Handling
     ↓                ↓                ↓                ↓
Mobile Wallet    Desktop Wallet   Connection State   User Feedback
     ↓                ↓                ↓                ↓
Deep Linking     Extension API    localStorage       Toast Messages
```

#### Core Functions

##### `detectPlatform()`
Detect the current platform (mobile/desktop) and available wallets.

**Returns:**
```typescript
interface PlatformInfo {
  isMobile: boolean;
  isDesktop: boolean;
  availableWallets: string[];
  recommendedWallet: string;
}
```

**Example Usage:**
```typescript
import { detectPlatform } from '@/lib/wallet-config';

const platform = detectPlatform();
console.log('Platform:', platform.isMobile ? 'Mobile' : 'Desktop');
console.log('Available wallets:', platform.availableWallets);
```

##### `requestWalletConnection(walletId: string)`
Request connection to a specific wallet.

**Parameters:**
- `walletId` (string): Wallet identifier (e.g., 'metamask', 'coinbase', 'trust')

**Returns:**
```typescript
interface WalletConnection {
  address: string;
  walletId: string;
  isConnected: boolean;
  chainId: number;
}
```

**Example Usage:**
```typescript
import { requestWalletConnection } from '@/lib/wallet-config';

try {
  const connection = await requestWalletConnection('metamask');
  console.log('Connected to:', connection.address);
} catch (error) {
  console.error('Connection failed:', error.message);
}
```

##### `connectMobileWallet(walletId: string)`
Connect to mobile wallet with deep linking support.

**Parameters:**
- `walletId` (string): Mobile wallet identifier

**Example Usage:**
```typescript
import { connectMobileWallet } from '@/lib/wallet-config';

const mobileConnection = await connectMobileWallet('trust');
// Opens Trust Wallet app via deep link
```

#### Error Handling

```typescript
// Comprehensive error handling example
try {
  const connection = await requestWalletConnection('metamask');
} catch (error) {
  if (error.code === 'WALLET_NOT_FOUND') {
    // Handle missing wallet
    showInstallPrompt('metamask');
  } else if (error.code === 'USER_REJECTED') {
    // Handle user rejection
    showToast('Connection cancelled by user');
  } else if (error.code === 'NETWORK_MISMATCH') {
    // Handle wrong network
    showNetworkSwitchPrompt();
  }
}
```

### Jackpot Data System (`lib/jackpot-data.ts`)

The jackpot data system manages real-time calculations for daily and weekly jackpots, player statistics, and topping rewards.

#### Architecture

```
localStorage Data → Real-time Calculation → UI Updates → Persistence
     ↓                    ↓                    ↓            ↓
Player Entries      Jackpot Amounts      React State   Data Sync
     ↓                    ↓                    ↓            ↓
Referral Records    Player Counts       Auto-refresh   Backup
```

#### Core Functions

##### `calculateCommunityJackpot()`
Calculate the current daily jackpot based on real player activity.

**Returns:**
- `number`: Jackpot amount in VMF (equals number of players × $1 VMF each)

**Data Sources:**
- `pizza_entry_[address]_[date]`: Daily game entries
- Each entry = $1 worth of VMF contribution

**Example Usage:**
```typescript
import { calculateCommunityJackpot } from '@/lib/jackpot-data';

const jackpot = calculateCommunityJackpot();
console.log('Current jackpot:', jackpot, 'VMF');
// Returns: 5 (if 5 players entered today)
```

##### `getWeeklyJackpotInfo()`
Get comprehensive weekly jackpot information including countdown and player stats.

**Returns:**
```typescript
interface WeeklyJackpotInfo {
  totalToppings: number;
  totalPlayers: number;
  timeUntilDraw: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}
```

**Example Usage:**
```typescript
import { getWeeklyJackpotInfo } from '@/lib/jackpot-data';

const weeklyInfo = getWeeklyJackpotInfo();
console.log('Total toppings:', weeklyInfo.totalToppings);
console.log('Time until draw:', weeklyInfo.timeUntilDraw);
```

##### `getDailyPlayerCount()`
Get the number of players who entered today's game.

**Returns:**
- `number`: Count of unique players who entered today

**Example Usage:**
```typescript
import { getDailyPlayerCount } from '@/lib/jackpot-data';

const todayPlayers = getDailyPlayerCount();
console.log('Players today:', todayPlayers);
```

##### `getWeeklyPlayerCount()`
Get the number of unique players who played this week.

**Returns:**
- `number`: Count of unique players who played this week

**Example Usage:**
```typescript
import { getWeeklyPlayerCount } from '@/lib/jackpot-data';

const weeklyPlayers = getWeeklyPlayerCount();
console.log('Weekly players:', weeklyPlayers);
```

##### `getToppingsAvailableToClaim()`
Get the total toppings available to claim.

**Returns:**
- `number`: Total toppings earned but not yet claimed

**Example Usage:**
```typescript
import { getToppingsAvailableToClaim } from '@/lib/jackpot-data';

const availableToppings = getToppingsAvailableToClaim();
console.log('Toppings available:', availableToppings);
```

#### Topping Calculation Logic

The system calculates toppings from multiple sources:

```typescript
// Daily play toppings (1 per day played)
if (key.startsWith("pizza_entry_")) {
  totalToppings += 1; // 1 topping for daily play
}

// Referral toppings (2 per referral)
if (key.startsWith("pizza_referral_success_")) {
  const successRecord = JSON.parse(localStorage.getItem(key) || "[]");
  totalToppings += successRecord.length * 2; // 2 toppings per referral
}

// VMF holdings toppings (1 per 10 VMF)
if (key.startsWith("pizza_vmf_holdings_")) {
  const vmfAmount = Number.parseInt(localStorage.getItem(key) || "0");
  totalToppings += Math.floor(vmfAmount / 10); // 1 topping per 10 VMF
}

// Streak bonus toppings (3 for 7-day streak)
if (key.startsWith("pizza_streak_")) {
  const streakDays = Number.parseInt(localStorage.getItem(key) || "0");
  if (streakDays >= 7) {
    totalToppings += 3; // 3 toppings for 7-day streak
  }
}
```

#### Real-time Updates

```typescript
// Example: Real-time jackpot updates
useEffect(() => {
  const updateJackpot = () => {
    const jackpot = calculateCommunityJackpot();
    setCommunityJackpot(jackpot);
  };

  // Update every second
  const interval = setInterval(updateJackpot, 1000);
  return () => clearInterval(interval);
}, []);
```

## Integration Examples

### Complete Game Entry Flow

```typescript
// 1. Detect platform and available wallets
const platform = detectPlatform();

// 2. Request wallet connection
const connection = await requestWalletConnection('metamask');

// 3. Validate VMF balance
const vmfBalance = await vmfToken.balanceOf(connection.address);
if (vmfBalance < DAILY_ENTRY_FEE) {
  throw new Error('Insufficient VMF balance');
}

// 4. Enter game
await pizzaParty.enterDailyGame(referralCode);

// 5. Update local storage
const today = new Date().toDateString();
const entryKey = `pizza_entry_${connection.address}_${today}`;
localStorage.setItem(entryKey, "true");

// 6. Update UI
setHasEntered(true);
setPlayerCount(prev => prev + 1);
```

### Referral System Integration

```typescript
// 1. Generate referral code
const referralCode = await pizzaParty.createReferralCode();

// 2. Share referral link
const referralLink = `${window.location.origin}/game?ref=${referralCode}`;

// 3. Process referral when new user enters
if (incomingReferralCode) {
  const referrerAddress = findReferrerByCode(incomingReferralCode);
  if (referrerAddress) {
    // Award 2 toppings to referrer
    awardToppingsToReferrer(referrerAddress, 2, incomingReferralCode);
  }
}
```

### Jackpot Monitoring

```typescript
// Real-time jackpot monitoring
const JackpotMonitor = () => {
  const [jackpot, setJackpot] = useState(0);
  const [players, setPlayers] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      setJackpot(calculateCommunityJackpot());
      setPlayers(getDailyPlayerCount());
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>Current Jackpot: {jackpot} VMF</h3>
      <p>Players Today: {players}</p>
    </div>
  );
};
```

## Error Handling Patterns

### Wallet Connection Errors

```typescript
const handleWalletConnection = async (walletId: string) => {
  try {
    const connection = await requestWalletConnection(walletId);
    setConnection(connection);
  } catch (error) {
    switch (error.code) {
      case 'WALLET_NOT_FOUND':
        showInstallPrompt(walletId);
        break;
      case 'USER_REJECTED':
        showToast('Connection cancelled');
        break;
      case 'NETWORK_MISMATCH':
        showNetworkSwitchPrompt();
        break;
      default:
        showToast('Connection failed: ' + error.message);
    }
  }
};
```

### Smart Contract Errors

```typescript
const handleGameEntry = async () => {
  try {
    await pizzaParty.enterDailyGame(referralCode);
    showToast('Successfully entered game!');
  } catch (error) {
    if (error.message.includes('Insufficient VMF balance')) {
      showToast('Need at least $1 worth of VMF to play');
    } else if (error.message.includes('Already entered today')) {
      showToast('You have already entered today\'s game');
    } else if (error.message.includes('Player is blacklisted')) {
      showToast('Account is blacklisted');
    } else {
      showToast('Entry failed: ' + error.message);
    }
  }
};
```

## Performance Considerations

### localStorage Optimization

```typescript
// Batch localStorage operations
const batchUpdate = (updates: Record<string, string>) => {
  Object.entries(updates).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
};

// Efficient data retrieval
const getPlayerData = (address: string) => {
  const keys = Object.keys(localStorage);
  return keys
    .filter(key => key.includes(address))
    .reduce((data, key) => {
      data[key] = localStorage.getItem(key);
      return data;
    }, {} as Record<string, string>);
};
```

### Real-time Updates

```typescript
// Debounced updates to prevent excessive re-renders
const useDebouncedValue = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

## Security Considerations

### Input Validation

```typescript
// Validate wallet addresses
const validateWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Sanitize user inputs
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '').trim();
};

// Validate referral codes
const validateReferralCode = (code: string): boolean => {
  return /^[A-Z0-9]{6,12}$/.test(code);
};
```

### Data Integrity

```typescript
// Verify localStorage data integrity
const verifyDataIntegrity = () => {
  const keys = Object.keys(localStorage);
  const pizzaKeys = keys.filter(key => key.startsWith('pizza_'));
  
  return pizzaKeys.every(key => {
    const value = localStorage.getItem(key);
    return value !== null && value !== undefined;
  });
};
```

This comprehensive API documentation provides developers with detailed examples, architectural insights, and best practices for integrating with the Pizza Party dApp ecosystem. 