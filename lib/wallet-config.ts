// Wallet connection utilities and configurations
export interface WalletInfo {
  name: string
  icon: string
  color: string
  id: string
  mobile?: boolean
  deepLink?: string
  downloadUrl?: string
  universalLink?: string
  iconImage?: string // Add support for image icons
}

export const WALLETS: WalletInfo[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    color: "bg-orange-500 hover:bg-orange-600",
    mobile: true,
    deepLink: "metamask://",
    universalLink: "https://metamask.app.link/",
    downloadUrl: "https://metamask.io/download/",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🪙", // Fallback emoji if image fails to load
    iconImage: "/images/Coinbase-icon.png?v=2",
    color: "bg-blue-500 hover:bg-blue-600",
    mobile: true,
    deepLink: "coinbasewallet://",
    universalLink: "https://wallet.coinbase.com/",
    downloadUrl: "https://wallet.coinbase.com/",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "🛡️",
    color: "bg-blue-600 hover:bg-blue-700",
    mobile: true,
    deepLink: "trust://",
    universalLink: "https://link.trustwallet.com/",
    downloadUrl: "https://trustwallet.com/",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    icon: "🌈",
    color: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
    mobile: true,
    deepLink: "rainbow://",
    universalLink: "https://rnbwapp.com/",
    downloadUrl: "https://rainbow.me/",
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: "👻",
    color: "bg-purple-500 hover:bg-purple-600",
    mobile: true,
    deepLink: "phantom://",
    universalLink: "https://phantom.app/ul/",
    downloadUrl: "https://phantom.app/",
  },
]

// Base network configuration
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
    "https://base.gateway.tenderly.co",
  ],
  blockExplorerUrls: ["https://basescan.org"],
}

// Base Sepolia testnet configuration
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
    "https://base-sepolia.gateway.tenderly.co",
  ],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
}

// Mobile detection
export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// iOS detection
export const isIOS = (): boolean => {
  if (typeof window === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// Android detection
export const isAndroid = (): boolean => {
  if (typeof window === "undefined") return false
  return /Android/.test(navigator.userAgent)
}

// Farcaster detection
export const isFarcaster = (): boolean => {
  if (typeof window === "undefined") return false
  return (
    window.location.hostname.includes("farcaster") ||
    window.navigator.userAgent.includes("Farcaster") ||
    window.parent !== window
  ) // Running in iframe (common for Farcaster frames)
}

// Check if we're in a mobile wallet browser
export const isInWalletBrowser = (): string | null => {
  if (typeof window === "undefined") return null

  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes("metamask")) return "metamask"
  if (userAgent.includes("coinbasewallet") || userAgent.includes("coinbase")) return "coinbase"
  if (userAgent.includes("trust")) return "trust"
  if (userAgent.includes("rainbow")) return "rainbow"
  if (userAgent.includes("phantom")) return "phantom"

  return null
}

// Wallet connection interface
export interface WalletConnection {
  address: string
  chainId: number
  walletName: string
  balance?: string
}

// Format wallet address for display
export const formatAddress = (address: string): string => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Get current page URL for deep linking
export const getCurrentPageUrl = (): string => {
  if (typeof window === "undefined") return ""
  return window.location.href
}

// Mobile wallet connection with direct wallet detection (no WalletConnect modal)
export const connectMobileWallet = async (walletId: string): Promise<any> => {
  const wallet = WALLETS.find((w) => w.id === walletId)
  if (!wallet) throw new Error("Wallet not found")

  console.log(`🚀 Attempting mobile connection to ${walletId}`)

  // Check if we're already in the wallet's browser
  const inWalletBrowser = isInWalletBrowser()
  if (inWalletBrowser === walletId) {
    console.log(`✅ Already in ${walletId} browser, using direct connection`)
    return requestWalletConnection(walletId)
  }

  // For mobile, use direct wallet detection and connection
  if (isMobile()) {
    // Strategy 1: Check if the specific wallet is available and connect directly
    if (walletId === "metamask") {
      return await connectMetaMaskMobile()
    } else if (walletId === "coinbase") {
      return await connectCoinbaseMobile()
    } else if (walletId === "rainbow") {
      return await connectRainbowMobile()
    } else if (walletId === "trust") {
      return await connectTrustMobile()
    }

    // Strategy 2: Try generic Web3 provider if available
    if (window.ethereum) {
      return await connectGenericWeb3Mobile()
    }

    // Strategy 3: Show wallet-specific instructions
    return await showWalletInstructions(walletId)
  }

  // Fallback to desktop connection
  return requestWalletConnection(walletId)
}

// MetaMask mobile connection
const connectMetaMaskMobile = async (): Promise<any> => {
  console.log("📱 Connecting to MetaMask mobile...")
  
  // Check if MetaMask is available
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      
      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })
        
        console.log(`✅ MetaMask mobile connection successful: ${accounts[0]}`)
        return {
          accounts,
          chainId,
          provider: window.ethereum,
          walletName: "MetaMask"
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("MetaMask connection rejected. Please approve in your wallet.")
      }
      throw new Error(`MetaMask connection failed: ${error.message}`)
    }
  }
  
  // MetaMask not available, show instructions
  throw new Error("MetaMask not detected. Please install MetaMask or open in MetaMask browser.")
}

