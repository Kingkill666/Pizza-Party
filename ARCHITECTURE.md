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

## Detailed Component Breakdown

### 1. Wallet Configuration System (`wallet-config.ts`)

The wallet configuration system provides a unified interface for connecting to multiple wallet providers with robust error handling and mobile optimization.

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Wallet Configuration System                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   WALLETS   │    │  Provider   │    │  Connection │        │
│  │   Array     │◄──►│  Detection  │◄──►│  Interface  │        │
│  │             │    │             │    │             │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Mobile     │    │  Error      │    │  Platform   │        │
│  │  Detection  │    │  Handling   │    │  Detection  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### Key Components

**Wallet Interface:**
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

**Connection Interface:**
```typescript
export interface WalletConnection {
  address: string
  chainId: number
  walletName: string
  balance?: string
}
```

#### Supported Wallets

| Wallet | ID | Mobile Support | Deep Link | Universal Link |
|--------|----|----------------|-----------|----------------|
| MetaMask | `metamask` | ✅ | `metamask://` | `https://metamask.app.link/` |
| Coinbase Wallet | `coinbase` | ✅ | `coinbasewallet://` | `https://wallet.coinbase.com/` |
| Trust Wallet | `trust` | ✅ | `trust://` | `https://link.trustwallet.com/` |
| Rainbow | `rainbow` | ✅ | `rainbow://` | `https://rnbwapp.com/` |
| Phantom | `phantom` | ✅ | `phantom://` | `https://phantom.app/ul/` |

#### Mobile Detection Logic

```typescript
// Mobile detection with platform-specific handling
export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Platform-specific detection
export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false
  return /Android/.test(navigator.userAgent)
}
```

#### Provider Detection

```typescript
// Enhanced wallet provider detection for mobile
export const getWalletProvider = (walletId: string): any => {
  if (typeof window === "undefined") return null

  // Check if we're in a specific wallet's browser
  const inWalletBrowser = isInWalletBrowser()
  if (inWalletBrowser && inWalletBrowser === walletId) {
    console.log(`✅ Detected ${walletId} browser environment`)
    return window.ethereum
  }

  // For mobile, be more permissive with provider detection
  if (isMobile() && window.ethereum) {
    console.log("📱 Using available mobile provider")
    return window.ethereum
  }

  // Desktop logic with specific provider matching
  const allProviders = getAllProviders()

  switch (walletId) {
    case "metamask":
      return allProviders.find((provider) => 
        provider.isMetaMask && !provider.isCoinbaseWallet && !provider.isCoinbase
      ) || window.ethereum
    case "coinbase":
      return allProviders.find((provider) => 
        provider.isCoinbaseWallet || provider.isCoinbase
      ) || window.ethereum
    case "rainbow":
      return allProviders.find((provider) => provider.isRainbow) || window.ethereum
    default:
      return window.ethereum
  }
}
```

### 2. Jackpot Data System (`jackpot-data.ts`)

The jackpot data system manages real-time calculations for daily and weekly jackpots, player statistics, and topping rewards.

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Jackpot Data System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Community  │    │   Weekly    │    │   Player    │        │
│  │  Jackpot    │    │  Jackpot    │    │   Stats     │        │
│  │  Calculator │◄──►│  Calculator │◄──►│  Tracker    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Toppings   │    │  Countdown  │    │  Real-time  │        │
│  │  Calculator │    │  Timer      │    │  Updates    │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### Core Functions

**Community Jackpot Calculation:**
```typescript
export const calculateCommunityJackpot = (): number => {
  if (typeof window === "undefined") return 0

  // Count today's players (each player pays $1 worth of VMF)
  const today = new Date().toDateString()
  const keys = Object.keys(localStorage)
  let todaysPlayers = 0

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && 
        key.includes(today) && 
        localStorage.getItem(key) === "true") {
      todaysPlayers++
    }
  })

  // Each player pays $1 worth of VMF, so jackpot = number of players
  return todaysPlayers
}
```

