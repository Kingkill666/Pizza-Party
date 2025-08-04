# Pizza Party dApp Architecture

## System Overview

The Pizza Party dApp is a decentralized gaming platform built on the Base network, featuring daily and weekly jackpots, a referral system, and multi-platform wallet support. This document provides detailed architectural insights, component relationships, and integration patterns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pizza Party dApp                            │
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

### Smart Contract Layer (Solidity)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Smart Contract Layer                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ PizzaParty  │    │   MockVMF   │    │  OpenZeppelin│        │
│  │   Contract  │    │   Token     │    │   Libraries  │        │
│  │             │    │             │    │             │        │
│  │ • Game Logic│    │ • ERC20     │    │ • Ownable   │        │
│  │ • Jackpots  │    │ • Minting   │    │ • Pausable  │        │
│  │ • Referrals │    │ • Burning   │    │ • Reentrancy│        │
│  │ • Toppings  │    │ • Transfer  │    │   Guard     │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Events    │    │   Modifiers │    │   Structs   │        │
│  │             │    │             │    │             │        │
│  │ • Player    │    │ • notBlack- │    │ • Player    │        │
│  │   Entered   │    │   listed    │    │ • Referral  │        │
│  │ • Winners   │    │ • validRef  │    │ • Game      │        │
│  │ • Toppings  │    │ • onlyOwner │    │ • Jackpot   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Component Documentation

### Wallet Configuration System (`lib/wallet-config.ts`)

The wallet configuration system provides seamless multi-platform wallet integration with automatic detection and connection management.

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Wallet Configuration System                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Platform   │    │   Wallet    │    │ Connection  │        │
│  │  Detection  │    │  Detection  │    │  Management │        │
│  │             │    │             │    │             │        │
│  │ • Mobile    │    │ • MetaMask  │    │ • Connect   │        │
│  │ • Desktop   │    │ • Coinbase  │    │ • Disconnect│        │
│  │ • Browser   │    │ • Trust     │    │ • Persist   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ Deep Linking│    │ Extension   │    │ Error       │        │
│  │             │    │   API       │    │ Handling    │        │
│  │ • Mobile    │    │ • Desktop   │    │ • Network   │        │
│  │ • QR Codes  │    │ • Browser   │    │ • Rejection │        │
│  │ • Universal │    │ • Injected  │    │ • Timeout   │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### Data Flow

```
User Action → Platform Detection → Wallet Selection → Connection Request
     ↓              ↓                    ↓                ↓
UI Update ← Connection State ← Error Handling ← Network Validation
     ↓              ↓                    ↓                ↓
localStorage ← Persistence ← Event Listeners ← Account Changes
```

#### Key Functions

##### `detectPlatform()`
Detects the current platform and available wallets.

**Implementation:**
```typescript
export const detectPlatform = (): PlatformInfo => {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isDesktop = !isMobile;
  
  const availableWallets = isMobile 
    ? ['coinbase', 'trust', 'rainbow', 'phantom']
    : ['metamask', 'coinbase', 'rainbow', 'phantom'];
    
  return {
    isMobile,
    isDesktop,
    availableWallets,
    recommendedWallet: availableWallets[0]
  };
};
```

##### `requestWalletConnection(walletId: string)`
Handles wallet connection with platform-specific logic.

**Implementation:**
```typescript
export const requestWalletConnection = async (walletId: string): Promise<WalletConnection> => {
  const platform = detectPlatform();
  
  if (platform.isMobile) {
    return connectMobileWallet(walletId);
  } else {
    return connectDesktopWallet(walletId);
  }
};
```

#### Error Handling Patterns

```typescript
// Comprehensive error handling
const handleWalletError = (error: any) => {
  switch (error.code) {
    case 'WALLET_NOT_FOUND':
      return 'Please install the wallet extension';
    case 'USER_REJECTED':
      return 'Connection cancelled by user';
    case 'NETWORK_MISMATCH':
      return 'Please switch to Base network';
    case 'ACCOUNT_CHANGED':
      return 'Account changed, please reconnect';
    default:
      return 'Connection failed: ' + error.message;
  }
};
```

### Jackpot Data System (`lib/jackpot-data.ts`)

The jackpot data system manages real-time calculations for daily and weekly jackpots, player statistics, and topping rewards.

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Jackpot Data System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Data       │    │ Calculation │    │ Real-time   │        │
│  │  Sources    │    │   Engine    │    │   Updates   │        │
│  │             │    │             │    │             │        │
│  │ • localStorage│  │ • Jackpot   │    │ • React     │        │
│  │ • Smart     │    │ • Players   │    │   State     │        │
│  │   Contract  │    │ • Toppings  │    │ • Auto-refresh│      │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Persistence│    │  Validation │    │  Formatting │        │
│  │             │    │             │    │             │        │
│  │ • Backup    │    │ • Data      │    │ • Numbers   │        │
│  │ • Sync      │    │   Integrity │    │ • Currency  │        │
│  │ • Recovery  │    │ • Sanitize  │    │ • Time      │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### Data Flow

```
localStorage → Data Extraction → Calculation → Validation → UI Update
     ↓              ↓                ↓            ↓            ↓
Player Entries → Jackpot Logic → Real-time → Error Check → React State
     ↓              ↓                ↓            ↓            ↓
Referral Data → Player Stats → Auto-refresh → Persistence → Backup
```

#### Key Functions

##### `calculateCommunityJackpot()`
Calculates the current daily jackpot based on real player activity.

