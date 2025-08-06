# 🍕 Pizza Party - Farcaster Mini App Integration

## Overview

Pizza Party is now available as both a **web app** AND a **Farcaster Mini App**! Users can play the game directly within Farcaster clients while maintaining full functionality.

## 🎯 Dual Deployment Strategy

### Web App (Primary)
- **URL**: `https://pizzaparty.app`
- **Full functionality** with complete UI/UX
- **All features** available (referrals, social sharing, etc.)
- **Responsive design** for mobile/desktop

### Farcaster Mini App
- **Frame URL**: `https://pizzaparty.app/frame`
- **Frame API**: `https://pizzaparty.app/api/frame`
- **Limited but functional** experience within Farcaster
- **Social discovery** in Farcaster feeds

## 🛠 Technical Implementation

### Frame Metadata
```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://pizzaparty.app/images/pizza-transparent.png" />
<meta property="fc:frame:button:1" content="Play Daily Game" />
<meta property="fc:frame:button:2" content="View Jackpot" />
<meta property="fc:frame:button:3" content="Connect Wallet" />
<meta property="fc:frame:button:4" content="Share Pizza Party" />
<meta property="fc:frame:post_url" content="https://pizzaparty.app/api/frame" />
```

### API Endpoints
- `/api/frame` - Main frame handler
- `/api/frame/game` - Game interactions
- `/api/frame/jackpot` - Jackpot display
- `/api/frame/wallet` - Wallet connections
- `/api/frame/share` - Social sharing

### SDK Integration
```typescript
import { farcasterApp } from '@/lib/farcaster-miniapp'
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth'

// Initialize SDK
await farcasterApp.initialize()

// Get auth token
const { token } = await farcasterApp.getAuthToken()

// Make authenticated requests
const response = await farcasterApp.makeAuthenticatedRequest('/api/game')
```

## 🎮 User Experience

### Web App Users
1. Visit `pizzaparty.app`
2. Full gaming experience
3. All features available
4. Complete UI/UX

### Farcaster Users
1. See Pizza Party in feed
2. Click to open mini app
3. Play directly in Farcaster
4. Limited but functional experience

## 🔧 Development

### Prerequisites
- Node.js 22.11.0 or higher
- Farcaster Developer Mode enabled
- `@farcaster/miniapp-sdk` installed

### Setup
```bash
# Install dependencies
npm install @farcaster/miniapp-sdk

# Run development server
npm run dev

# Build for production
npm run build
```

### Testing Farcaster Integration
1. Enable Developer Mode in Farcaster
2. Visit `https://farcaster.xyz/~/settings/developer-tools`
3. Toggle "Developer Mode" on
4. Test frame interactions

## 📱 Frame Interactions

### Main Frame
- **Button 1**: Play Daily Game
- **Button 2**: View Jackpot  
- **Button 3**: Connect Wallet
- **Button 4**: Share Pizza Party

### Game Frame
- **Button 1**: Enter Game (1 VMF)
- **Button 2**: View Jackpot
- **Button 3**: Back to Home

### Jackpot Frame
- **Button 1**: Play Daily Game
- **Button 2**: Claim Toppings
- **Button 3**: Back to Home

## 🔐 Authentication

### Quick Auth Integration
```typescript
// Get session token
const { token } = await sdk.quickAuth.getToken()

// Make authenticated request
const response = await sdk.quickAuth.fetch('/api/game')
```

### User Management
- Automatic FID detection
- Session token management
- Authenticated API calls

## 🚀 Deployment

### Web App
- Deploy to Vercel/Netlify
- Custom domain: `pizzaparty.app`
- Full functionality

### Farcaster Frame
- Same deployment
- Frame metadata in HTML
- API endpoints for interactions

## 📊 Analytics

### Frame Analytics
- Frame interactions tracked
- User engagement metrics
- Conversion tracking

### Cross-Platform Data
- Shared user data
- Unified analytics
- Performance monitoring

## 🔗 Links

- **Web App**: https://pizzaparty.app
- **Frame URL**: https://pizzaparty.app/frame
- **API Base**: https://pizzaparty.app/api/frame
- **Manifest**: https://pizzaparty.app/farcaster-manifest.json

## 🎯 Benefits

### Web App Advantages
- ✅ Full UI/UX experience
- ✅ All features available
- ✅ Better performance
- ✅ SEO friendly

### Farcaster Frame Advantages
- ✅ Social discovery
- ✅ Viral potential
- ✅ Built-in audience
- ✅ Quick access

## 📝 Notes

- **UI remains unchanged** - Same components used
- **Shared codebase** - Single source of truth
- **Cross-platform** - Works everywhere
- **Future-proof** - Easy to extend

---

**DO NOT CHANGE ANY OF THE UI!!!** ✅

The Farcaster Mini App integration provides additional reach while maintaining the exact same user interface and experience. 