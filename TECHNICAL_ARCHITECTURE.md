# 🔧 Technical Architecture Documentation

## Smart Contract Overview

### Core Contracts
- **PizzaParty.sol**: Main game contract with jackpot logic
- **FreeRandomness.sol**: Secure randomness generation
- **FreePriceOracle.sol**: Dynamic pricing oracle
- **SecureReferralSystem.sol**: Referral tracking system

### Security Features

#### Reentrancy Protection
```solidity
contract PizzaParty is ReentrancyGuard, Ownable, Pausable {
    function enterDailyGame(string memory referralCode) external nonReentrant whenNotPaused {
        // Protected function implementation
    }
}
```

#### Access Control
- **Ownable**: Contract owner controls admin functions
- **Role-Based Access**: ADMIN_ROLE, OPERATOR_ROLE, EMERGENCY_ROLE, AUDITOR_ROLE
- **Function Modifiers**: `onlyOwner`, `onlyRole`, `whenNotPaused`

#### Input Validation
```solidity
modifier validReferralCode(string memory code) {
    require(bytes(code).length >= MIN_REFERRAL_CODE_LENGTH, "Referral code too short");
    require(bytes(code).length <= MAX_REFERRAL_CODE_LENGTH, "Referral code too long");
    require(_isValidReferralCodeFormat(code), "Invalid referral code format");
    _;
}
```

## Prize Distribution System

### Daily Jackpot Flow
1. **Entry Collection**: Players pay 0.001 Base Sepolia ETH
2. **Prize Pool Accumulation**: All entry fees go to `currentDailyJackpot`
3. **Game End Detection**: Automatic at 12pm PST daily
4. **Winner Selection**: 8 random winners using secure randomness
5. **Prize Distribution**: Automatic ETH transfer to winner wallets

### Weekly Jackpot Flow
1. **Toppings Collection**: Players claim toppings throughout week
2. **Prize Pool Calculation**: Total claimed toppings × 0.001 ETH
3. **Game End Detection**: Automatic at 12pm PST Monday
4. **Winner Selection**: 10 random winners using secure randomness
5. **Prize Distribution**: Automatic ETH transfer to winner wallets

### Randomness Implementation
```solidity
// Uses FreeRandomness contract with multi-party commit-reveal
function _selectWinners(uint256 winnerCount, uint256 gameId) internal view returns (address[] memory) {
    uint256 randomNumber = randomnessContract.getFinalRandomNumber(game.randomnessRoundId);
    
    // Select winners using secure random number
    for (uint256 i = 0; i < winnerCount; i++) {
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(randomNumber, i))) % totalPlayers;
        winners[i] = players[randomIndex];
    }
}
```

## Event Tracking System

### Key Events for Monitoring
```solidity
event PlayerEntered(address indexed player, uint256 indexed gameId, uint256 amount);
event DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpot);
event WeeklyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpot);
event JackpotUpdated(uint256 dailyJackpot, uint256 weeklyJackpot);
event ToppingsAwarded(address indexed player, uint256 amount, string reason);
```

### Event Monitoring Strategy
1. **Frontend Tracking**: Real-time event listening for UI updates
2. **Backend Monitoring**: Server-side event processing for analytics
3. **Blockchain Indexing**: Indexer services for historical data
4. **Alert System**: Automated notifications for significant events

## Wallet Integration Architecture

### Multi-Wallet Support
```typescript
export const WALLETS: WalletInfo[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    color: "bg-orange-500 hover:bg-orange-600",
    mobile: true,
    deepLink: "metamask://",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet", 
    icon: "🪙",
    color: "bg-blue-500 hover:bg-blue-600",
    mobile: true,
    deepLink: "coinbasewallet://",
  },
  // ... additional wallets
]
```

### Security Disconnect Implementation
```typescript
const disconnect = useCallback(() => {
    // Clear all connection state
    setConnection(null)
    setError(null)

    // Complete localStorage cleanup
    if (typeof window !== "undefined") {
        localStorage.removeItem("wallet_connection")
        sessionStorage.removeItem("wallet_connection")
        
        // Clear all wallet-related data
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && (key.includes('wallet') || key.includes('ethereum'))) {
                keysToRemove.push(key)
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Provider disconnect
        if (window.ethereum?.disconnect) {
            window.ethereum.disconnect()
        }
    }
    
    // Force clean state
    window.location.reload()
}, [])
```

### Mobile Optimization
- **Device Detection**: Automatic mobile browser detection
- **Deep Linking**: Wallet-specific app links
- **Fallback Strategies**: Multiple connection approaches
- **Touch Optimization**: Mobile-friendly UI components

## Gas Efficiency Features

### Batch Processing
```solidity
function processBatchPlayers(address[] memory players, uint256[] memory amounts) external {
    require(players.length <= BATCH_SIZE, "Batch size too large");
    
    for (uint256 i = 0; i < players.length; i++) {
        _processPlayerOptimized(players[i], amounts[i]);
    }
}
```

### Storage Optimization
- **Storage Pointers**: Efficient data access patterns
- **Memory Management**: Proper cleanup of temporary data
- **Event Optimization**: Minimal event emissions
- **Gas Estimation**: Pre-transaction gas estimation

## Security Audit Findings

### Implemented Fixes
1. **MED-001**: Enhanced randomness with multiple entropy sources
2. **MED-002**: Role-based access control implementation
3. **MED-003**: Atomic jackpot updates with state locking
4. **MED-004**: Enhanced referral code validation
5. **MED-005**: Gas optimization for batch operations

### Ongoing Security Measures
- **Regular Audits**: Quarterly security reviews
- **Bug Bounty**: Active vulnerability reporting program
- **Monitoring**: Real-time security event monitoring
- **Emergency Procedures**: Pause functionality for critical issues

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
}
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
}
```

## Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for reduced bundle size
- **Lazy Loading**: Components loaded on demand
- **Caching Strategy**: Efficient data caching
- **Mobile First**: Responsive design optimization

### Backend Optimizations
- **Database Indexing**: Optimized query performance
- **CDN Integration**: Global content delivery
- **API Rate Limiting**: Protection against abuse
- **Monitoring**: Real-time performance tracking

## Deployment Architecture

### Smart Contract Deployment
```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deploy-testnet.ts --network base-sepolia

# Deploy to Base Mainnet  
npx hardhat run scripts/deploy.ts --network base-mainnet
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to other platforms
npm run deploy
```

## Monitoring and Analytics

### On-Chain Monitoring
- **Event Tracking**: Real-time contract event monitoring
- **Transaction Monitoring**: Failed transaction detection
- **Gas Usage**: Optimization tracking
- **Security Events**: Suspicious activity detection

### Off-Chain Analytics
- **User Behavior**: Player interaction tracking
- **Performance Metrics**: Load times and responsiveness
- **Error Tracking**: Frontend error monitoring
- **Conversion Funnels**: User journey analysis

## Future Enhancements

### Planned Features
1. **WalletConnect v2**: Enhanced mobile wallet support
2. **Wagmi Integration**: More robust wallet management
3. **Advanced Analytics**: Detailed player insights
4. **Multi-Chain Support**: Expansion to additional networks

### Technical Roadmap
1. **Layer 2 Scaling**: Optimistic rollups integration
2. **Cross-Chain Bridges**: Multi-network interoperability
3. **Advanced Randomness**: VRF integration
4. **DAO Governance**: Community-driven development 