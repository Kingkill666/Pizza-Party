# 🍕 Pizza Party API Reference

## Smart Contract Functions

### Game Entry Functions

#### `enterDailyGame(string memory referralCode)`
**Description**: Enter the daily game with 0.001 Base Sepolia ETH entry fee for beta testing
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

```solidity
function checkAndDistributeDailyPrizes() external {
    Game storage currentGame = games[_gameId];
    if (!currentGame.isCompleted && block.timestamp >= currentGame.endTime) {
        drawDailyWinners();
    }
}
```

### Toppings System Functions

#### `claimToppings(uint256 amount)`
**Description**: Claim toppings for weekly jackpot participation
**Parameters**: 
- `amount` (uint256): Number of toppings to claim
**Returns**: None
**Events Emitted**: 
- `ToppingsAwarded(address indexed player, uint256 amount, string reason)`

```solidity
function claimToppings(uint256 amount) external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
    require(amount > 0, "Invalid topping amount");
    require(players[msg.sender].totalToppings >= amount, "Insufficient toppings");
    
    // Transfer toppings to weekly jackpot
    players[msg.sender].totalToppings = players[msg.sender].totalToppings - amount;
    currentWeeklyJackpot = currentWeeklyJackpot + (amount * 0.001 ether);
    
    emit ToppingsAwarded(msg.sender, amount, "Weekly jackpot claim");
}
```

### Randomness Functions

#### `requestDailyRandomness()`
**Description**: Request randomness for daily winner selection
**Parameters**: None
**Returns**: None
**Events Emitted**: 
- `RandomnessRequested(uint256 gameId, uint256 randomnessRoundId)`

```solidity
function requestDailyRandomness() external onlyOwner whenNotPaused {
    uint256 randomnessRoundId = randomnessContract.requestRandomness();
    currentRandomnessRound = randomnessRoundId;
    
    emit RandomnessRequested(_gameId, randomnessRoundId);
}
```

#### `submitRandomnessCommitment(uint256 roundId, bytes32 commitment)`
**Description**: Submit commitment for randomness generation
**Parameters**: 
- `roundId` (uint256): Randomness round ID
- `commitment` (bytes32): Commitment hash
**Returns**: None
**Events Emitted**: 
- `EntropyContributed(address indexed contributor, bytes32 entropy, uint256 roundId)`

```solidity
function submitRandomnessCommitment(uint256 roundId, bytes32 commitment) external whenNotPaused {
    randomnessContract.submitCommitment(roundId, commitment);
}
```

## Automatic Jackpot Payout System

### Daily Jackpot Process
1. **Entry Collection**: Players pay 0.001 Base Sepolia ETH per entry
2. **Prize Pool**: All entry fees accumulate in `currentDailyJackpot`
3. **Game End**: Automatic detection at 12pm PST daily
4. **Winner Selection**: 8 random winners using secure on-chain randomness
5. **Prize Distribution**: Automatic ETH transfer to winner wallets
6. **New Game**: Automatic start of new daily game

### Weekly Jackpot Process
1. **Toppings Collection**: Players claim toppings throughout the week
2. **Prize Pool**: Total claimed toppings × 0.001 ETH
3. **Game End**: Automatic detection at 12pm PST Monday
4. **Winner Selection**: 10 random winners using secure randomness
5. **Prize Distribution**: Automatic ETH transfer to winner wallets
6. **Reset**: All toppings reset for new weekly cycle

### Security Features
- **ReentrancyGuard**: All payable functions protected
- **Access Control**: Role-based permissions for admin functions
- **Input Validation**: Sanitized inputs with length and format checks
- **Rate Limiting**: Cooldown periods to prevent abuse
- **Emergency Pause**: Ability to pause contract in emergencies

### Event Tracking
The contract emits comprehensive events for monitoring:
- `PlayerEntered`: When players enter the game
- `DailyWinnersSelected`: When daily winners are chosen
- `WeeklyWinnersSelected`: When weekly winners are chosen
- `JackpotUpdated`: When jackpot amounts change
- `ToppingsAwarded`: When players earn toppings
- `ReferralUsed`: When referral codes are used
- `RandomnessRequested`: When randomness is requested

## Frontend Integration

### Wallet Connection
```typescript
// Connect to wallet
const connectWallet = async (walletId: string) => {
    const result = await requestWalletConnection(walletId);
    const walletConnection: WalletConnection = {
        address: result.accounts[0],
        chainId: Number.parseInt(result.chainId, 16),
        walletName: getWalletDisplayName(walletId),
    };
    return walletConnection;
};
```

### Contract Interaction
```typescript
// Enter daily game
const enterGame = async (referralCode?: string) => {
    const contract = createPizzaPartyContract(window.ethereum);
    const txHash = await contract.enterDailyGame(referralCode || "", {
        value: ethers.utils.parseEther("0.001")
    });
    return txHash;
};
```

### Event Listening
```typescript
// Listen for game events
const listenForEvents = () => {
    contract.on("PlayerEntered", (player, gameId, amount) => {
        console.log(`Player ${player} entered game ${gameId} with ${amount} ETH`);
    });
    
    contract.on("DailyWinnersSelected", (gameId, winners, jackpot) => {
        console.log(`Daily winners selected for game ${gameId}: ${winners}`);
    });
};
```

## Network Configuration

### Base Sepolia Testnet (Beta)
```typescript
export const BASE_SEPOLIA_NETWORK = {
    chainId: 84532,
    chainName: "Base Sepolia",
    nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: [
        "https://sepolia.base.org",
        "https://base-sepolia.g.alchemy.com/v2/demo",
    ],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
};
```

### Base Mainnet (Production)
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
    ],
    blockExplorerUrls: ["https://basescan.org"],
};
```

## Error Handling

### Common Error Codes
- `4001`: User rejected the request
- `-32002`: Request already pending
- `4902`: Network not found in wallet
- `-32603`: Internal JSON-RPC error

### Error Handling Example
```typescript
try {
    const result = await contract.enterDailyGame("", {
        value: ethers.utils.parseEther("0.001")
    });
    console.log("Transaction successful:", result);
} catch (error: any) {
    if (error.code === 4001) {
        console.log("User rejected the transaction");
    } else if (error.code === -32002) {
        console.log("Request already pending");
    } else {
        console.error("Transaction failed:", error.message);
    }
}
```

## Gas Optimization

### Batch Processing
```solidity
function processBatchPlayers(address[] memory players, uint256[] memory amounts) external {
    require(players.length <= BATCH_SIZE, "Batch size too large");
    
    for (uint256 i = 0; i < players.length; i++) {
        _processPlayerOptimized(players[i], amounts[i]);
    }
}
```

### Gas Estimation
```typescript
const estimateGas = async (functionName: string, ...args: any[]) => {
    const contract = createPizzaPartyContract(window.ethereum);
    const gasEstimate = await contract.estimateGas[functionName](...args);
    return gasEstimate;
};
```

## Security Considerations

### Reentrancy Protection
All payable functions use the `nonReentrant` modifier to prevent reentrancy attacks.

### Access Control
- `onlyOwner`: Only contract owner can call admin functions
- `onlyRole`: Role-based access control for specific functions
- `whenNotPaused`: Functions disabled when contract is paused

### Input Validation
- Referral code length and format validation
- Address validation for all external inputs
- Amount validation to prevent overflow/underflow

### Rate Limiting
- Daily entry limits per wallet
- Cooldown periods between actions
- Maximum reward amounts per day 