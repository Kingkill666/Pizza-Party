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

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    color: "bg-orange-500 hover:bg-orange-600",
    mobile: true,
    deepLink: "metamask://dapp/",
    universalLink: "https://metamask.app.link/dapp/",
    downloadUrl: "https://metamask.io/download/",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    color: "bg-blue-600 hover:bg-blue-700",
    mobile: true,
    deepLink: "cbwallet://dapp/",
    universalLink: "https://go.cb-w.com/dapp?cb_url=",
    downloadUrl: "https://wallet.coinbase.com/",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "🛡️",
    color: "bg-blue-400 hover:bg-blue-500",
    mobile: true,
    deepLink: "trust://",
    universalLink: "https://link.trustwallet.com/open_url?coin_id=60&url=",
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
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    color: "bg-blue-500 hover:bg-blue-600",
    mobile: true,
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
  {
    id: "farcaster",
    name: "Farcaster",
    icon: "", // Will use iconImage instead
    iconImage: "/images/farcaster-icon.png",
    color: "bg-purple-600 hover:bg-purple-700",
    mobile: true,
    deepLink: "farcaster://",
    downloadUrl: "https://www.farcaster.xyz/",
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
  if (userAgent.includes("farcaster")) return "farcaster"

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

// Simple wallet connection - back to basics
export const connectMobileWallet = async (walletId: string): Promise<any> => {
  const wallet = SUPPORTED_WALLETS.find((w) => w.id === walletId)
  if (!wallet) throw new Error("Wallet not found")

  console.log(`🚀 Attempting mobile connection to ${walletId}`)

  // Simple approach - just try to connect
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })

        console.log(`✅ Mobile connection successful: ${accounts[0]}`)
        return {
          accounts,
          chainId,
          provider: window.ethereum,
        }
      }
    } catch (error: any) {
      console.log("❌ Mobile connection failed:", error.message)
      throw error
    }
  }

  throw new Error(`Please install ${wallet.name} and try again.`)
}

// Simple wallet provider detection
export const getWalletProvider = (walletId: string): any => {
  if (typeof window === "undefined") return null

  // Just return window.ethereum for all wallets
  return window.ethereum
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

// Simple wallet connection request
export const requestWalletConnection = async (walletId: string): Promise<any> => {
  console.log(`🚀 Requesting connection from ${walletId}`)

  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet detected. Please install a wallet extension.")
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

    return {
      accounts,
      chainId,
      provider: window.ethereum,
    }
  } catch (error: any) {
    console.error(`❌ ${walletId} connection failed:`, error)
    throw error
  }
}

// Open wallet installation page
export const openWalletInstallPage = (walletId: string): void => {
  const wallet = SUPPORTED_WALLETS.find((w) => w.id === walletId)
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

// Check if wallet is installed (simplified)
export const isWalletInstalled = (walletId: string): boolean => {
  // Just check if window.ethereum exists
  return typeof window !== "undefined" && !!window.ethereum
}

// Get wallet display name
export const getWalletDisplayName = (walletId: string): string => {
  const wallet = SUPPORTED_WALLETS.find((w) => w.id === walletId)
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

// Ensure Base network is added/switched (simplified)
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
