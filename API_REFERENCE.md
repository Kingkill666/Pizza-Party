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

## Component Architecture

### Frontend Layer (Next.js)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │    Pages    │    │ Components  │    │    Hooks    │        │
│  │             │    │             │    │             │        │
│  │ • /         │    │ • Wallet    │    │ • useWallet │        │
│  │ • /game     │    │ • Jackpot   │    │ • useVMF    │        │
│  │ • /jackpot  │    │ • Game      │    │ • useMobile │        │
│  │ • /admin    │    │ • UI        │    │             │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │    Lib      │    │   Utils     │    │   Config    │        │
│  │             │    │             │    │             │        │
│  │ • wallet-   │    │ • validation│    │ • constants │        │
│  │   config.ts │    │ • formatting│    │ • networks  │        │
│  │ • jackpot-  │    │ • helpers   │    │ • wallets   │        │
│  │   data.ts   │    │             │    │             │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Smart Contract API

### PizzaParty Contract

#### Core Functions

##### `enterDailyGame()`
Enter the daily game by paying 0.001 Base Sepolia ETH (for beta testing).

```solidity
function enterDailyGame(string memory referralCode) external nonReentrant whenNotPaused notBlacklisted(msg.sender) rateLimited securityCheck payable {
    // Fixed entry fee for Base Sepolia testing
    uint256 requiredETH = 1 * 10**15; // 0.001 Base Sepolia ETH
    
    require(msg.value >= requiredETH, "Insufficient Base Sepolia ETH balance");
    require(players[msg.sender].dailyEntries < MAX_DAILY_ENTRIES, "Max daily entries reached");
    
    // Update player data
    players[msg.sender].dailyEntries = players[msg.sender].dailyEntries + 1;
    players[msg.sender].lastEntryTime = block.timestamp;
    players[msg.sender].totalToppings = players[msg.sender].totalToppings + DAILY_PLAY_REWARD;
    
    // Add player to current game
    dailyPlayers[_gameId].push(msg.sender);
    dailyPlayerCount[_gameId] = dailyPlayerCount[_gameId] + 1;
    
    // Update jackpot
    currentDailyJackpot = currentDailyJackpot + msg.value;
    
    emit PlayerEntered(msg.sender, _gameId, msg.value);
    emit JackpotUpdated(currentDailyJackpot, currentWeeklyJackpot);
}
```

**Parameters:** 
- `referralCode` (string): Optional referral code
**Returns:** None
**Events:** `PlayerEntered(address player, uint256 gameId, uint256 amount)`, `JackpotUpdated(uint256 dailyJackpot, uint256 weeklyJackpot)`

##### `checkAndDistributeDailyPrizes()`
Automatically check if daily game has ended and distribute prizes to 8 random winners.

```solidity
function checkAndDistributeDailyPrizes() external {
    Game storage currentGame = games[_gameId];
    if (!currentGame.isCompleted && block.timestamp >= currentGame.endTime) {
        drawDailyWinners();
    }
}
```

**Parameters:** None
**Returns:** None
**Events:** `DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpot)`

##### `drawDailyWinners()`
Select 8 random winners and distribute daily jackpot prizes automatically.

```solidity
function drawDailyWinners() external {
    Game storage currentGame = games[_gameId];
    require(!currentGame.isCompleted, "Game already completed");
    require(block.timestamp >= currentGame.endTime, "Game not finished");
    
    address[] memory winners = _selectWinners(DAILY_WINNERS_COUNT, currentGame.totalEntries);
    uint256 prizePerWinner = currentDailyJackpot / DAILY_WINNERS_COUNT;
    
    // Distribute Base Sepolia ETH prizes automatically
    for (uint256 i = 0; i < winners.length; i++) {
        if (winners[i] != address(0)) {
            (bool success, ) = winners[i].call{value: prizePerWinner}("");
            require(success, "Prize transfer failed");
        }
    }
    
    currentGame.winners = winners;
    currentGame.isCompleted = true;
    currentGame.jackpotAmount = currentDailyJackpot;
    
    emit DailyWinnersSelected(_gameId, winners, currentDailyJackpot);
    
    // Start new game automatically
    _startNewDailyGame();
}
```

**Parameters:** None
**Returns:** None
**Events:** `DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpot)`

### Automatic Jackpot Payout System