// Coinbase Wallet mobile connection
const connectCoinbaseMobile = async (): Promise<any> => {
  console.log("📱 Connecting to Coinbase Wallet mobile...")
  
  // Check if Coinbase Wallet is available
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      
      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })
        
        console.log(`✅ Coinbase Wallet mobile connection successful: ${accounts[0]}`)
        return {
          accounts,
          chainId,
          provider: window.ethereum,
          walletName: "Coinbase Wallet"
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("Coinbase Wallet connection rejected. Please approve in your wallet.")
      }
      throw new Error(`Coinbase Wallet connection failed: ${error.message}`)
    }
  }
  
  // Coinbase Wallet not available, show instructions
  throw new Error("Coinbase Wallet not detected. Please install Coinbase Wallet or open in Coinbase browser.")
}

// Rainbow Wallet mobile connection
const connectRainbowMobile = async (): Promise<any> => {
  console.log("📱 Connecting to Rainbow Wallet mobile...")
  
  // Check if Rainbow Wallet is available
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isRainbow) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      
      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })
        
        console.log(`✅ Rainbow Wallet mobile connection successful: ${accounts[0]}`)
        return {
          accounts,
          chainId,
          provider: window.ethereum,
          walletName: "Rainbow Wallet"
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("Rainbow Wallet connection rejected. Please approve in your wallet.")
      }
      throw new Error(`Rainbow Wallet connection failed: ${error.message}`)
    }
  }
  
  // Rainbow Wallet not available, show instructions
  throw new Error("Rainbow Wallet not detected. Please install Rainbow Wallet or open in Rainbow browser.")
}

// Trust Wallet mobile connection
const connectTrustMobile = async (): Promise<any> => {
  console.log("📱 Connecting to Trust Wallet mobile...")
  
  // Check if Trust Wallet is available
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      
      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })
        
        console.log(`✅ Trust Wallet mobile connection successful: ${accounts[0]}`)
        return {
          accounts,
          chainId,
          provider: window.ethereum,
          walletName: "Trust Wallet"
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("Trust Wallet connection rejected. Please approve in your wallet.")
      }
      throw new Error(`Trust Wallet connection failed: ${error.message}`)
    }
  }
  
  // Trust Wallet not available, show instructions
  throw new Error("Trust Wallet not detected. Please install Trust Wallet or open in Trust browser.")
}

// Generic Web3 provider connection
const connectGenericWeb3Mobile = async (): Promise<any> => {
  console.log("📱 Connecting to generic Web3 provider...")
  
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    
    if (accounts && accounts.length > 0) {
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })
      
      console.log(`✅ Generic Web3 mobile connection successful: ${accounts[0]}`)
      return {
        accounts,
        chainId,
        provider: window.ethereum,
        walletName: "Web3 Wallet"
      }
    }
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("Wallet connection rejected. Please approve in your wallet.")
    }
    throw new Error(`Wallet connection failed: ${error.message}`)
  }
  
  throw new Error("No Web3 provider detected.")
}

// Show wallet-specific instructions
const showWalletInstructions = async (walletId: string): Promise<any> => {
  const wallet = WALLETS.find((w) => w.id === walletId)
  if (!wallet) throw new Error("Wallet not found")
  
  console.log(`📱 Showing instructions for ${walletId}`)
  
  // Create a simple instruction modal
  const instructions = {
    metamask: "Please install MetaMask or open this site in MetaMask browser",
    coinbase: "Please install Coinbase Wallet or open this site in Coinbase browser",
    rainbow: "Please install Rainbow Wallet or open this site in Rainbow browser",
    trust: "Please install Trust Wallet or open this site in Trust browser"
  }
  
  throw new Error(instructions[walletId as keyof typeof instructions] || "Please install a compatible wallet.")
}

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

  // Desktop logic (existing)
  const allProviders = getAllProviders()

  switch (walletId) {
    case "metamask":
      return (
        allProviders.find((provider) => provider.isMetaMask && !provider.isCoinbaseWallet && !provider.isCoinbase) ||
        window.ethereum
      )
    case "coinbase":
      return allProviders.find((provider) => provider.isCoinbaseWallet || provider.isCoinbase) || window.ethereum
    case "rainbow":
      return allProviders.find((provider) => provider.isRainbow) || window.ethereum
    default:
      return window.ethereum
  }
}