**Weekly Jackpot Information:**
```typescript
export const getWeeklyJackpotInfo = () => {
  // Calculate time until next Sunday at 12pm PST
  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Find next Sunday at 12pm PST
  const nextSunday = new Date(pstTime)
  const daysUntilSunday = (7 - pstTime.getDay()) % 7
  if (daysUntilSunday === 0 && pstTime.getHours() >= 12) {
    nextSunday.setDate(nextSunday.getDate() + 7)
  } else {
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)
  }
  nextSunday.setHours(12, 0, 0, 0)

  const difference = nextSunday.getTime() - now.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  // Calculate real toppings and players from actual game data
  let totalToppings = 0
  let totalPlayers = 0

  if (typeof window !== "undefined") {
    const keys = Object.keys(localStorage)
    const uniquePlayers = new Set()

    keys.forEach((key) => {
      // Daily play entries (1 topping per day played)
      if (key.startsWith("pizza_entry_")) {
        const today = new Date().toDateString()
        if (key.includes(today) && localStorage.getItem(key) === "true") {
          totalToppings += 1 // 1 topping for daily play
          const address = key.replace("pizza_entry_", "").replace(`_${today}`, "")
          uniquePlayers.add(address)
        }
      }

      // Referral success records (2 toppings per referral)
      if (key.startsWith("pizza_referral_success_")) {
        const address = key.replace("pizza_referral_success_", "")
        const successRecord = JSON.parse(localStorage.getItem(key) || "[]")
        const referralToppings = successRecord.length * 2 // 2 toppings per referral
        totalToppings += referralToppings
        uniquePlayers.add(address)
      }

      // VMF holdings (1 topping per 10 VMF - simulated for now)
      if (key.startsWith("pizza_vmf_holdings_")) {
        const address = key.replace("pizza_vmf_holdings_", "")
        const vmfAmount = Number.parseInt(localStorage.getItem(key) || "0")
        const vmfToppings = Math.floor(vmfAmount / 10) // 1 topping per 10 VMF
        totalToppings += vmfToppings
        uniquePlayers.add(address)
      }

      // Streak bonuses (3 toppings for 7-day streak)
      if (key.startsWith("pizza_streak_")) {
        const address = key.replace("pizza_streak_", "")
        const streakDays = Number.parseInt(localStorage.getItem(key) || "0")
        if (streakDays >= 7) {
          totalToppings += 3 // 3 toppings for 7-day streak
        }
        uniquePlayers.add(address)
      }

      // Legacy toppings storage (for backward compatibility)
      if (key.startsWith("pizza_toppings_")) {
        const toppings = Number.parseInt(localStorage.getItem(key) || "0")
        if (toppings > 0) {
          totalToppings += toppings
          const address = key.replace("pizza_toppings_", "")
          uniquePlayers.add(address)
        }
      }
    })

    totalPlayers = uniquePlayers.size
  }

  return {
    timeUntilDraw: { days, hours, minutes, seconds },
    totalToppings,
    totalPlayers,
  }
}
```

#### Data Storage Patterns

**LocalStorage Key Structure:**
```
pizza_entry_{address}_{date} = "true"
pizza_referral_success_{address} = JSON.stringify([referral1, referral2])
pizza_vmf_holdings_{address} = "100"
pizza_streak_{address} = "7"
pizza_toppings_{address} = "15"
```

**Real-time Data Updates:**
```typescript
// Auto-refresh jackpot data every 5 seconds
useEffect(() => {
  const updateJackpot = () => {
    const jackpot = calculateCommunityJackpot()
    setCommunityJackpot(jackpot)
  }

  updateJackpot()
  const interval = setInterval(updateJackpot, 5000)
  return () => clearInterval(interval)
}, [])
```

### 3. Payout System (`payout-utils.ts`)

The payout system handles winner selection, prize distribution, and payout history management with robust error handling.

#### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Payout System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Daily     │    │   Weekly    │    │   Winner    │        │
│  │  Payout     │    │  Payout     │    │ Selection   │        │
│  │  Processor  │◄──►│  Processor  │◄──►│  Algorithm  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Payout     │    │  Error      │    │  Data       │        │
│  │  History    │    │  Handling   │    │  Validation │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

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

