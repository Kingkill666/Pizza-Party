# Integration Guide

## 🔗 Overview

This guide covers how to integrate the Pizza Party dApp with external systems, APIs, and platforms. The dApp is designed to be modular and extensible for various integration scenarios.

## 🏗️ Architecture Overview

### Smart Contract Integration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart         │    │   Base          │
│   (Next.js)     │◄──►│   Contract      │◄──►│   Network       │
│                 │    │   (Solidity)    │    │   (L2)          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Wallet        │    │   VMF Token     │    │   External      │
│   Providers     │    │   Contract      │    │   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Structure
```
components/
├── PlatformWallet.tsx     # Multi-platform wallet support
├── WalletStatus.tsx       # Wallet connection status
├── PayoutSystem.tsx       # Enhanced payout system
└── ui/                    # UI components

lib/
├── vmf-contract.ts        # VMF token integration
├── wallet-config.ts       # Wallet configuration
├── jackpot-data.ts        # Jackpot calculations
└── utils.ts              # Utility functions

hooks/
├── useWallet.ts          # Wallet connection hook
├── useVMFBalance.ts      # VMF balance hook
└── use-mobile.ts         # Mobile detection hook
```

## 🔌 API Integration

### Smart Contract ABI
```typescript
// Core contract functions
const PIZZA_PARTY_ABI = [
  // Player functions
  "function enterDailyGame(string memory referralCode) external",
  "function createReferralCode() external",
  "function awardVMFHoldingsToppings() external",
  
  // Admin functions
  "function drawDailyWinners() external onlyOwner",
  "function drawWeeklyWinners() external onlyOwner",
  "function emergencyPause(bool pause) external onlyOwner",
  "function setPlayerBlacklist(address player, bool blacklisted) external onlyOwner",
  
  // View functions
  "function hasEnteredToday(address player) public view returns (bool)",
  "function getPlayerInfo(address player) external view returns (Player memory)",
  "function getCurrentGame() external view returns (Game memory)",
  
  // Events
  "event PlayerEntered(address indexed player, uint256 gameId, uint256 entryFee)",
  "event DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount)",
  "event WeeklyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount)",
  "event ToppingsAwarded(address indexed player, uint256 amount, string reason)",
  "event ReferralCreated(address indexed referrer, string referralCode)",
  "event ReferralUsed(address indexed referrer, address indexed newPlayer, uint256 reward)",
  "event PlayerBlacklisted(address indexed player, bool blacklisted)",
  "event EmergencyPause(bool paused)"
];
```

### Contract Addresses
```typescript
// Base Network Addresses
export const CONTRACT_ADDRESSES = {
  base: {
    pizzaParty: "0xDEPLOYED_CONTRACT_ADDRESS",
    vmfToken: "0x2213414893259b0C48066Acd1763e7fbA97859E5"
  },
  baseSepolia: {
    pizzaParty: "0xTESTNET_CONTRACT_ADDRESS",
    vmfToken: "0x2213414893259b0C48066Acd1763e7fbA97859E5"
  }
};
```

## 🎮 Game Integration

### Daily Game Integration
```typescript
// Enter daily game
const enterDailyGame = async (referralCode?: string) => {
  const contract = new ethers.Contract(
    PIZZA_PARTY_ADDRESS,
    PIZZA_PARTY_ABI,
    signer
  );
  
  const tx = await contract.enterDailyGame(referralCode || "");
  await tx.wait();
  
  return tx;
};

// Check if player has entered today
const hasEnteredToday = async (playerAddress: string) => {
  const contract = new ethers.Contract(
    PIZZA_PARTY_ADDRESS,
    PIZZA_PARTY_ABI,
    provider
  );
  
  return await contract.hasEnteredToday(playerAddress);
};
```

### Weekly Jackpot Integration
```typescript
// Get weekly jackpot info
const getWeeklyJackpotInfo = () => {
  return {
    totalToppings: calculateTotalToppings(),
    totalPlayers: getUniquePlayerCount(),
    timeUntilDraw: calculateTimeUntilDraw(),
    jackpotAmount: calculateWeeklyJackpot()
  };
};

// Draw weekly winners (admin only)
const drawWeeklyWinners = async () => {
  const contract = new ethers.Contract(
    PIZZA_PARTY_ADDRESS,
    PIZZA_PARTY_ABI,
    adminSigner
  );
  
  const tx = await contract.drawWeeklyWinners();
  await tx.wait();
  
  return tx;
};
```

## 💰 VMF Token Integration