**Implementation:**
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
  
  // Each player pays $1 worth of VMF
  return todaysPlayers;
};
```

##### `getWeeklyJackpotInfo()`
Provides comprehensive weekly jackpot information.

**Implementation:**
```typescript
export const getWeeklyJackpotInfo = () => {
  // Calculate time until next Sunday at 12pm PST
  const nextSunday = calculateNextSunday();
  const timeUntilDraw = calculateTimeDifference(nextSunday);
  
  // Calculate real toppings and players
  const { totalToppings, totalPlayers } = calculateRealData();
  
  return {
    totalToppings,
    totalPlayers,
    timeUntilDraw
  };
};
```

#### Topping Calculation Logic

```typescript
// Comprehensive topping calculation
const calculateToppings = () => {
  let totalToppings = 0;
  const keys = Object.keys(localStorage);
  
  keys.forEach((key) => {
    // Daily play (1 topping per day)
    if (key.startsWith("pizza_entry_")) {
      totalToppings += 1;
    }
    
    // Referrals (2 toppings per referral)
    if (key.startsWith("pizza_referral_success_")) {
      const successRecord = JSON.parse(localStorage.getItem(key) || "[]");
      totalToppings += successRecord.length * 2;
    }
    
    // VMF holdings (1 topping per 10 VMF)
    if (key.startsWith("pizza_vmf_holdings_")) {
      const vmfAmount = Number.parseInt(localStorage.getItem(key) || "0");
      totalToppings += Math.floor(vmfAmount / 10);
    }
    
    // Streak bonus (3 toppings for 7-day streak)
    if (key.startsWith("pizza_streak_")) {
      const streakDays = Number.parseInt(localStorage.getItem(key) || "0");
      if (streakDays >= 7) {
        totalToppings += 3;
      }
    }
  });
  
  return totalToppings;
};
```

## Integration Patterns

### Component Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component Integration                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Pages     │    │ Components  │    │    Hooks    │        │
│  │             │    │             │    │             │        │
│  │ • /game     │◄──►│ • Wallet    │◄──►│ • useWallet │        │
│  │ • /jackpot  │    │ • Jackpot   │    │ • useVMF    │        │
│  │ • /admin    │    │ • Game      │    │ • useMobile │        │
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

### Data Flow Integration

```
User Action → Wallet Connection → Smart Contract → localStorage → UI Update
     ↓              ↓                ↓              ↓            ↓
Validation ← Platform Check ← Balance Check ← Data Sync ← Real-time
     ↓              ↓                ↓              ↓            ↓
Error Handle ← Connection State ← Event Listeners ← Persistence ← Backup
```

## Security Architecture

### Input Validation

```typescript
// Comprehensive validation system
const validateInputs = {
  walletAddress: (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address),
  referralCode: (code: string) => /^[A-Z0-9]{6,12}$/.test(code),
  vmfAmount: (amount: number) => amount >= 1 && amount <= 1000000,
  gameEntry: (entry: any) => {
    return entry && 
           typeof entry.address === 'string' &&
           typeof entry.timestamp === 'number';
  }
};
```

### Data Integrity

```typescript
// Data integrity verification
const verifyDataIntegrity = () => {
  const keys = Object.keys(localStorage);
  const pizzaKeys = keys.filter(key => key.startsWith('pizza_'));
  
  return pizzaKeys.every(key => {
    const value = localStorage.getItem(key);
    return value !== null && 
           value !== undefined && 
           value !== '';
  });
};
```

## Performance Optimization

### Caching Strategy

```typescript
// Efficient caching system
const cache = new Map();

const getCachedData = (key: string, ttl: number = 5000) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};
```

### Real-time Updates

```typescript
// Optimized real-time updates
const useRealTimeData = (key: string, updateFn: () => any) => {
  const [data, setData] = useState(updateFn);
  
  useEffect(() => {
    const updateData = () => {
      setData(updateFn());
    };
    
    updateData();
    const interval = setInterval(updateData, 1000);
    
    return () => clearInterval(interval);
  }, [updateFn]);
  
  return data;
};
```

## Deployment Architecture

### Environment Configuration

```
┌─────────────────────────────────────────────────────────────────┐
│                    Environment Configuration                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │ Development │    │   Staging   │    │ Production  │        │
│  │             │    │             │    │             │        │
│  │ • localhost │    │ • testnet   │    │ • mainnet   │        │
│  │ • MockVMF   │    │ • Base Sepolia│  │ • Base     │        │
│  │ • Hardhat   │    │ • Test VMF  │    │ • VMF Token│        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Testing   │    │   QA        │    │ Monitoring  │        │
│  │             │    │             │    │             │        │
│  │ • Unit      │    │ • Integration│   │ • Sentry    │        │
│  │ • Integration│   │ • E2E       │    │ • Analytics │        │
│  │ • Coverage  │    │ • Performance│   │ • Alerts    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Monitoring and Analytics

### Performance Monitoring

```typescript
// Performance monitoring system
const monitorPerformance = {
  trackWalletConnection: (walletId: string, duration: number) => {
    console.log(`Wallet connection to ${walletId} took ${duration}ms`);
  },
  
  trackGameEntry: (entryTime: number) => {
    console.log(`Game entry processed in ${Date.now() - entryTime}ms`);
  },
  
  trackJackpotCalculation: (calculationTime: number) => {
    console.log(`Jackpot calculation took ${calculationTime}ms`);
  }
};
```

### Error Tracking

```typescript
// Comprehensive error tracking
const trackError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { context });
  }
};
```

This architectural documentation provides developers with comprehensive insights into the Pizza Party dApp's structure, component relationships, and integration patterns. 