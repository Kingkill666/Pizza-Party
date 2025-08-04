# Pizza Party dApp Architecture

## 🏗️ System Overview

The Pizza Party dApp is a decentralized gaming platform built on the Base network with a focus on security, scalability, and user experience. The architecture follows a modular, event-driven pattern with clear separation of concerns.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15.2.4 │ React 19 │ TypeScript │ Tailwind CSS   │
│  ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐ │
│  │   Pages     │ │Components│ │  Hooks   │ │   Utils     │ │
│  └─────────────┘ └─────────┘ └──────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Integration Layer                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐ │
│  │   Wallet    │ │   VMF   │ │  Game    │ │ Monitoring  │ │
│  │ Integration │ │ Contract │ │  Logic   │ │   System    │ │
│  └─────────────┘ └─────────┘ └──────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Blockchain Layer                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  PizzaParty │ │   VMF   │ │  Base    │ │  Hardhat    │ │
│  │   Contract  │ │  Token  │ │ Network  │ │  Framework  │ │
│  └─────────────┘ └─────────┘ └──────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Core Components

### Frontend Architecture

#### 1. **Page Structure**
```
app/
├── page.tsx              # Landing page with wallet connection
├── game/page.tsx         # Daily game interface
├── jackpot/page.tsx      # Weekly jackpot display
├── admin/page.tsx        # Admin panel with security controls
└── debug/page.tsx        # Development and testing tools
```

#### 2. **Component Architecture**
```
components/
├── ui/                   # Reusable UI components (shadcn/ui)
│   ├── button.tsx       # Custom button components
│   ├── card.tsx         # Card layout components
│   └── dialog.tsx       # Modal dialog components
├── WalletStatus.tsx      # Wallet connection status
├── PayoutSystem.tsx      # Enhanced payout management
└── VMFDebugTool.tsx     # Development debugging tools
```

#### 3. **Hook Architecture**
```
hooks/
├── useWallet.ts          # Wallet connection management
├── useVMFBalance.ts      # VMF token balance tracking
├── use-mobile.ts         # Mobile device detection
└── use-toast.ts          # Notification system
```

#### 4. **Library Architecture**
```
lib/
├── wallet-config.ts      # Multi-wallet configuration
├── vmf-contract.ts       # VMF token integration
├── jackpot-data.ts       # On-chain jackpot calculations
├── payout-system.ts      # Payout logic and management
├── monitoring.ts         # Analytics and error tracking
└── utils.ts             # Utility functions
```

### Smart Contract Architecture

#### 1. **Contract Structure**
```solidity
contract PizzaParty is ReentrancyGuard, Ownable, Pausable {
    // Core dependencies
    IERC20 public immutable vmfToken;
    
    // Game state management
    Counters.Counter private _gameId;
    uint256 public currentDailyJackpot;
    uint256 public currentWeeklyJackpot;
    
    // Data structures
    struct Player { ... }
    struct Referral { ... }
    struct Game { ... }
    
    // Mappings for efficient data access
    mapping(address => Player) public players;
    mapping(address => Referral) public referrals;
    mapping(string => address) public referralCodes;
    mapping(uint256 => Game) public games;
    mapping(address => bool) public blacklistedAddresses;
}
```

#### 2. **Security Architecture**
- **ReentrancyGuard**: Prevents reentrancy attacks on all state-changing functions
- **Ownable**: Restricts admin functions to contract owner
- **Pausable**: Emergency pause functionality for crisis management
- **Input Validation**: Comprehensive validation for all user inputs
- **Access Control**: Role-based access for different user types

#### 3. **Event Architecture**
```solidity
// Game events
event PlayerEntered(address indexed player, uint256 gameId, uint256 entryFee);
event DailyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount);
event WeeklyWinnersSelected(uint256 gameId, address[] winners, uint256 jackpotAmount);

// Reward events
event ToppingsAwarded(address indexed player, uint256 amount, string reason);
event ReferralCreated(address indexed referrer, string referralCode);
event ReferralUsed(address indexed referrer, address indexed newPlayer, uint256 reward);

// Admin events
event PlayerBlacklisted(address indexed player, bool blacklisted);
event EmergencyPause(bool paused);
event JackpotUpdated(uint256 dailyJackpot, uint256 weeklyJackpot);
```