#### Winner Selection Process
1. **Secure Randomness**: Uses FreeRandomness contract with multi-party commit-reveal scheme
2. **Fair Selection**: Winners selected using cryptographic hash functions
3. **Transparent**: All randomness generation is verifiable on-chain
4. **Tamper-Proof**: No single party can influence winner selection

#### Automatic Payout Flow
1. **Game End Detection**: System automatically detects when daily/weekly games end
2. **Winner Selection**: 8 daily winners or 10 weekly winners selected randomly
3. **Prize Calculation**: Total jackpot divided equally among winners
4. **Automatic Transfer**: Base Sepolia ETH sent directly to winners' wallets
5. **Transaction Verification**: All transfers verified on-chain
6. **New Game Start**: New game automatically starts after payout

#### Payout Example
- **Daily Jackpot**: 100 players × 0.001 ETH = 0.1 ETH total
- **Prize per Winner**: 0.1 ETH ÷ 8 winners = 0.0125 ETH each
- **Automatic Transfer**: Each winner receives 0.0125 Base Sepolia ETH directly to their wallet

#### Security Features
- ✅ **No Manual Intervention**: Fully automated system
- ✅ **Secure Randomness**: Cryptographic random number generation
- ✅ **On-chain Verification**: All payouts verified on blockchain
- ✅ **Equal Distribution**: Fair prize distribution among winners
- ✅ **Immediate Payout**: Winners receive prizes instantly when game ends

##### `processDailyPayout()`
Process daily payout and select winners (owner only).

```solidity
function processDailyPayout() external onlyOwner {
    require(!paused, "Contract is paused");
    
    // Select 8 winners
    address[] memory winners = selectDailyWinners();
    
    // Calculate prize per winner
    uint256 prizePerWinner = address(this).balance / DAILY_WINNERS_COUNT;
    
    // Distribute prizes
    for (uint i = 0; i < winners.length; i++) {
        payable(winners[i]).transfer(prizePerWinner);
    }
    
    emit DailyPayoutProcessed(winners, prizePerWinner);
}
```

**Parameters:** None
**Returns:** None
**Events:** `DailyPayoutProcessed(address[] winners, uint256 prizePerWinner)`

#### View Functions

##### `getDailyEntries(address player, uint256 timestamp)`
Check if a player entered on a specific day.

```solidity
function getDailyEntries(address player, uint256 timestamp) 
    external view returns (bool) {
    return dailyEntries[player][timestamp];
}
```

**Parameters:**
- `player`: Player's address
- `timestamp`: Day timestamp
**Returns:** `bool` - Whether player entered on that day

##### `getPlayerToppings(address player)`
Get player's total toppings.

```solidity
function getPlayerToppings(address player) 
    external view returns (uint256) {
    return playerToppings[player];
}
```

**Parameters:**
- `player`: Player's address
**Returns:** `uint256` - Total toppings for player

## Frontend Component API

### Wallet Configuration (`wallet-config.ts`)

#### Wallet Interface

```typescript
export interface WalletInfo {
  name: string
  icon: string
  color: string
  id: string
  mobile?: boolean
  deepLink?: string
  downloadUrl?: string
  universalLink?: string
  iconImage?: string
}
```

#### Wallet Connection

```typescript
export interface WalletConnection {
  address: string
  chainId: number
  walletName: string
  balance?: string
}
```

#### Usage Examples

**Basic Wallet Connection:**
```typescript
import { requestWalletConnection, WALLETS } from '@/lib/wallet-config';

const handleWalletConnect = async (walletId: string) => {
  try {
    const connection = await requestWalletConnection(walletId);
    console.log('Connected:', connection.address);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
};

// Connect to MetaMask
const metamaskConnection = await requestWalletConnection('metamask');
```

**Mobile Wallet Detection:**
```typescript
import { isMobile, isInWalletBrowser } from '@/lib/wallet-config';

if (isMobile()) {
  const walletBrowser = isInWalletBrowser();
  if (walletBrowser) {
    console.log('User is in', walletBrowser, 'browser');
  }
}
```

**Multi-Wallet Support:**
```typescript
import { WALLETS, getWalletProvider } from '@/lib/wallet-config';

// Get all available wallets
const availableWallets = WALLETS.filter(wallet => {
  return getWalletProvider(wallet.id) !== null;
});

// Connect to first available wallet
for (const wallet of availableWallets) {
  try {
    const connection = await requestWalletConnection(wallet.id);
    break; // Successfully connected
  } catch (error) {
    continue; // Try next wallet
  }
}
```