### Balance Checking
```typescript
// Get VMF balance
const getVMFBalance = async (address: string) => {
  const contract = new ethers.Contract(
    VMF_TOKEN_ADDRESS,
    VMF_ABI,
    provider
  );
  
  const balance = await contract.balanceOf(address);
  return formatVMFBalance(balance);
};

// Check minimum balance
const hasMinimumVMF = async (address: string, minimum: number) => {
  const balance = await getVMFBalance(address);
  return balance >= minimum;
};
```

### Token Transfer
```typescript
// Transfer VMF tokens
const transferVMF = async (to: string, amount: number) => {
  const contract = new ethers.Contract(
    VMF_TOKEN_ADDRESS,
    VMF_ABI,
    signer
  );
  
  const amountWei = vmfToWei(amount);
  const tx = await contract.transfer(to, amountWei);
  await tx.wait();
  
  return tx;
};
```

## 🔐 Security Integration

### Access Control
```typescript
// Check if address is owner
const isOwner = async (address: string) => {
  const contract = new ethers.Contract(
    PIZZA_PARTY_ADDRESS,
    PIZZA_PARTY_ABI,
    provider
  );
  
  const owner = await contract.owner();
  return address.toLowerCase() === owner.toLowerCase();
};

// Check if player is blacklisted
const isBlacklisted = async (address: string) => {
  const contract = new ethers.Contract(
    PIZZA_PARTY_ADDRESS,
    PIZZA_PARTY_ABI,
    provider
  );
  
  const player = await contract.getPlayerInfo(address);
  return player.isBlacklisted;
};
```

### Emergency Controls
```typescript
// Pause contract (admin only)
const pauseContract = async () => {
  const contract = new ethers.Contract(
    PIZZA_PARTY_ADDRESS,
    PIZZA_PARTY_ABI,
    adminSigner
  );
  
  const tx = await contract.emergencyPause(true);
  await tx.wait();
  
  return tx;
};

// Emergency withdrawal (admin only)
const emergencyWithdraw = async () => {
  const contract = new ethers.Contract(
    PIZZA_PARTY_ADDRESS,
    PIZZA_PARTY_ABI,
    adminSigner
  );
  
  const tx = await contract.emergencyWithdraw();
  await tx.wait();
  
  return tx;
};
```

## 📱 Multi-Platform Integration

### Wallet Provider Integration
```typescript
// Supported wallet providers
const WALLET_PROVIDERS = {
  metamask: {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    color: "bg-orange-500 hover:bg-orange-600",
    mobile: true,
    deepLink: "metamask://dapp/",
    universalLink: "https://metamask.app.link/dapp/"
  },
  coinbase: {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    color: "bg-blue-600 hover:bg-blue-700",
    mobile: true,
    deepLink: "cbwallet://dapp/",
    universalLink: "https://go.cb-w.com/dapp?cb_url="
  },
  // ... other providers
};

// Connect to wallet
const connectWallet = async (providerId: string) => {
  const provider = WALLET_PROVIDERS[providerId];
  
  if (!provider) {
    throw new Error("Unsupported wallet provider");
  }
  
  // Implementation for each provider
  switch (providerId) {
    case "metamask":
      return await connectMetaMask();
    case "coinbase":
      return await connectCoinbase();
    // ... other providers
  }
};
```

### Mobile Optimization
```typescript
// Mobile detection
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Platform-specific optimizations
const getPlatformConfig = () => {
  if (isMobile()) {
    return {
      touchOptimized: true,
      largeButtons: true,
      simplifiedUI: true,
      deepLinking: true
    };
  }
  
  return {
    touchOptimized: false,
    largeButtons: false,
    simplifiedUI: false,
    deepLinking: false
  };
};
```

## 🔄 Event Integration

### Contract Event Listening
```typescript
// Listen to contract events
const listenToEvents = (contract: ethers.Contract) => {
  // Player entered event
  contract.on("PlayerEntered", (player, gameId, entryFee) => {
    console.log(`Player ${player} entered game ${gameId} with ${entryFee} VMF`);
    updateUI();
  });
  
  // Winners selected event
  contract.on("DailyWinnersSelected", (gameId, winners, jackpotAmount) => {
    console.log(`Daily winners selected for game ${gameId}:`, winners);
    showWinners(winners, jackpotAmount);
  });
  
  // Toppings awarded event
  contract.on("ToppingsAwarded", (player, amount, reason) => {
    console.log(`Player ${player} awarded ${amount} toppings for ${reason}`);
    updateToppingsDisplay(player, amount);
  });
};
```

### Real-time Updates
```typescript
// Poll for updates
const pollForUpdates = () => {
  setInterval(async () => {
    const jackpot = await getCurrentJackpot();
    const playerCount = await getPlayerCount();
    const timeLeft = await getTimeUntilDraw();
    
    updateDisplay({ jackpot, playerCount, timeLeft });
  }, 5000); // Update every 5 seconds
};
```