// Get all available providers
export const getAllProviders = (): any[] => {
  if (typeof window === "undefined") return []

  const providers: any[] = []

  // Check if there are multiple providers
  if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
    providers.push(...window.ethereum.providers)
  } else if (window.ethereum) {
    providers.push(window.ethereum)
  }

  return providers
}

// Enhanced wallet connection request with better mobile support
export const requestWalletConnection = async (walletId: string): Promise<any> => {
  console.log(`🚀 Requesting connection from ${walletId}`)

  // For mobile, use simplified connection logic
  if (isMobile()) {
    if (!window.ethereum) {
      // Provide specific instructions for mobile users
      const wallet = WALLETS.find((w) => w.id === walletId)
      const walletName = wallet?.name || "wallet"

      throw new Error(`No Web3 wallet detected. Please:

1. Open your ${walletName} app
2. Go to the browser/dApp section  
3. Visit this page from within the app
4. Try connecting again

Make sure you have ${walletName} installed from your app store.`)
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from wallet")
      }

      // Get chain ID
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })

      console.log(`✅ Mobile connection successful: ${accounts[0]} on chain ${chainId}`)

      return {
        accounts,
        chainId,
        provider: window.ethereum,
      }
    } catch (error: any) {
      console.error(`❌ Mobile connection failed:`, error)

      // Provide more helpful error messages for mobile
      if (error.code === 4001) {
        throw new Error("Connection rejected. Please approve the connection in your wallet app.")
      } else if (error.code === -32002) {
        throw new Error("Connection request pending. Please check your wallet app and approve the connection.")
      } else {
        const wallet = WALLETS.find((w) => w.id === walletId)
        const walletName = wallet?.name || "wallet"

        throw new Error(`Connection failed. Please make sure you're browsing from within your ${walletName} app.`)
      }
    }
  }

  // Desktop logic - connect to specific wallet
  const provider = getWalletProvider(walletId)

  if (!provider) {
    throw new Error(`${getWalletDisplayName(walletId)} wallet not found. Please install the ${getWalletDisplayName(walletId)} extension or app.`)
  }

  try {
    // Request account access from the specific wallet
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    })

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned from wallet")
    }

    // Ensure we're on Base network for desktop
    await ensureBaseNetwork(provider)

    const chainId = await provider.request({
      method: "eth_chainId",
    })

    console.log(`✅ Desktop connection to ${walletId} successful: ${accounts[0]} on chain ${chainId}`)

    return {
      accounts,
      chainId,
      provider,
    }
  } catch (error: any) {
    console.error(`❌ ${walletId} connection failed:`, error)
    
    // Provide specific error messages for different wallet types
    const wallet = WALLETS.find((w) => w.id === walletId)
    const walletName = wallet?.name || walletId
    
    if (error.code === 4001) {
      throw new Error(`Connection to ${walletName} was rejected. Please try again and approve the connection.`)
    } else if (error.code === -32002) {
      throw new Error(`Connection request to ${walletName} is pending. Please check your wallet and approve the connection.`)
    } else if (error.code === 4902) {
      throw new Error(`Base network not found in ${walletName}. Please add Base network to your wallet.`)
    } else {
      throw new Error(`Failed to connect to ${walletName}: ${error.message || "Unknown error"}`)
    }
  }
}

// Open wallet installation page
export const openWalletInstallPage = (walletId: string): void => {
  const wallet = WALLETS.find((w) => w.id === walletId)
  if (!wallet?.downloadUrl) return

  if (isMobile()) {
    // On mobile, try to open app store
    if (isIOS()) {
      // Try App Store first, fallback to direct link
      const appStoreUrl = `https://apps.apple.com/search?term=${encodeURIComponent(wallet.name)}`
      window.open(appStoreUrl, "_blank")
    } else if (isAndroid()) {
      // Try Play Store first, fallback to direct link
      const playStoreUrl = `https://play.google.com/store/search?q=${encodeURIComponent(wallet.name)}&c=apps`
      window.open(playStoreUrl, "_blank")
    } else {
      window.open(wallet.downloadUrl, "_blank")
    }
  } else {
    window.open(wallet.downloadUrl, "_blank")
  }
}

