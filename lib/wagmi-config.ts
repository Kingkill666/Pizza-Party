import { getDefaultConfig } from 'wagmi'
import { baseSepolia, base } from 'wagmi/chains'
import { 
  metaMaskWallet, 
  coinbaseWallet, 
  rainbowWallet, 
  trustWallet, 
  phantomWallet,
  walletConnect
} from '@rainbow-me/rainbowkit/wallets'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'

// WalletConnect v2 configuration with proper project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9'

// Create connectors with mobile-optimized wallet support
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ 
        chains: [baseSepolia, base],
        projectId,
        shimDisconnect: true,
      }),
      coinbaseWallet({ 
        appName: 'Pizza Party',
        chains: [baseSepolia, base],
        projectId,
      }),
      rainbowWallet({ 
        chains: [baseSepolia, base],
        projectId,
      }),
      trustWallet({ 
        chains: [baseSepolia, base],
        projectId,
      }),
      phantomWallet({ 
        chains: [baseSepolia, base],
        projectId,
      }),
      walletConnect({ 
        chains: [baseSepolia, base],
        projectId,
      }),
    ],
  },
], {
  appName: 'Pizza Party',
  projectId,
})

// Create wagmi config with RainbowKit connectors
export const config = getDefaultConfig({
  chains: [baseSepolia, base],
  connectors,
  ssr: true,
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [base.id]: http('https://mainnet.base.org'),
  },
})

// Session management utilities
export const sessionStorage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(`wagmi.${key}`)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`wagmi.${key}`, JSON.stringify(value))
    } catch {
      // Handle storage errors
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(`wagmi.${key}`)
    } catch {
      // Handle storage errors
    }
  },
}

// Persistent connection management
export const persistentConnection = {
  save: (connection: any) => {
    sessionStorage.set('connection', {
      ...connection,
      timestamp: Date.now(),
    })
  },
  load: () => {
    const saved = sessionStorage.get('connection')
    if (!saved) return null
    
    // Check if connection is still valid (24 hours)
    const isValid = Date.now() - saved.timestamp < 24 * 60 * 60 * 1000
    if (!isValid) {
      sessionStorage.remove('connection')
      return null
    }
    
    return saved
  },
  clear: () => {
    sessionStorage.remove('connection')
  },
}

// Mobile detection utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const isInWalletBrowser = () => {
  if (typeof window === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('metamask') || 
         userAgent.includes('coinbasewallet') || 
         userAgent.includes('trust') ||
         userAgent.includes('rainbow') ||
         userAgent.includes('phantom')
}

// Network switching utilities
export const switchToBaseSepolia = async (connector: any) => {
  try {
    await connector.switchChain?.(baseSepolia)
    return true
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added, add it
      try {
        await connector.addChain?.(baseSepolia)
        return true
      } catch (addError) {
        console.error('Failed to add Base Sepolia network:', addError)
        return false
      }
    }
    console.error('Failed to switch to Base Sepolia:', error)
    return false
  }
}

// Enhanced error handling
export const handleConnectionError = (error: any) => {
  console.error('Connection error:', error)
  
  if (error.code === 4001) {
    return 'Connection rejected by user'
  }
  
  if (error.code === -32002) {
    return 'Connection request already pending'
  }
  
  if (error.code === 4902) {
    return 'Please add Base Sepolia network to your wallet'
  }
  
  if (error.message?.includes('User rejected')) {
    return 'Connection was rejected'
  }
  
  if (error.message?.includes('No provider')) {
    return 'No wallet provider found'
  }
  
  return error.message || 'Connection failed'
}

// Refresh token management
export const refreshTokenManager = {
  tokens: new Map<string, { token: string; expires: number }>(),
  
  set: (address: string, token: string, expiresIn: number = 3600) => {
    const expires = Date.now() + expiresIn * 1000
    refreshTokenManager.tokens.set(address, { token, expires })
  },
  
  get: (address: string) => {
    const tokenData = refreshTokenManager.tokens.get(address)
    if (!tokenData) return null
    
    if (Date.now() > tokenData.expires) {
      refreshTokenManager.tokens.delete(address)
      return null
    }
    
    return tokenData.token
  },
  
  clear: (address?: string) => {
    if (address) {
      refreshTokenManager.tokens.delete(address)
    } else {
      refreshTokenManager.tokens.clear()
    }
  },
  
  refresh: async (address: string | undefined) => {
    // Implement token refresh logic here
    // This would typically call your backend to get a new token
    if (!address) return null
    console.log('Refreshing token for address:', address)
    return null
  },
} 