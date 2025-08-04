# API Reference

## Smart Contract API

### PizzaParty Contract

#### Core Functions

##### `enterDailyGame(string memory referralCode)`
Enter the daily game with optional referral code.

**Parameters:**
- `referralCode` (string): Optional referral code

**Requirements:**
- User must have at least 1 VMF token
- User must not have entered today
- User must not be blacklisted

**Events:**
- `PlayerEntered(address indexed player, uint256 gameId, uint256 entryFee)`
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`

##### `createReferralCode()`
Create a unique referral code for the player.

**Requirements:**
- Player must not already have a referral code
- Player must not be blacklisted

**Events:**
- `ReferralCreated(address indexed referrer, string referralCode)`

##### `awardVMFHoldingsToppings()`
Award toppings based on VMF token holdings.

**Requirements:**
- Player must not be blacklisted

**Events:**
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`

#### Admin Functions

##### `drawDailyWinners()`
Draw 8 random winners for daily game.

**Requirements:**
- Only owner can call
- Game must be completed

**Events:**
- `DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount)`

##### `drawWeeklyWinners()`
Draw 10 random winners for weekly game.

**Requirements:**
- Only owner can call
- Weekly draw must be ready

**Events:**
- `WeeklyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount)`

##### `emergencyPause(bool pause)`
Pause/unpause contract in emergency.

**Requirements:**
- Only owner can call

**Events:**
- `EmergencyPause(bool paused)`

##### `setPlayerBlacklist(address player, bool blacklisted)`
Blacklist/unblacklist specific players.

**Requirements:**
- Only owner can call

**Events:**
- `PlayerBlacklisted(address indexed player, bool blacklisted)`

##### `emergencyWithdraw()`
Withdraw accumulated VMF (emergency only).

**Requirements:**
- Only owner can call
- Contract must have balance

#### View Functions

##### `hasEnteredToday(address player)`
Check if player has entered today's game.

**Returns:**
- `bool`: True if player has entered today

##### `getPlayerInfo(address player)`
Get complete player information.

**Returns:**
- `Player memory`: Complete player data structure

##### `getCurrentGame()`
Get current daily game information.

**Returns:**
- `Game memory`: Current game data structure

##### `getGame(uint256 gameId)`
Get game info by ID.

**Parameters:**
- `gameId` (uint256): Game identifier

**Returns:**
- `Game memory`: Game data structure

## Frontend API

### Wallet Integration

#### `useWallet()`
React hook for wallet connection management.

**Returns:**
```typescript
{
  connection: WalletConnection | null,
  isConnecting: string | null,
  error: string | null,
  connectWallet: (walletId: string) => Promise<void>,
  disconnect: () => void,
  isConnected: boolean,
  formattedAddress: string,
  setError: (error: string | null) => void
}
```

#### `useVMFBalance()`
React hook for VMF token balance management.

**Returns:**
```typescript
{
  balance: number,
  formattedBalance: string,
  isLoading: boolean,
  hasMinimum: (amount: number) => boolean
}
```

### Jackpot Data

#### `calculateCommunityJackpot()`
Calculate community jackpot based on player activity.

**Returns:**
- `number`: Current jackpot amount

#### `formatJackpotAmount(amount: number)`
Format jackpot amount for display.

**Parameters:**
- `amount` (number): Raw amount

**Returns:**
- `string`: Formatted amount (e.g., "1.5K", "2.3M")

#### `getWeeklyJackpotInfo()`
Get weekly jackpot information.

**Returns:**
```typescript
{
  totalToppings: number,
  totalPlayers: number,
  timeUntilDraw: {
    days: number,
    hours: number,
    minutes: number,
    seconds: number
  }
}
```

### VMF Contract Integration

#### `getVMFBalanceUltimate(walletAddress: string)`
Get VMF balance using multiple fallback methods.

**Parameters:**
- `walletAddress` (string): Wallet address

**Returns:**
- `Promise<string>`: VMF balance as string

#### `simulateVMFBalance(address: string)`
Simulate VMF balance for demo purposes.

**Parameters:**
- `address` (string): Wallet address

**Returns:**
- `number`: Simulated balance

### Wallet Configuration

#### `SUPPORTED_WALLETS`
Array of supported wallet configurations.

