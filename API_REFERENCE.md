# 🍕 Pizza Party API Reference

## Table of Contents
1. [Authentication](#authentication)
2. [Base Configuration](#base-configuration)
3. [Smart Contract Functions](#smart-contract-functions)
4. [REST API Endpoints](#rest-api-endpoints)
5. [WebSocket Events](#websocket-events)
6. [Error Handling](#error-handling)
7. [Security Features](#security-features)
8. [Rate Limiting](#rate-limiting)
9. [Testing](#testing)

## Authentication

All API calls require wallet authentication via MetaMask, Coinbase Wallet, or WalletConnect.

### Wallet Connection Flow
```typescript
// 1. Request wallet connection
const connectWallet = async (walletType: 'metamask' | 'coinbase' | 'walletconnect') => {
  const result = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  return result[0]; // Return connected address
};

// 2. Sign message for authentication
const signMessage = async (address: string, message: string) => {
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, address]
  });
  return signature;
};
```

## Base Configuration

### Network Configuration
```typescript
// Base Sepolia Testnet (Beta)
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

// Base Mainnet (Production)
export const BASE_MAINNET_CONFIG = {
  chainId: 8453,
  chainName: "Base",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"],
};
```

## Smart Contract Functions

### Game Entry Functions

#### `enterDailyGame(string memory referralCode)`
**Description**: Enter the daily game with 0.001 Base Sepolia ETH entry fee
**Parameters**: 
- `referralCode` (string): Optional referral code for bonus toppings
**Returns**: None
**Events Emitted**: 
- `PlayerEntered(address indexed player, uint256 indexed gameId, uint256 amount)`
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`
- `JackpotUpdated(uint256 dailyJackpot, uint256 weeklyJackpot)`

```solidity
function enterDailyGame(string memory referralCode) external nonReentrant whenNotPaused notBlacklisted(msg.sender) rateLimited securityCheck payable {
    // Fixed entry fee for Base Sepolia testing
    uint256 requiredETH = 1 * 10**15; // 0.001 Base Sepolia ETH
    
    require(msg.value >= requiredETH, "Insufficient Base Sepolia ETH balance");
    require(players[msg.sender].dailyEntries < MAX_DAILY_ENTRIES, "Max daily entries reached");
    
    // Update player data and jackpot
    players[msg.sender].dailyEntries = players[msg.sender].dailyEntries + 1;
    players[msg.sender].lastEntryTime = block.timestamp;
    players[msg.sender].totalToppings = players[msg.sender].totalToppings + DAILY_PLAY_REWARD;
    
    // Add player to current game
    dailyPlayers[_gameId].push(msg.sender);
    dailyPlayerCount[_gameId] = dailyPlayerCount[_gameId] + 1;
    
    // Update jackpot
    currentDailyJackpot = currentDailyJackpot + msg.value;
    
    // Process referral if provided
    if (bytes(referralCode).length > 0) {
        _processReferralCode(referralCode, msg.sender);
    }
    
    emit PlayerEntered(msg.sender, _gameId, msg.value);
    emit JackpotUpdated(currentDailyJackpot, currentWeeklyJackpot);
}
```

### Prize Distribution Functions

#### `drawDailyWinners()`
**Description**: Draw daily winners and distribute prizes automatically
**Parameters**: None
**Returns**: None
**Events Emitted**: 
- `DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpot)`

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

#### `checkAndDistributeDailyPrizes()`
**Description**: Check and automatically distribute daily prizes if game has ended
**Parameters**: None
**Returns**: None
**Events Emitted**: 
- `DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpot)`

### Toppings System Functions

#### `claimToppings(uint256 amount)`
**Description**: Claim toppings for weekly jackpot participation
**Parameters**: 
- `amount` (uint256): Number of toppings to claim
**Returns**: None
**Events Emitted**: 
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`

#### `awardBaseSepoliaHoldingsToppings()`
**Description**: Award toppings based on Base Sepolia ETH holdings
**Parameters**: None
**Returns**: None
**Events Emitted**: 
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`

#### `awardStreakBonus()`
**Description**: Award toppings for 7-day streak
**Parameters**: None
**Returns**: None
**Events Emitted**: 
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`

### Randomness Functions

#### `requestDailyRandomness()`
**Description**: Request randomness for daily winner selection
**Parameters**: None
**Returns**: None
**Events Emitted**: 
- `RandomnessRequested(uint256 gameId, uint256 randomnessRoundId)`

#### `submitRandomnessCommitment(uint256 roundId, bytes32 commitment)`
**Description**: Submit commitment for randomness generation
**Parameters**: 
- `roundId` (uint256): Randomness round ID
- `commitment` (bytes32): Commitment hash
**Returns**: None
**Events Emitted**: 
- `EntropyContributed(address indexed contributor, bytes32 entropy, uint256 roundId)`

## REST API Endpoints

### Base URL
- **Testnet**: `https://api.pizzaparty.com/v1`
- **Mainnet**: `https://api.pizzaparty.com/v1`

### Authentication Headers
```http
Authorization: Bearer <wallet_signature>
X-Wallet-Address: <wallet_address>
X-Chain-Id: <chain_id>
```

### Game Management

#### Enter Daily Game
```http
POST /api/game/enter
Content-Type: application/json

{
  "referralCode": "PIZZA123",
  "walletAddress": "0x...",
  "signature": "0x...",
  "chainId": 84532
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "gameId": 1,
  "entryFee": "0.001",
  "jackpotAmount": "0.050",
  "timestamp": 1703123456789
}
```

#### Get Game Status
```http
GET /api/game/status?gameId=1
```

**Response:**
```json
{
  "gameId": 1,
  "isActive": true,
  "endTime": "2024-01-15T20:00:00Z",
  "totalPlayers": 150,
  "jackpotAmount": "0.150",
  "winners": [],
  "dailyWinnersCount": 8,
  "weeklyWinnersCount": 10
}
```

#### Get Player Info
```http
GET /api/player/info?address=0x...
```

**Response:**
```json
{
  "address": "0x...",
  "totalToppings": 25,
  "dailyEntries": 1,
  "lastEntryTime": "2024-01-15T10:30:00Z",
  "streakDays": 3,
  "referrals": 2,
  "totalRewards": "0.005",
  "isEligibleForDaily": true
}
```

### Wallet Integration

#### Connect Wallet
```http
POST /api/wallet/connect
Content-Type: application/json

{
  "walletType": "metamask",
  "chainId": 84532,
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "address": "0x...",
  "chainId": 84532,
  "balance": "0.500",
  "sessionToken": "session_abc123..."
}
```

#### Get Wallet Balance
```http
GET /api/wallet/balance?address=0x...
```

**Response:**
```json
{
  "address": "0x...",
  "balance": "0.500",
  "currency": "ETH",
  "chainId": 84532,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### Prize Management

#### Claim Toppings
```http
POST /api/prizes/claim-toppings
Content-Type: application/json

{
  "amount": 10,
  "walletAddress": "0x...",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "claimedAmount": 10,
  "weeklyJackpot": "0.010",
  "remainingToppings": 15
}
```

#### Get Prize History
```http
GET /api/prizes/history?address=0x...
```

**Response:**
```json
{
  "address": "0x...",
  "prizes": [
    {
      "type": "daily",
      "amount": "0.0125",
      "transactionHash": "0x...",
      "timestamp": "2024-01-15T20:00:00Z",
      "gameId": 1
    }
  ],
  "totalWon": "0.025"
}
```

### Referral System

#### Create Referral Code
```http
POST /api/referrals/create
Content-Type: application/json

{
  "walletAddress": "0x...",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "referralCode": "PIZZA123ABC",
  "walletAddress": "0x...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Get Referral Stats
```http
GET /api/referrals/stats?address=0x...
```

**Response:**
```json
{
  "address": "0x...",
  "referralCode": "PIZZA123ABC",
  "totalReferrals": 5,
  "totalRewards": "0.025",
  "referrals": [
    {
      "address": "0x...",
      "joinedAt": "2024-01-15T10:30:00Z",
      "reward": "0.005"
    }
  ]
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.pizzaparty.com/ws');

ws.onopen = () => {
  console.log('Connected to Pizza Party WebSocket');
  
  // Subscribe to events
  ws.send(JSON.stringify({
    type: 'subscribe',
    events: ['player_entered', 'jackpot_updated', 'winners_selected']
  }));
};
```

### Event Types

#### Player Entered
```json
{
  "type": "player_entered",
  "data": {
    "player": "0x...",
    "gameId": 1,
    "amount": "0.001",
    "timestamp": 1703123456789
  }
}
```

#### Jackpot Updated
```json
{
  "type": "jackpot_updated",
  "data": {
    "dailyJackpot": "0.150",
    "weeklyJackpot": "0.500",
    "timestamp": 1703123456789
  }
}
```

#### Winners Selected
```json
{
  "type": "winners_selected",
  "data": {
    "gameId": 1,
    "winners": ["0x...", "0x...", "0x..."],
    "jackpot": "0.150",
    "prizePerWinner": "0.01875",
    "timestamp": 1703123456789
  }
}
```

#### Game State Changed
```json
{
  "type": "game_state_changed",
  "data": {
    "gameId": 1,
    "state": "completed",
    "totalPlayers": 150,
    "timestamp": 1703123456789
  }
}
```

## Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (rate limited or blacklisted)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid wallet address format",
    "details": {
      "field": "walletAddress",
      "value": "invalid_address"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### Common Error Codes
| Code | Message | Description |
|------|---------|-------------|
| `INVALID_ADDRESS` | Invalid wallet address format | Wallet address validation failed |
| `INSUFFICIENT_FUNDS` | Insufficient balance for transaction | User doesn't have enough ETH |
| `RATE_LIMIT_EXCEEDED` | Too many requests, try again later | Rate limit exceeded |
| `GAME_NOT_ACTIVE` | Game is not currently active | Game is paused or ended |
| `ALREADY_ENTERED` | Daily entry already completed | User already entered today |
| `INVALID_SIGNATURE` | Invalid wallet signature | Signature verification failed |
| `NETWORK_ERROR` | Blockchain network error | RPC or network issue |
| `CONTRACT_ERROR` | Smart contract execution failed | Contract revert or error |

## Security Features

### Input Validation
All inputs are validated using the `InputValidator` class:
```typescript
// Wallet address validation
const validation = InputValidator.validateWalletAddress(address);
if (!validation.valid) {
  throw new Error(validation.error);
}

// Amount validation
const amountValidation = InputValidator.validateAmount(amount);
if (!amountValidation.valid) {
  throw new Error(amountValidation.error);
}
```

### Rate Limiting
Configurable rate limits per action type:
```typescript
const RATE_LIMITS = {
  GAME_ENTRY: { max: 10, window: 24 * 60 * 60 * 1000 }, // 10 per day
  WALLET_CONNECTION: { max: 5, window: 60 * 1000 }, // 5 per minute
  API_CALL: { max: 100, window: 60 * 1000 }, // 100 per minute
  REFERRAL_CREATION: { max: 3, window: 24 * 60 * 60 * 1000 }, // 3 per day
  PRIZE_CLAIM: { max: 5, window: 60 * 60 * 1000 } // 5 per hour
};
```

### Security Monitoring
Real-time threat detection and alerting:
```typescript
// Track user actions
securityMonitor.trackUserAction({
  type: 'GAME_ENTRY',
  userId: address,
  metadata: { timestamp: Date.now() }
});

// Check for suspicious activity
if (securityMonitor.isUserFlagged(address)) {
  throw new Error('Account temporarily restricted');
}
```

### Error Handling
Centralized error handling with severity levels:
```typescript
const errorHandler = ErrorHandler.getInstance();
const userMessage = errorHandler.handleError(error, 'API.gameEntry', 'HIGH');
```

## Rate Limiting

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703123456
```

### Response when exceeded
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:contracts
npm run test:api
npm run test:security

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Test API endpoints
npm run test:integration:api

# Test WebSocket events
npm run test:integration:websocket

# Test contract interactions
npm run test:integration:contracts
```

### Security Tests
```bash
# Test input validation
npm run test:security:validation

# Test rate limiting
npm run test:security:rate-limit

# Test error handling
npm run test:security:error-handling
```

### Example Test
```typescript
describe('Game Entry API', () => {
  it('should allow valid game entry', async () => {
    const response = await request(app)
      .post('/api/game/enter')
      .send({
        walletAddress: '0x1234567890123456789012345678901234567890',
        signature: '0x...',
        referralCode: 'PIZZA123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.transactionHash).toBeDefined();
  });

  it('should reject invalid wallet address', async () => {
    const response = await request(app)
      .post('/api/game/enter')
      .send({
        walletAddress: 'invalid_address',
        signature: '0x...'
      })
      .expect(400);

    expect(response.body.error.code).toBe('INVALID_ADDRESS');
  });
});
```

## Deployment

### Environment Variables
```bash
# Required
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Optional
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SECURITY_WEBHOOK=your_webhook_url
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

This comprehensive API documentation provides complete coverage of all endpoints, security features, and testing procedures for the Pizza Party dApp! 🍕 