#### Winner Selection Algorithm

**Daily Winner Selection (Weighted Random):**
```typescript
export const selectDailyWinners = (totalEntries: number): string[] => {
  try {
    const winners: string[] = []
    const addresses = getPlayerAddresses()
    
    if (addresses.length === 0) {
      return winners
    }
    
    // Use weighted selection based on entry count
    const entryCounts = new Map<string, number>()
    addresses.forEach(address => {
      const count = getPlayerEntryCount(address)
      entryCounts.set(address, count)
    })
    
    const totalWeight = Array.from(entryCounts.values())
      .reduce((sum, count) => sum + count, 0)
    
    for (let i = 0; i < 8 && i < addresses.length; i++) {
      const random = Math.random() * totalWeight
      let currentWeight = 0
      
      for (const [address, count] of entryCounts) {
        currentWeight += count
        if (random <= currentWeight && !winners.includes(address)) {
          winners.push(address)
          break
        }
      }
    }
    
    return winners
  } catch (error) {
    console.error("Error selecting daily winners:", error)
    throw new PayoutError("Failed to select daily winners", "WINNER_SELECTION_ERROR")
  }
}
```

**Weekly Winner Selection (Toppings-Based):**
```typescript
export const selectWeeklyWinners = (players: PlayerData[]): string[] => {
  try {
    const winners: string[] = []
    
    if (players.length === 0) {
      return winners
    }
    
    // Create weighted selection based on toppings
    const totalWeight = players.reduce((sum, player) => sum + player.toppings, 0)
    
    for (let i = 0; i < 10 && i < players.length; i++) {
      const random = Math.random() * totalWeight
      let currentWeight = 0
      
      for (const player of players) {
        currentWeight += player.toppings
        if (random <= currentWeight && !winners.includes(player.address)) {
          winners.push(player.address)
          break
        }
      }
    }
    
    return winners
  } catch (error) {
    console.error("Error selecting weekly winners:", error)
    throw new PayoutError("Failed to select weekly winners", "WINNER_SELECTION_ERROR")
  }
}
```

#### Error Handling System

```typescript
export class PayoutError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'PayoutError'
  }
}

// Error codes for different failure scenarios
const ERROR_CODES = {
  GAME_DATA_ERROR: 'Failed to get current game data',
  WEEKLY_DATA_ERROR: 'Failed to get weekly data',
  ADDRESS_ERROR: 'Failed to get player addresses',
  WINNER_SELECTION_ERROR: 'Failed to select winners',
  SAVE_ERROR: 'Failed to save payout record',
  RESET_ERROR: 'Failed to reset game data',
  NO_ENTRIES: 'No entries found for today',
  NO_PLAYERS: 'No players found for weekly payout',
  NO_WINNERS: 'No winners selected'
} as const
```

## Integration Patterns

### 1. Wallet Integration Flow

```
User Clicks Wallet → Provider Detection → Connection Request → Balance Check → UI Update
       ↓                    ↓                    ↓                ↓              ↓
   Wallet Button    getWalletProvider()   requestWalletConnection()  useVMFBalance()  WalletStatus
```

### 2. Game Entry Flow

```
User Enters Game → Validation → Smart Contract → VMF Transfer → Toppings Award → UI Update
       ↓              ↓              ↓              ↓              ↓              ↓
   Enter Button   validateInput()   enterDailyGame()   transfer()   awardToppings()   JackpotDisplay
```

### 3. Payout Processing Flow

```
Admin Triggers Payout → Winner Selection → Prize Calculation → Distribution → History Update
         ↓                    ↓                    ↓                ↓              ↓
   Process Button    selectWinners()    calculatePrizes()   distribute()   saveRecord()
```

## Security Architecture

### 1. Input Validation Layer

```typescript
// Multi-layer validation system
export const validateWalletAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false
  return true
}

export const validateReferralCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') return false
  if (!/^[a-zA-Z0-9]{6,12}$/.test(code)) return false
  return true
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 100)
}
```