## 🔄 Data Flow Architecture

### 1. **User Interaction Flow**
```
User Action → Frontend Validation → Wallet Integration → 
Smart Contract Call → Event Emission → UI Update → 
Analytics Tracking → Error Handling
```

### 2. **Game Entry Flow**
```
1. User clicks "Enter Game"
2. Frontend validates wallet connection and VMF balance
3. User approves transaction in wallet
4. Smart contract validates inputs and processes entry
5. Contract emits PlayerEntered event
6. Frontend updates UI based on transaction result
7. Analytics system tracks the interaction
```

### 3. **Referral System Flow**
```
1. User creates referral code
2. Contract generates unique code and stores mapping
3. New user enters with referral code
4. Contract validates referral and processes rewards
5. Both users receive topping rewards
6. Events are emitted for tracking
```

## 🛡️ Security Architecture

### 1. **Multi-Layer Security**
```
┌─────────────────────────────────────────┐
│           Frontend Security             │
├─────────────────────────────────────────┤
│ • Input sanitization                   │
│ • Client-side validation               │
│ • XSS protection                       │
│ • CSRF protection                      │
└─────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────┐
│         Network Security                │
├─────────────────────────────────────────┤
│ • HTTPS enforcement                    │
│ • Secure WebSocket connections         │
│ • Rate limiting                        │
│ • DDoS protection                      │
└─────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────┐
│        Smart Contract Security          │
├─────────────────────────────────────────┤
│ • ReentrancyGuard protection           │
│ • Access control (Ownable)             │
│ • Emergency controls (Pausable)        │
│ • Input validation                     │
│ • Blacklist system                     │
└─────────────────────────────────────────┘
```

### 2. **Wallet Security**
- **Multi-wallet support**: MetaMask, Coinbase Wallet, Trust Wallet, Rainbow, Phantom, Farcaster
- **Network validation**: Ensures users are on Base network
- **Transaction signing**: Secure approval process
- **Error handling**: Graceful failure management

## 📱 Multi-Platform Architecture

### 1. **Responsive Design**
```
Desktop (1200px+)    Tablet (768px-1199px)    Mobile (<768px)
┌─────────────────┐  ┌─────────────────┐      ┌─────────────────┐
│   Full Layout   │  │  Adaptive Layout│      │  Mobile-First   │
│   Sidebar Nav   │  │  Collapsed Nav  │      │  Bottom Nav     │
│   Hover Effects │  │  Touch Optimized│      │  Touch Optimized│
└─────────────────┘  └─────────────────┘      └─────────────────┘
```

### 2. **Platform Detection**
```typescript
const platformConfig = {
  desktop: {
    features: ['full_navigation', 'hover_effects', 'keyboard_shortcuts'],
    walletSupport: ['metamask', 'coinbase', 'rainbow'],
    layout: 'sidebar'
  },
  mobile: {
    features: ['touch_optimized', 'deep_linking', 'mobile_wallets'],
    walletSupport: ['coinbase', 'trust', 'phantom'],
    layout: 'bottom_nav'
  },
  farcaster: {
    features: ['social_integration', 'frame_support'],
    walletSupport: ['farcaster'],
    layout: 'embedded'
  }
};
```

## 🔧 Development Architecture

### 1. **Testing Strategy**
```
test/
├── unit/                 # Unit tests for individual functions
│   ├── contract/        # Smart contract unit tests
│   ├── hooks/           # React hook tests
│   └── utils/           # Utility function tests
├── integration/          # Integration tests
│   ├── wallet/          # Wallet integration tests
│   ├── game/            # Game flow tests
│   └── admin/           # Admin function tests
├── security/            # Security-focused tests
│   ├── reentrancy/      # Reentrancy attack tests
│   ├── access/          # Access control tests
│   └── validation/      # Input validation tests
└── e2e/                 # End-to-end tests
    ├── game-flow/       # Complete game flow tests
    └── wallet-flow/     # Wallet connection flow tests
```

