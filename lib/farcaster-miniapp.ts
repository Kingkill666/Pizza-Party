// Farcaster Mini App SDK initialization and utilities
// Based on official documentation: https://miniapps.farcaster.xyz/llms-full.txt

import { sdk } from '@farcaster/miniapp-sdk'

// Preconnect to Quick Auth Server for optimal performance
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = 'https://auth.farcaster.xyz'
  document.head.appendChild(link)
}

export class FarcasterMiniApp {
  private static instance: FarcasterMiniApp
  private isInitialized = false
  private isReadyCalled = false

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
      // SDK is now imported directly
      this.isInitialized = true
      console.log('✅ Farcaster Mini App SDK loaded')
    } catch (error) {
      console.error('❌ Failed to initialize Farcaster Mini App SDK:', error)
    }
  }

  // Call this after your app is fully loaded and ready to display
  // This is CRITICAL - if you don't call ready(), users will see an infinite loading screen
  async ready(): Promise<void> {
    if (this.isReadyCalled) return

    try {
      // This hides the splash screen and displays content
      await sdk.actions.ready()
      this.isReadyCalled = true
      console.log('✅ Farcaster Mini App ready - splash screen hidden')
    } catch (error) {
      console.error('❌ Failed to call ready:', error)
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

  isFarcasterEnvironment(): boolean {
    return typeof window !== 'undefined' && (
      window.location.href.includes('farcaster') ||
      window.location.href.includes('warpcast') ||
      window.location.href.includes('miniapp')
    )
  }

  // Check if SDK is available
  async isSDKAvailable(): Promise<boolean> {
    try {
      return true // SDK is imported directly
    } catch {
      return false
    }
  }

  // Make authenticated requests using Quick Auth
  async makeAuthenticatedRequest(url: string, options?: RequestInit): Promise<Response> {
    try {
      return await sdk.quickAuth.fetch(url, options)
    } catch (error) {
      console.error('❌ Failed to make authenticated request:', error)
      throw error
    }
  }

  // Get current user information
  async getCurrentUser(): Promise<{ fid: number } | null> {
    try {
      const token = await this.getAuthToken()
      if (!token) return null

      // You would typically validate this token on your server
      // For now, we'll just return a mock user
      return { fid: 12345 }
    } catch (error) {
      console.error('❌ Failed to get current user:', error)
      return null
    }
  }
}

// Export singleton instance
export const farcasterApp = FarcasterMiniApp.getInstance() 