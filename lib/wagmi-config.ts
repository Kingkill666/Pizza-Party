import { createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { InjectedConnector } from 'wagmi/connectors/injected'

// Base Sepolia testnet configuration
export const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'Base Sepolia', url: 'https://sepolia.basescan.org' },
    default: { name: 'Base Sepolia', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
} as const

// Base mainnet configuration
export const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://mainnet.base.org'] },
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'Base', url: 'https://basescan.org' },
    default: { name: 'Base', url: 'https://basescan.org' },
  },
} as const

// Configure chains & providers
export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [baseSepolia, base], // Use Base Sepolia for beta testing
  [
    publicProvider(),
  ],
)

// WalletConnect v2 configuration
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id'

// Create wagmi config
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ 
      chains,
      options: {
        shimDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Pizza Party',
        appLogoUrl: 'https://your-domain.com/logo.png',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId,
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'dark',
          themeVariables: {
            '--w3m-z-index': '9999',
          },
        },
        metadata: {
          name: 'Pizza Party',
          description: 'Decentralized gaming platform on Base',
          url: 'https://your-domain.com',
          icons: ['https://your-domain.com/icon.png'],
        },
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
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
  
  refresh: async (address: string) => {
    // Implement token refresh logic here
    // This would typically call your backend to get a new token
    console.log('Refreshing token for address:', address)
    return null
  },
} 