### Jackpot Data (`jackpot-data.ts`)

#### Core Functions

##### `calculateCommunityJackpot()`
Calculate current community jackpot based on player activity.

```typescript
export const calculateCommunityJackpot = (): number => {
  if (typeof window === "undefined") return 0;

  const today = new Date().toDateString();
  const keys = Object.keys(localStorage);
  let todaysPlayers = 0;

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && 
        key.includes(today) && 
        localStorage.getItem(key) === "true") {
      todaysPlayers++;
    }
  });

  return todaysPlayers; // Each player pays 1 VMF
};
```

**Returns:** `number` - Current jackpot amount in VMF

##### `getWeeklyJackpotInfo()`
Get comprehensive weekly jackpot information.

```typescript
export const getWeeklyJackpotInfo = () => {
  // Calculate time until next Sunday at 12pm PST
  const now = new Date();
  const pstOffset = -8 * 60; // PST is UTC-8
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const pstTime = new Date(utc + pstOffset * 60000);

  // Find next Sunday at 12pm PST
  const nextSunday = new Date(pstTime);
  const daysUntilSunday = (7 - pstTime.getDay()) % 7;
  
  if (daysUntilSunday === 0 && pstTime.getHours() >= 12) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  } else {
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  }
  
  nextSunday.setHours(12, 0, 0, 0);

  const difference = nextSunday.getTime() - now.getTime();
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  // Calculate real toppings and players
  let totalToppings = 0;
  let totalPlayers = 0;

  if (typeof window !== "undefined") {
    const keys = Object.keys(localStorage);
    const uniquePlayers = new Set();

    keys.forEach((key) => {
      // Daily play entries (1 topping per day played)
      if (key.startsWith("pizza_entry_")) {
        const today = new Date().toDateString();
        if (key.includes(today) && localStorage.getItem(key) === "true") {
          totalToppings += 1;
          const address = key.replace("pizza_entry_", "").replace(`_${today}`, "");
          uniquePlayers.add(address);
        }
      }

      // Referral success records (2 toppings per referral)
      if (key.startsWith("pizza_referral_success_")) {
        const address = key.replace("pizza_referral_success_", "");
        const successRecord = JSON.parse(localStorage.getItem(key) || "[]");
        const referralToppings = successRecord.length * 2;
        totalToppings += referralToppings;
        uniquePlayers.add(address);
      }

      // VMF holdings (1 topping per 10 VMF)
      if (key.startsWith("pizza_vmf_holdings_")) {
        const address = key.replace("pizza_vmf_holdings_", "");
        const vmfAmount = Number.parseInt(localStorage.getItem(key) || "0");
        const vmfToppings = Math.floor(vmfAmount / 10);
        totalToppings += vmfToppings;
        uniquePlayers.add(address);
      }

      // Streak bonuses (3 toppings for 7-day streak)
      if (key.startsWith("pizza_streak_")) {
        const address = key.replace("pizza_streak_", "");
        const streakDays = Number.parseInt(localStorage.getItem(key) || "0");
        if (streakDays >= 7) {
          totalToppings += 3;
        }
        uniquePlayers.add(address);
      }

      // Legacy toppings storage
      if (key.startsWith("pizza_toppings_")) {
        const toppings = Number.parseInt(localStorage.getItem(key) || "0");
        if (toppings > 0) {
          totalToppings += toppings;
          const address = key.replace("pizza_toppings_", "");
          uniquePlayers.add(address);
        }
      }
    });

    totalPlayers = uniquePlayers.size;
  }

  return {
    timeUntilDraw: { days, hours, minutes, seconds },
    totalToppings,
    totalPlayers,
  };
};
```

**Returns:** `object` - Weekly jackpot information with countdown and stats

#### Usage Examples

**Display Jackpot Information:**
```typescript
import { calculateCommunityJackpot, getWeeklyJackpotInfo } from '@/lib/jackpot-data';

// Get current daily jackpot
const dailyJackpot = calculateCommunityJackpot();
console.log('Daily Jackpot:', dailyJackpot, 'VMF');

// Get weekly information
const weeklyInfo = getWeeklyJackpotInfo();
console.log('Time until draw:', weeklyInfo.timeUntilDraw);
console.log('Total toppings:', weeklyInfo.totalToppings);
console.log('Total players:', weeklyInfo.totalPlayers);
```