## 📊 Analytics Integration

### User Analytics
```typescript
// Track user interactions
const trackEvent = (eventName: string, data: any) => {
  // Send to analytics service
  analytics.track(eventName, {
    ...data,
    timestamp: Date.now(),
    userAddress: getCurrentWalletAddress(),
    network: "base"
  });
};

// Track game events
const trackGameEvent = (eventType: string, gameData: any) => {
  trackEvent(`game_${eventType}`, {
    gameId: gameData.gameId,
    jackpotAmount: gameData.jackpotAmount,
    playerCount: gameData.playerCount,
    timestamp: gameData.timestamp
  });
};
```

### Performance Monitoring
```typescript
// Monitor transaction performance
const monitorTransaction = async (tx: ethers.Transaction) => {
  const startTime = Date.now();
  
  try {
    await tx.wait();
    const duration = Date.now() - startTime;
    
    trackEvent("transaction_success", {
      gasUsed: tx.gasLimit,
      duration,
      network: "base"
    });
  } catch (error) {
    trackEvent("transaction_failed", {
      error: error.message,
      network: "base"
    });
  }
};
```

## 🔧 Configuration Integration

### Environment Configuration
```typescript
// Environment variables
const CONFIG = {
  network: process.env.NEXT_PUBLIC_NETWORK || "base",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  vmfTokenAddress: process.env.NEXT_PUBLIC_VMF_TOKEN_ADDRESS,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  apiKey: process.env.NEXT_PUBLIC_API_KEY
};

// Network configuration
const NETWORK_CONFIG = {
  base: {
    chainId: 8453,
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    blockExplorer: "https://basescan.org"
  },
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    blockExplorer: "https://sepolia.basescan.org"
  }
};
```

### Feature Flags
```typescript
// Feature flag configuration
const FEATURE_FLAGS = {
  referralSystem: true,
  weeklyJackpot: true,
  mobileOptimization: true,
  adminPanel: process.env.NODE_ENV === "development",
  analytics: process.env.NODE_ENV === "production"
};

// Check feature availability
const isFeatureEnabled = (feature: string) => {
  return FEATURE_FLAGS[feature] || false;
};
```

## 🧪 Testing Integration

### Contract Testing
```typescript
// Test contract functions
const testContractIntegration = async () => {
  const contract = new ethers.Contract(
    PIZZA_PARTY_ADDRESS,
    PIZZA_PARTY_ABI,
    testSigner
  );
  
  // Test daily game entry
  const tx = await contract.enterDailyGame("");
  await tx.wait();
  
  // Test referral code creation
  const referralTx = await contract.createReferralCode();
  await referralTx.wait();
  
  // Test admin functions
  if (await isOwner(testSigner.address)) {
    const pauseTx = await contract.emergencyPause(true);
    await pauseTx.wait();
  }
};
```

### Frontend Testing
```typescript
// Test wallet integration
const testWalletIntegration = async () => {
  // Test MetaMask connection
  const metamaskResult = await connectWallet("metamask");
  expect(metamaskResult).toBeDefined();
  
  // Test balance checking
  const balance = await getVMFBalance(testAddress);
  expect(balance).toBeGreaterThanOrEqual(0);
  
  // Test game entry
  const entryResult = await enterDailyGame();
  expect(entryResult).toBeDefined();
};
```

## 📚 Documentation Integration

### API Documentation
```typescript
// Generate API documentation
const generateAPIDocs = () => {
  return {
    smartContract: {
      address: PIZZA_PARTY_ADDRESS,
      abi: PIZZA_PARTY_ABI,
      functions: getContractFunctions(),
      events: getContractEvents()
    },
    frontend: {
      hooks: getAvailableHooks(),
      components: getAvailableComponents(),
      utilities: getAvailableUtilities()
    }
  };
};
```

### Integration Examples
```typescript
// Example integration code
const integrationExample = {
  // Connect wallet
  connectWallet: async (providerId: string) => {
    const provider = WALLET_PROVIDERS[providerId];
    return await connectWallet(provider);
  },
  
  // Enter daily game
  enterGame: async (referralCode?: string) => {
    const contract = getContract();
    return await contract.enterDailyGame(referralCode || "");
  },
  
  // Get player info
  getPlayerInfo: async (address: string) => {
    const contract = getContract();
    return await contract.getPlayerInfo(address);
  },
  
  // Listen to events
  listenToEvents: (callback: Function) => {
    const contract = getContract();
    contract.on("PlayerEntered", callback);
  }
};
```

---

**For more detailed integration examples and advanced usage, refer to the source code and API documentation.** 