// Check if wallet is installed (enhanced for mobile)
export const isWalletInstalled = (walletId: string): boolean => {
  // On mobile, we can't reliably detect if apps are installed
  // Always return true to allow connection attempts
  if (isMobile()) {
    return true
  }

  // Desktop detection (unchanged)
  const provider = getWalletProvider(walletId)
  return !!provider
}

// Get wallet display name
export const getWalletDisplayName = (walletId: string): string => {
  const wallet = WALLETS.find((w) => w.id === walletId)
  return wallet?.name || walletId
}

// Mobile-specific utilities
export const handleMobileViewport = (): void => {
  if (typeof window === "undefined") return

  // Prevent zoom on input focus (iOS Safari)
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
  }

  // Handle iOS Safari bottom bar
  if (isIOS()) {
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    setVH()
    window.addEventListener("resize", setVH)
    window.addEventListener("orientationchange", setVH)
  }
}

// Initialize mobile optimizations
export const initMobileOptimizations = (): void => {
  if (typeof window === "undefined") return

  handleMobileViewport()

  // Disable pull-to-refresh on mobile
  document.body.style.overscrollBehavior = "none"

  // Prevent horizontal scroll
  document.body.style.overflowX = "hidden"

  // Add mobile-specific classes
  if (isMobile()) {
    document.body.classList.add("mobile")
  }
  if (isIOS()) {
    document.body.classList.add("ios")
  }
  if (isAndroid()) {
    document.body.classList.add("android")
  }
  if (isFarcaster()) {
    document.body.classList.add("farcaster")
  }
}

// Ensure Base network is added/switched (enhanced for mobile)
export const ensureBaseNetwork = async (provider?: any): Promise<void> => {
  const targetProvider = provider || window.ethereum
  if (typeof window === "undefined" || !targetProvider) return

  try {
    // Try to switch to Base network
    await targetProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${BASE_NETWORK.chainId.toString(16)}` }],
    })
    console.log("✅ Switched to Base network")
  } catch (switchError: any) {
    console.log("⚠️ Switch failed, trying to add Base network...")

    // If Base network is not added, add it
    if (switchError.code === 4902) {
      try {
        await targetProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${BASE_NETWORK.chainId.toString(16)}`,
              chainName: BASE_NETWORK.chainName,
              nativeCurrency: BASE_NETWORK.nativeCurrency,
              rpcUrls: BASE_NETWORK.rpcUrls,
              blockExplorerUrls: BASE_NETWORK.blockExplorerUrls,
            },
          ],
        })
        console.log("✅ Added Base network")
      } catch (addError) {
        console.error("❌ Failed to add Base network:", addError)
        throw new Error("Please add Base network to your wallet manually")
      }
    } else {
      console.error("❌ Failed to switch to Base network:", switchError)
      // Don't throw error for mobile wallets, they might handle network switching differently
      if (!isMobile()) {
        throw new Error("Please switch to Base network in your wallet")
      }
    }
  }
}

// Ensure Base Sepolia testnet is added/switched (for beta testing)
export const ensureBaseSepoliaNetwork = async (provider?: any): Promise<void> => {
  const targetProvider = provider || window.ethereum
  if (typeof window === "undefined" || !targetProvider) return

  try {
    // Try to switch to Base Sepolia network
    await targetProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${BASE_SEPOLIA_NETWORK.chainId.toString(16)}` }],
    })
    console.log("✅ Switched to Base Sepolia testnet")
  } catch (switchError: any) {
    console.log("⚠️ Switch failed, trying to add Base Sepolia network...")

    // If Base Sepolia network is not added, add it
    if (switchError.code === 4902) {
      try {
        await targetProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${BASE_SEPOLIA_NETWORK.chainId.toString(16)}`,
              chainName: BASE_SEPOLIA_NETWORK.chainName,
              nativeCurrency: BASE_SEPOLIA_NETWORK.nativeCurrency,
              rpcUrls: BASE_SEPOLIA_NETWORK.rpcUrls,
              blockExplorerUrls: BASE_SEPOLIA_NETWORK.blockExplorerUrls,
            },
          ],
        })
        console.log("✅ Added Base Sepolia testnet")
      } catch (addError) {
        console.error("❌ Failed to add Base Sepolia network:", addError)
        throw new Error("Please add Base Sepolia testnet to your wallet manually")
      }
    } else {
      console.error("❌ Failed to switch to Base Sepolia network:", switchError)
      // Don't throw error for mobile wallets, they might handle network switching differently
      if (!isMobile()) {
        throw new Error("Please switch to Base Sepolia testnet in your wallet")
      }
    }
  }
}

// Helper function to generate a symmetric key for WalletConnect
function generateSymKey(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