**Real-time Jackpot Updates:**
```typescript
import { useEffect, useState } from 'react';
import { calculateCommunityJackpot } from '@/lib/jackpot-data';

function JackpotDisplay() {
  const [jackpot, setJackpot] = useState(0);

  useEffect(() => {
    const updateJackpot = () => {
      const currentJackpot = calculateCommunityJackpot();
      setJackpot(currentJackpot);
    };

    updateJackpot();
    const interval = setInterval(updateJackpot, 5000);
    return () => clearInterval(interval);
  }, []);

  return <div>Current Jackpot: {jackpot} VMF</div>;
}
```

### Payout System (`payout-utils.ts`)

#### Core Interfaces

```typescript
export interface PayoutRecord {
  id: number
  type: 'daily' | 'weekly'
  timestamp: number
  winners: string[]
  jackpotAmount: number
  prizePerWinner: number
  totalEntries?: number
  totalToppings?: number
  totalPlayers?: number
  processed: boolean
}

export interface GameData {
  totalEntries: number
  jackpotAmount: number
}

export interface WeeklyData {
  totalToppings: number
  totalPlayers: number
  players: PlayerData[]
  jackpotAmount: number
}

export interface PlayerData {
  address: string
  toppings: number
}
```

#### Error Handling

```typescript
export class PayoutError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PayoutError';
  }
}
```

#### Core Functions

##### `getCurrentGameData()`
Get current daily game data with error handling.

```typescript
export const getCurrentGameData = (): GameData => {
  try {
    if (typeof window === "undefined") {
      return { totalEntries: 0, jackpotAmount: 0 };
    }

    const today = new Date().toDateString();
    let totalEntries = 0;
    let jackpotAmount = 0;

    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("pizza_entry_") && key.endsWith(`_${today}`)) {
        if (localStorage.getItem(key) === "true") {
          totalEntries++;
          jackpotAmount += 50; // 50 VMF per entry
        }
      }
    });

    return { totalEntries, jackpotAmount };
  } catch (error) {
    console.error("Error getting current game data:", error);
    throw new PayoutError("Failed to get current game data", "GAME_DATA_ERROR");
  }
};
```

##### `selectDailyWinners(totalEntries: number)`
Select daily winners with weighted randomness.

```typescript
export const selectDailyWinners = (totalEntries: number): string[] => {
  try {
    const winners: string[] = [];
    const addresses = getPlayerAddresses();
    
    if (addresses.length === 0) {
      return winners;
    }
    
    // Use weighted selection based on entry count
    const entryCounts = new Map<string, number>();
    addresses.forEach(address => {
      const count = getPlayerEntryCount(address);
      entryCounts.set(address, count);
    });
    
    const totalWeight = Array.from(entryCounts.values())
      .reduce((sum, count) => sum + count, 0);
    
    for (let i = 0; i < 8 && i < addresses.length; i++) {
      const random = Math.random() * totalWeight;
      let currentWeight = 0;
      
      for (const [address, count] of entryCounts) {
        currentWeight += count;
        if (random <= currentWeight && !winners.includes(address)) {
          winners.push(address);
          break;
        }
      }
    }
    
    return winners;
  } catch (error) {
    console.error("Error selecting daily winners:", error);
    throw new PayoutError("Failed to select daily winners", "WINNER_SELECTION_ERROR");
  }
};
```

#### Usage Examples

**Process Daily Payout:**
```typescript
import { 
  getCurrentGameData, 
  selectDailyWinners, 
  savePayoutRecord,
  PayoutError 
} from '@/lib/payout-utils';

const processDailyPayout = async () => {
  try {
    // Get current game data
    const currentGame = getCurrentGameData();
    
    if (currentGame.totalEntries === 0) {
      throw new PayoutError("No entries found for today", "NO_ENTRIES");
    }
    
    // Select winners
    const winners = selectDailyWinners(currentGame.totalEntries);
    
    if (winners.length === 0) {
      throw new PayoutError("No winners selected", "NO_WINNERS");
    }
    
    // Calculate prize per winner
    const prizePerWinner = currentGame.jackpotAmount / 8; // 8 winners
    
    // Record payout
    const payoutRecord: PayoutRecord = {
      id: Date.now(),
      type: "daily",
      timestamp: Date.now(),
      winners: winners,
      jackpotAmount: currentGame.jackpotAmount,
      prizePerWinner: prizePerWinner,
      totalEntries: currentGame.totalEntries,
      processed: true,
    };

    // Save payout record
    savePayoutRecord(payoutRecord);
    
    console.log("✅ Daily payout processed successfully");
  } catch (error) {
    if (error instanceof PayoutError) {
      console.error("Payout error:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};
```

