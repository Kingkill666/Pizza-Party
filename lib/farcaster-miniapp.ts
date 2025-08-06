import { sdk } from '@farcaster/miniapp-sdk'

// Farcaster Mini App SDK initialization and utilities
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
      // Initialize the SDK
      await sdk.actions.ready()
      this.isInitialized = true
      console.log('✅ Farcaster Mini App SDK initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Farcaster Mini App SDK:', error)
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      const { token } = await sdk.quickAuth.getToken()
      return token
    } catch (error) {
      console.error('❌ Failed to get auth token:', error)
      return null
    }
  }

  async makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<Response> {
    try {
      return await sdk.quickAuth.fetch(url, options)
    } catch (error) {
      console.error('❌ Failed to make authenticated request:', error)
      throw error
    }
  }

  isFarcasterEnvironment(): boolean {
    return typeof window !== 'undefined' && window.location.href.includes('farcaster')
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
}

// Export singleton instance
export const farcasterApp = FarcasterMiniApp.getInstance() 