// Farcaster Mini App SDK initialization and utilities
// Based on official documentation: https://miniapps.farcaster.xyz/llms-full.txt

let sdk: any = null

// Try to import the SDK dynamically, but handle cases where it might not be available
const loadSDK = async () => {
  if (sdk) return sdk
  
  // Only try to load SDK in browser environment
  if (typeof window === 'undefined') {
    console.warn('⚠️ Farcaster SDK not available in server environment')
    return null
  }
  
  try {
    const sdkModule = await import('@farcaster/miniapp-sdk')
    sdk = sdkModule.sdk
    console.log('✅ Farcaster SDK loaded successfully')
    return sdk
  } catch (error) {
    console.warn('⚠️ Farcaster Mini App SDK not available:', error)
    return null
  }
}

export class FarcasterMiniApp {
  private static instance: FarcasterMiniApp
  private isInitialized = false

  private constructor() {}

  static getInstance(): FarcasterMiniApp {
    if (!FarcasterMiniApp.instance) {
      FarcasterMiniApp.instance = new FarcasterMiniApp()
    }
    return FarcasterMiniApp.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load SDK dynamically
      const sdkInstance = await loadSDK()
      if (!sdkInstance) {
        console.warn('⚠️ Farcaster SDK not available, skipping initialization')
        return
      }

      // Initialize the SDK - this hides the splash screen and displays content
      await sdkInstance.actions.ready()
      this.isInitialized = true
      console.log('✅ Farcaster Mini App SDK initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Farcaster Mini App SDK:', error)
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      const sdkInstance = await loadSDK()
      if (!sdkInstance) {
        console.warn('⚠️ Farcaster SDK not available')
        return null
      }

      const { token } = await sdkInstance.quickAuth.getToken()
      return token
    } catch (error) {
      console.error('❌ Failed to get auth token:', error)
      return null
    }
  }

  async makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<Response> {
    try {
      const sdkInstance = await loadSDK()
      if (!sdkInstance) {
        throw new Error('Farcaster SDK not available')
      }

      return await sdkInstance.quickAuth.fetch(url, options)
    } catch (error) {
      console.error('❌ Failed to make authenticated request:', error)
      throw error
    }
  }

  isFarcasterEnvironment(): boolean {
    return typeof window !== 'undefined' && (
      window.location.href.includes('farcaster') ||
      window.location.href.includes('warpcast') ||
      window.location.href.includes('miniapp')
    )
  }

  getCurrentUser(): Promise<{ fid: number } | null> {
    return this.getAuthToken().then(token => {
      if (!token) return null
      
      // Decode JWT to get FID (this is a simplified version)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return { fid: payload.sub }
      } catch {
        return null
      }
    })
  }

  // Check if SDK is available
  async isSDKAvailable(): Promise<boolean> {
    const sdkInstance = await loadSDK()
    return sdkInstance !== null
  }
}

// Export singleton instance
export const farcasterApp = FarcasterMiniApp.getInstance() 