### 2. **Deployment Architecture**
```
Deployment Pipeline:
1. Local Development → 2. Testnet Testing → 3. Security Audit → 
4. Mainnet Deployment → 5. Monitoring Setup → 6. Community Launch
```

### 3. **Monitoring Architecture**
```
Monitoring Stack:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Frontend      │  │   Smart         │  │   Analytics     │
│   Monitoring    │  │   Contract      │  │   Dashboard     │
│   (Sentry)      │  │   Events        │  │   (Custom)      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
                    ┌─────────────────┐
                    │   Alert System  │
                    │   (Discord)     │
                    └─────────────────┘
```

## 🚀 Performance Architecture

### 1. **Frontend Optimization**
- **Code splitting**: Dynamic imports for route-based splitting
- **Image optimization**: Next.js Image component with WebP support
- **Caching**: Browser caching and CDN optimization
- **Bundle optimization**: Tree shaking and dead code elimination

### 2. **Smart Contract Optimization**
- **Gas efficiency**: Optimized function calls and storage patterns
- **Batch operations**: Grouped transactions for cost reduction
- **Event optimization**: Efficient event emission for off-chain tracking
- **Storage optimization**: Packed structs and efficient data types

### 3. **Network Optimization**
- **RPC optimization**: Multiple RPC endpoints for redundancy
- **Transaction batching**: Grouped operations for efficiency
- **Caching layer**: Redis for frequently accessed data
- **CDN integration**: Global content delivery

## 🔄 State Management Architecture

### 1. **Frontend State**
```typescript
// Global state management
const AppState = {
  wallet: {
    connection: WalletConnection | null,
    isConnecting: boolean,
    error: string | null
  },
  game: {
    currentGame: GameState,
    playerStats: PlayerStats,
    jackpotInfo: JackpotInfo
  },
  admin: {
    isAdmin: boolean,
    securityStatus: SecurityStatus,
    contractStats: ContractStats
  }
};
```

### 2. **Smart Contract State**
```solidity
// Immutable state
IERC20 public immutable vmfToken;

// Mutable state with access control
uint256 public currentDailyJackpot;
uint256 public currentWeeklyJackpot;
mapping(address => Player) public players;
mapping(address => Referral) public referrals;
```

## 📊 Analytics Architecture

### 1. **Event Tracking**
```typescript
// Comprehensive event tracking
const events = {
  user_actions: ['wallet_connect', 'game_entry', 'referral_create'],
  game_events: ['daily_winner', 'weekly_winner', 'jackpot_update'],
  security_events: ['admin_action', 'blacklist_update', 'emergency_pause'],
  error_events: ['transaction_failed', 'validation_error', 'network_error']
};
```

### 2. **Metrics Collection**
- **User engagement**: Daily active users, session duration
- **Game metrics**: Entry counts, jackpot sizes, winner distribution
- **Security metrics**: Admin actions, blacklist updates, emergency events
- **Performance metrics**: Gas usage, transaction success rates

## 🔧 Configuration Architecture

### 1. **Environment Configuration**
```typescript
const config = {
  development: {
    network: 'baseSepolia',
    rpcUrl: 'https://sepolia.base.org',
    contractAddress: '0x...',
    analytics: false
  },
  production: {
    network: 'base',
    rpcUrl: 'https://mainnet.base.org',
    contractAddress: '0x...',
    analytics: true
  }
};
```

### 2. **Feature Flags**
```typescript
const features = {
  referral_system: true,
  admin_panel: process.env.NODE_ENV === 'development',
  analytics: process.env.NODE_ENV === 'production',
  mobile_optimization: true,
  social_integration: true
};
```

## 🎯 Scalability Architecture

### 1. **Horizontal Scaling**
- **CDN distribution**: Global content delivery
- **Database sharding**: Partitioned data storage
- **Load balancing**: Multiple server instances
- **Caching layers**: Redis and browser caching

### 2. **Vertical Scaling**
- **Smart contract optimization**: Gas-efficient operations
- **Frontend optimization**: Bundle size reduction
- **Database optimization**: Indexed queries and efficient schemas
- **Network optimization**: Optimized RPC calls

This architecture provides a solid foundation for a production-ready decentralized gaming platform with enterprise-grade security, comprehensive monitoring, and scalable design patterns. 