**Get Payout History:**
```typescript
import { getPayoutHistory, formatTimestamp } from '@/lib/payout-utils';

const displayPayoutHistory = () => {
  const history = getPayoutHistory();
  
  return history.map(payout => (
    <div key={payout.id}>
      <h3>{payout.type === "daily" ? "🎯 Daily" : "🏆 Weekly"} Payout</h3>
      <p>Time: {formatTimestamp(payout.timestamp)}</p>
      <p>Jackpot: {payout.jackpotAmount} VMF</p>
      <p>Winners: {payout.winners.length}</p>
    </div>
  ));
};
```

## Integration Examples

### Wallet Connection Flow

```typescript
import { useState } from 'react';
import { requestWalletConnection, WALLETS } from '@/lib/wallet-config';
import { useWallet } from '@/hooks/useWallet';

function WalletConnect() {
  const { isConnected, connection, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWalletConnect = async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await requestWalletConnection(walletId);
      await connect(walletId, result);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      {!isConnected ? (
        <div className="grid grid-cols-2 gap-4">
          {WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleWalletConnect(wallet.id)}
              disabled={isConnecting}
              className={`p-4 rounded-lg ${wallet.color}`}
            >
              <span className="text-2xl">{wallet.icon}</span>
              <p className="font-bold">{wallet.name}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <p>Connected: {connection?.address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
      
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
```

### Game Entry with Validation

```typescript
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useVMFBalance } from '@/hooks/useVMFBalance';
import { validateWalletAddress, validateVMFAmount } from '@/lib/validation';

function GameEntry() {
  const { isConnected, connection } = useWallet();
  const { balance, hasMinimum } = useVMFBalance();
  const [referralCode, setReferralCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnterGame = async () => {
    if (!isConnected || !connection) {
      setError('Wallet not connected');
      return;
    }

    // Validate wallet address
    if (!validateWalletAddress(connection.address)) {
      setError('Invalid wallet address');
      return;
    }

    // Validate VMF balance
    if (!hasMinimum) {
      setError('Insufficient VMF balance');
      return;
    }

    // Validate referral code if provided
    if (referralCode && !validateReferralCode(referralCode)) {
      setError('Invalid referral code');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Process game entry
      const entryData = {
        player: connection.address,
        amount: 1, // 1 VMF
        referralCode: referralCode || null,
        timestamp: Date.now(),
      };

      // Store entry in localStorage
      const today = new Date().toDateString();
      const entryKey = `pizza_entry_${connection.address}_${today}`;
      localStorage.setItem(entryKey, 'true');

      // Process referral if applicable
      if (referralCode) {
        processReferralCode(referralCode, connection.address);
      }

      console.log('✅ Game entry successful');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h2>Enter Daily Game</h2>
      <p>Cost: 1 VMF</p>
      <p>Balance: {balance} VMF</p>
      
      <input
        type="text"
        placeholder="Referral code (optional)"
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value)}
      />
      
      <button
        onClick={handleEnterGame}
        disabled={!isConnected || !hasMinimum || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Enter Game'}
      </button>
      
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
```

## Error Handling

### Common Error Types

```typescript
// Wallet Connection Errors
class WalletConnectionError extends Error {
  constructor(message: string, public walletId: string) {
    super(message);
    this.name = 'WalletConnectionError';
  }
}

// Game Entry Errors
class GameEntryError extends Error {
  constructor(message: string, public playerAddress: string) {
    super(message);
    this.name = 'GameEntryError';
  }
}

// Payout Processing Errors
class PayoutError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PayoutError';
  }
}
```

### Error Handling Patterns

```typescript
// Try-catch with specific error types
try {
  const connection = await requestWalletConnection('metamask');
  // Process connection
} catch (error) {
  if (error instanceof WalletConnectionError) {
    console.error('Wallet connection failed:', error.message);
    // Handle wallet-specific error
  } else if (error instanceof PayoutError) {
    console.error('Payout error:', error.code, error.message);
    // Handle payout error
  } else {
    console.error('Unexpected error:', error);
    // Handle generic error
  }
}

// Error boundary pattern
const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  // Log to monitoring service
  if (typeof window !== 'undefined') {
    // Send to Sentry or similar
    console.log('Sending error to monitoring service');
  }
  
  // Show user-friendly message
  return `Something went wrong. Please try again.`;
};
```

