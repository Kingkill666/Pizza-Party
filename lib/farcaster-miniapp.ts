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

      // Store SDK instance for later use
      this.isInitialized = true
      console.log('✅ Farcaster Mini App SDK loaded')
    } catch (error) {
      console.error('❌ Failed to initialize Farcaster Mini App SDK:', error)
    }
  }

  // Call this after your app is fully loaded and ready to display
  async ready(): Promise<void> {
    try {
      const sdkInstance = await loadSDK()
      if (!sdkInstance) {
        console.warn('⚠️ Farcaster SDK not available, skipping ready call')
        return
      }

      // This hides the splash screen and displays content
      await sdkInstance.actions.ready()
      console.log('✅ Farcaster Mini App ready - splash screen hidden')
    } catch (error) {
      console.error('❌ Failed to call ready:', error)
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

  isFarcasterEnvironment(): boolean {
    return typeof window !== 'undefined' && (
      window.location.href.includes('farcaster') ||
      window.location.href.includes('warpcast') ||
      window.location.href.includes('miniapp')
    )
  }

  // Check if SDK is available
  async isSDKAvailable(): Promise<boolean> {
    const sdkInstance = await loadSDK()
    return sdkInstance !== null
  }

  // Follow the documentation pattern for making authenticated requests
  async makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<Response> {
    try {
      const sdkInstance = await loadSDK()
      if (!sdkInstance) {
        throw new Error('Farcaster SDK not available')
      }

      // Use the documented pattern from the docs
      return await sdkInstance.quickAuth.fetch(url, options)
    } catch (error) {
      console.error('❌ Failed to make authenticated request:', error)
      throw error
    }
  }

  // Get user information following the documentation pattern
  async getCurrentUser(): Promise<{ fid: number } | null> {
    try {
      const token = await this.getAuthToken()
      if (!token) return null
      
      // Decode JWT to get FID (following the documentation pattern)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return { fid: payload.sub }
      } catch {
        return null
      }
    } catch (error) {
      console.error('❌ Failed to get current user:', error)
      return null
    }
  }
}

// Export singleton instance
export const farcasterApp = FarcasterMiniApp.getInstance() 