### 2. Error Handling Strategy

```typescript
// Centralized error handling
const handleError = (error: Error, context: string) => {
  console.error(`Error in ${context}:`, error)
  
  // Log to monitoring service
  if (typeof window !== 'undefined') {
    // Send to Sentry or similar
    console.log('Sending error to monitoring service')
  }
  
  // Return user-friendly message
  return `Something went wrong. Please try again.`
}

// Try-catch with specific error types
try {
  const connection = await requestWalletConnection('metamask')
  // Process connection
} catch (error) {
  if (error instanceof WalletConnectionError) {
    console.error('Wallet connection failed:', error.message)
  } else if (error instanceof PayoutError) {
    console.error('Payout error:', error.code, error.message)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

### 3. Rate Limiting

```typescript
// Simple rate limiting for game entries
const rateLimiter = new Map<string, number>()

export const checkRateLimit = (address: string, limitMs: number = 60000): boolean => {
  const now = Date.now()
  const lastEntry = rateLimiter.get(address)
  
  if (lastEntry && (now - lastEntry) < limitMs) {
    return false // Rate limited
  }
  
  rateLimiter.set(address, now)
  return true // Allowed
}
```

## Performance Optimization

### 1. Memoization Strategy

```typescript
// Memoize expensive calculations
const jackpot = useMemo(() => {
  return calculateCommunityJackpot()
}, []) // Recalculate only when dependencies change

const formattedJackpot = useMemo(() => {
  return formatJackpotAmount(jackpot)
}, [jackpot])

// Memoize callback functions
const handleWalletConnect = useCallback(async (walletId: string) => {
  try {
    const connection = await requestWalletConnection(walletId)
    // Handle connection
  } catch (error) {
    // Handle error
  }
}, []) // Empty dependency array since function doesn't depend on props/state
```

### 2. Lazy Loading

```typescript
// Lazy load heavy components
const PayoutSystem = lazy(() => import('@/components/PayoutSystem'))
const AdminPanel = lazy(() => import('@/components/AdminPanel'))

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
  )
}
```

### 3. Real-time Updates

```typescript
// Efficient real-time updates
useEffect(() => {
  const updateData = () => {
    const jackpot = calculateCommunityJackpot()
    const weeklyInfo = getWeeklyJackpotInfo()
    
    setCommunityJackpot(jackpot)
    setWeeklyInfo(weeklyInfo)
  }

  updateData()
  const interval = setInterval(updateData, 5000)
  return () => clearInterval(interval)
}, [])
```

## Deployment Architecture

### 1. Frontend Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Deployment                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Vercel    │    │   CDN       │    │   Analytics │        │
│  │   Hosting   │◄──►│   (CloudFlare) │◄──►│   (Sentry)  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Next.js   │    │   Static    │    │   Error     │        │
│  │   Build     │    │   Assets    │    │   Tracking  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Smart Contract Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                  Smart Contract Deployment                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Hardhat   │    │   Base      │    │   Basescan  │        │
│  │   Deploy    │◄──►│   Network   │◄──►│   Explorer  │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │   Contract  │    │   Gas       │    │   Contract  │        │
│  │   Verification │    │   Optimization │    │   Interaction │        │
│  └─────────────┘    └─────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Monitoring and Analytics

### 1. Performance Monitoring

```typescript
// Performance tracking
export const trackPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined') {
    // Send to analytics service
    console.log(`Performance: ${metric} = ${value}`)
  }
}

// Usage analytics
export const trackUsage = (action: string, data?: any) => {
  if (typeof window !== 'undefined') {
    // Send to analytics service
    console.log(`Usage: ${action}`, data)
  }
}
```

### 2. Error Tracking

```typescript
// Error tracking with context
export const trackError = (error: Error, context: string) => {
  if (typeof window !== 'undefined') {
    // Send to error tracking service
    console.error(`Error in ${context}:`, error)
  }
}
```

This comprehensive architecture documentation provides detailed insights into the Pizza Party dApp's component structure, integration patterns, security measures, and performance optimizations. 