## Performance Optimization

### Memoization Examples

```typescript
import { useMemo, useCallback } from 'react';
import { calculateCommunityJackpot } from '@/lib/jackpot-data';

// Memoize expensive calculations
function JackpotDisplay() {
  const jackpot = useMemo(() => {
    return calculateCommunityJackpot();
  }, []); // Recalculate only when dependencies change

  const formattedJackpot = useMemo(() => {
    return formatJackpotAmount(jackpot);
  }, [jackpot]);

  return <div>Jackpot: {formattedJackpot} VMF</div>;
}

// Memoize callback functions
function WalletButtons() {
  const handleWalletConnect = useCallback(async (walletId: string) => {
    try {
      const connection = await requestWalletConnection(walletId);
      // Handle connection
    } catch (error) {
      // Handle error
    }
  }, []); // Empty dependency array since function doesn't depend on props/state

  return (
    <div>
      {WALLETS.map(wallet => (
        <button
          key={wallet.id}
          onClick={() => handleWalletConnect(wallet.id)}
        >
          {wallet.name}
        </button>
      ))}
    </div>
  );
}
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const PayoutSystem = lazy(() => import('@/components/PayoutSystem'));
const AdminPanel = lazy(() => import('@/components/AdminPanel'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <PayoutSystem />
      </Suspense>
      
      <Suspense fallback={<div>Loading admin...</div>}>
        <AdminPanel />
      </Suspense>
    </div>
  );
}
```

## Security Considerations

### Input Validation

```typescript
// Validate wallet addresses
export const validateWalletAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Check length and format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }
  
  // Additional checks can be added here
  return true;
};

// Validate referral codes
export const validateReferralCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Check format (alphanumeric, 6-12 characters)
  if (!/^[a-zA-Z0-9]{6,12}$/.test(code)) {
    return false;
  }
  
  return true;
};

// Sanitize user inputs
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 100); // Limit length
};
```

### Rate Limiting

```typescript
// Simple rate limiting for game entries
const rateLimiter = new Map<string, number>();

export const checkRateLimit = (address: string, limitMs: number = 60000): boolean => {
  const now = Date.now();
  const lastEntry = rateLimiter.get(address);
  
  if (lastEntry && (now - lastEntry) < limitMs) {
    return false; // Rate limited
  }
  
  rateLimiter.set(address, now);
  return true; // Allowed
};

// Usage in game entry
const handleEnterGame = async () => {
  if (!checkRateLimit(connection.address)) {
    throw new Error('Please wait before entering again');
  }
  
  // Process game entry
};
```

## Testing Examples

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { calculateCommunityJackpot, getWeeklyJackpotInfo } from '@/lib/jackpot-data';

describe('Jackpot Calculations', () => {
  it('should calculate community jackpot correctly', () => {
    // Mock localStorage
    const mockLocalStorage = {
      'pizza_entry_0x123_2024-01-15': 'true',
      'pizza_entry_0x456_2024-01-15': 'true',
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    
    const jackpot = calculateCommunityJackpot();
    expect(jackpot).toBe(2); // 2 players = 2 VMF
  });
  
  it('should return 0 when no entries exist', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {},
      writable: true,
    });
    
    const jackpot = calculateCommunityJackpot();
    expect(jackpot).toBe(0);
  });
});
```

### Integration Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useWallet } from '@/hooks/useWallet';
import GameEntry from '@/components/GameEntry';

// Mock hooks
jest.mock('@/hooks/useWallet');
jest.mock('@/hooks/useVMFBalance');

describe('GameEntry Integration', () => {
  it('should allow game entry when wallet is connected and has sufficient balance', async () => {
    // Mock wallet connection
    (useWallet as jest.Mock).mockReturnValue({
      isConnected: true,
      connection: { address: '0x123...' },
    });
    
    render(<GameEntry />);
    
    const enterButton = screen.getByText('Enter Game');
    fireEvent.click(enterButton);
    
    await waitFor(() => {
      expect(screen.getByText('✅ Game entry successful')).toBeInTheDocument();
    });
  });
});
```

This enhanced API reference provides comprehensive documentation with practical examples, error handling patterns, and security considerations for the Pizza Party dApp. 