**Type:**
```typescript
WalletInfo[] = {
  id: string,
  name: string,
  icon: string,
  color: string,
  mobile?: boolean,
  deepLink?: string,
  downloadUrl?: string,
  universalLink?: string,
  iconImage?: string
}[]
```

#### `isMobile()`
Check if current device is mobile.

**Returns:**
- `boolean`: True if mobile device

#### `isIOS()`
Check if current device is iOS.

**Returns:**
- `boolean`: True if iOS device

#### `isAndroid()`
Check if current device is Android.

**Returns:**
- `boolean`: True if Android device

#### `isFarcaster()`
Check if running in Farcaster environment.

**Returns:**
- `boolean`: True if in Farcaster

## Data Structures

### Player
```solidity
struct Player {
    uint256 totalToppings;      // Total toppings earned
    uint256 dailyEntries;       // Total daily game entries
    uint256 weeklyEntries;      // Total weekly game entries
    uint256 lastEntryTime;      // Timestamp of last entry
    uint256 streakDays;         // Current streak days
    uint256 lastStreakUpdate;   // Last streak update timestamp
    bool isBlacklisted;         // Blacklist status
}
```

### Referral
```solidity
struct Referral {
    address referrer;           // Referrer address
    uint256 totalReferrals;     // Total successful referrals
    uint256 totalRewards;       // Total rewards earned
    bool isActive;              // Referral status
}
```

### Game
```solidity
struct Game {
    uint256 gameId;             // Unique game identifier
    uint256 startTime;          // Game start timestamp
    uint256 endTime;            // Game end timestamp
    uint256 totalEntries;       // Total player entries
    uint256 jackpotAmount;      // Total jackpot amount
    address[] winners;          // Array of winner addresses
    bool isCompleted;           // Game completion status
}
```

### WalletConnection
```typescript
interface WalletConnection {
    address: string;
    chainId: number;
    walletName: string;
    balance?: string;
}
```

## Events

### Game Events
```solidity
event PlayerEntered(address indexed player, uint256 gameId, uint256 entryFee);
event DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount);
event WeeklyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount);
```

### Reward Events
```solidity
event ToppingsAwarded(address indexed player, uint256 amount, string reason);
event ReferralCreated(address indexed referrer, string referralCode);
event ReferralUsed(address indexed referrer, address indexed newPlayer, uint256 reward);
```

### Admin Events
```solidity
event PlayerBlacklisted(address indexed player, bool blacklisted);
event EmergencyPause(bool paused);
event JackpotUpdated(uint256 dailyJackpot, uint256 weeklyJackpot);
```

## Error Codes

### Smart Contract Errors
- `"Insufficient VMF balance"` - User doesn't have enough VMF tokens
- `"Already entered today"` - User has already entered today's game
- `"Player is blacklisted"` - User is blacklisted from the game
- `"Invalid referral code"` - Referral code is invalid or not found
- `"Game not finished"` - Attempting to draw winners before game ends
- `"Weekly draw not ready"` - Weekly draw not ready yet

### Frontend Errors
- `"Wallet not connected"` - No wallet connected
- `"Connection rejected"` - User rejected wallet connection
- `"No Web3 wallet detected"` - No wallet provider available
- `"Network not supported"` - Wallet on wrong network

## Constants

### Game Constants
```solidity
uint256 public constant DAILY_ENTRY_FEE = 1 * 10**18; // 1 VMF token
uint256 public constant DAILY_WINNERS_COUNT = 8;
uint256 public constant WEEKLY_WINNERS_COUNT = 10;
uint256 public constant REFERRAL_REWARD = 2; // 2 toppings per referral
uint256 public constant DAILY_PLAY_REWARD = 1; // 1 topping per day
uint256 public constant VMF_HOLDING_REWARD = 2; // 2 toppings per 10 VMF
uint256 public constant STREAK_BONUS = 3; // 3 toppings for 7-day streak
```

### Network Constants
```typescript
export const BASE_NETWORK = {
  chainId: 8453,
  chainName: "Base",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [
    "https://mainnet.base.org",
    "https://base-mainnet.g.alchemy.com/v2/demo",
    "https://base.gateway.tenderly.co",
  ],
  blockExplorerUrls: ["https://basescan.org"],
};
```

---

**Note**: This API reference covers the core functionality. For detailed implementation examples, see the source code and documentation files. 