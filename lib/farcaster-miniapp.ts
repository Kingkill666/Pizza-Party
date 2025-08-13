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

  // Share content on Farcaster
  async shareOnFarcaster(content: string, options?: {
    embeds?: string[]
    channelId?: string
  }): Promise<boolean> {
    try {
      if (!this.isFarcasterEnvironment()) {
        console.log('⚠️ Not in Farcaster environment, using fallback sharing')
        return this.fallbackShare(content)
      }

      // Use Farcaster SDK to share content
      await sdk.actions.share({
        text: content,
        embeds: options?.embeds || [],
        channelId: options?.channelId
      })

      console.log('✅ Content shared on Farcaster successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to share on Farcaster:', error)
      return this.fallbackShare(content)
    }
  }

  // Share game results on Farcaster
  async shareGameResult(result: {
    type: 'entry' | 'winner' | 'jackpot'
    amount?: string
    gameType?: 'daily' | 'weekly'
    toppings?: number
  }): Promise<boolean> {
    const content = this.generateGameShareContent(result)
    return this.shareOnFarcaster(content, {
      embeds: ['https://pizza-party-game.vercel.app']
    })
  }

  // Generate share content for different game events
  private generateGameShareContent(result: {
    type: 'entry' | 'winner' | 'jackpot'
    amount?: string
    gameType?: 'daily' | 'weekly'
    toppings?: number
  }): string {
    switch (result.type) {
      case 'entry':
        return `🎮 Just entered Pizza Party! 🍕\n\nJoin me in the daily game and earn toppings for the weekly jackpot!\n\nPlay now: https://pizza-party-game.vercel.app`
      
      case 'winner':
        const gameType = result.gameType === 'weekly' ? 'weekly' : 'daily'
        const amount = result.amount || 'some VMF'
        return `🏆 I just won ${amount} in the ${gameType} Pizza Party jackpot! 🍕\n\nThanks to my ${result.toppings || 0} toppings this week!\n\nJoin the fun: https://pizza-party-game.vercel.app`
      
      case 'jackpot':
        return `💰 The ${result.gameType || 'weekly'} Pizza Party jackpot is now ${result.amount || 'growing'}! 🍕\n\n${result.toppings || 0} toppings claimed this week!\n\nDon't miss out: https://pizza-party-game.vercel.app`
      
      default:
        return `🎮 Playing Pizza Party! 🍕\n\nDaily games, weekly jackpots, and topping rewards!\n\nJoin me: https://pizza-party-game.vercel.app`
    }
  }

  // Fallback sharing for non-Farcaster environments
  private fallbackShare(content: string): boolean {
    try {
      if (navigator.share) {
        navigator.share({
          title: 'Pizza Party Game',
          text: content,
          url: 'https://pizza-party-game.vercel.app'
        })
        return true
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(content + '\n\nhttps://pizza-party-game.vercel.app')
        console.log('✅ Content copied to clipboard')
        return true
      } else {
        console.log('⚠️ No sharing method available')
        return false
      }
    } catch (error) {
      console.error('❌ Fallback sharing failed:', error)
      return false
    }
  }

  // Share referral code on Farcaster
  async shareReferralCode(referralCode: string): Promise<boolean> {
    const content = `🎯 Use my Pizza Party referral code: ${referralCode}\n\nJoin the game and we both get 2 toppings!\n\nPlay now: https://pizza-party-game.vercel.app`
    
    return this.shareOnFarcaster(content, {
      embeds: ['https://pizza-party-game.vercel.app']
    })
  }

  // Share leaderboard on Farcaster
  async shareLeaderboard(leaderboardType: 'daily' | 'weekly'): Promise<boolean> {
    const content = `🏆 ${leaderboardType.charAt(0).toUpperCase() + leaderboardType.slice(1)} Pizza Party Winners!\n\nCheck out who won the latest jackpot!\n\nView leaderboard: https://pizza-party-game.vercel.app/leaderboard`
    
    return this.shareOnFarcaster(content, {
      embeds: ['https://pizza-party-game.vercel.app/leaderboard']
    })
  }

  // Share jackpot milestone on Farcaster
  async shareJackpotMilestone(amount: string, type: 'daily' | 'weekly'): Promise<boolean> {
    const content = `💰 ${type.charAt(0).toUpperCase() + type.slice(1)} Jackpot Milestone: ${amount} VMF! 🍕\n\nThe Pizza Party jackpot keeps growing!\n\nJoin the game: https://pizza-party-game.vercel.app`
    
    return this.shareOnFarcaster(content, {
      embeds: ['https://pizza-party-game.vercel.app']
    })
  }
}

// Export singleton instance
export const farcasterApp = FarcasterMiniApp.getInstance() 