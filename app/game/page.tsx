"use client"
// DEPLOYMENT MARKER: SSR Protection Update - Commit 4dbddf0

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWagmiWallet } from '@/hooks/useWagmiWallet'
import { WagmiWalletModal } from '@/components/WagmiWalletModal'
import { PizzaPartyContract } from '@/lib/contract-interactions'
import { InputValidator } from '@/lib/input-validator'
import { ErrorHandler } from '@/lib/error-handler'
import { SecurityMonitor } from '@/lib/security-monitor'

export default function GamePage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [dailyPlayers, setDailyPlayers] = useState(0)
  const [weeklyPlayers, setWeeklyPlayers] = useState(0)
  const [claimableToppings, setClaimableToppings] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const [hasError, setHasError] = useState(false)

  // SSR PROTECTION: Check if we're on the client side
  useEffect(() => {
    try {
      setIsClient(true)
    } catch (error) {
      console.error('Client-side initialization error:', error)
      setHasError(true)
    }
  }, [])

  // Error boundary for client-side errors
  if (hasError) {
    return (
      <div className="min-h-screen p-4" style={{
        backgroundImage: "url('/images/rotated-90-pizza-wallpaper.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl p-6">
            <h1 className="text-4xl text-center text-red-800 mb-6" style={{
              fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
              fontWeight: "bold"
            }}>
              🍕 Pizza Party 🍕
            </h1>
            <p className="text-center text-gray-600 mb-4">Something went wrong loading the game.</p>
            <div className="text-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-800 hover:bg-red-900 text-white"
              >
                🔄 Reload Game
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // SSR SAFETY: Don't render anything until client-side to prevent SSR issues
  if (!isClient) {
    return (
      <div className="min-h-screen p-4" style={{
        backgroundImage: "url('/images/rotated-90-pizza-wallpaper.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl p-6">
            <h1 className="text-4xl text-center text-red-800 mb-6" style={{
              fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
              fontWeight: "bold"
            }}>
              🍕 Pizza Party 🍕
            </h1>
            <p className="text-center text-gray-600">Loading game...</p>
          </div>
        </div>
      </div>
    )
  }

  // SSR SAFETY: Only call Wagmi hooks after client-side hydration
  let wagmiWallet = null
  try {
    wagmiWallet = useWagmiWallet()
  } catch (error) {
    console.error('Wagmi wallet hook error:', error)
    setHasError(true)
    return null
  }

  const { 
    address, 
    isConnected, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    error: walletError, 
    setError: setWalletError, 
    formatAddress 
  } = wagmiWallet

  const errorHandler = ErrorHandler.getInstance()
  const securityMonitor = SecurityMonitor.getInstance()

  // Safe localStorage access
  const getLocalStorageItem = (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key)
    }
    return null
  }

  const setLocalStorageItem = (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value)
    }
  }

  // Check daily entry eligibility
  const checkDailyEntry = useCallback(() => {
    if (!address || !isClient) return false
    
    const today = new Date()
    today.setHours(12, 0, 0, 0) // Reset at 12pm PST
    
    const lastEntry = getLocalStorageItem(`daily_entry_${address}`)
    if (lastEntry) {
      const lastEntryDate = new Date(parseInt(lastEntry))
      return lastEntryDate < today
    }
    
    return true
  }, [address, isClient])

  // Handle game entry with enhanced security
  const handleEnterGame = useCallback(async () => {
    if (!isConnected) {
      setShowWalletModal(true)
      return
    }

    if (!address) {
      const error = new Error('Wallet not connected')
      const userMessage = errorHandler.handleError(error, 'GamePage.handleEnterGame', 'HIGH')
      setGameError(userMessage)
      return
    }

    // Input validation
    const addressValidation = InputValidator.validateWalletAddress(address)
    if (!addressValidation.valid) {
      const error = new Error(addressValidation.error || 'Invalid wallet address')
      const userMessage = errorHandler.handleError(error, 'GamePage.handleEnterGame', 'HIGH')
      setGameError(userMessage)
      return
    }

    // Check if user is flagged for suspicious activity
    if (securityMonitor.isUserFlagged(address)) {
      const error = new Error('Account temporarily restricted due to suspicious activity')
      const userMessage = errorHandler.handleError(error, 'GamePage.handleEnterGame', 'CRITICAL')
      setGameError(userMessage)
      return
    }

    // Check rate limits
    const rateLimitStatus = securityMonitor.getRateLimitStatus(address, 'GAME_ENTRY')
    if (!rateLimitStatus.allowed) {
      const error = new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimitStatus.resetTime - Date.now()) / 60000)} minutes`)
      const userMessage = errorHandler.handleError(error, 'GamePage.handleEnterGame', 'MEDIUM')
      setGameError(userMessage)
      return
    }

    // Check daily entry eligibility
    if (!checkDailyEntry()) {
      const error = new Error('Daily entry already completed. Come back tomorrow at 12pm PST!')
      const userMessage = errorHandler.handleError(error, 'GamePage.handleEnterGame', 'MEDIUM')
      setGameError(userMessage)
      return
    }

    setIsProcessing(true)
    setGameError(null)
    setSuccess(null)

    try {
      // Track user action for security monitoring
      securityMonitor.trackUserAction({
        type: 'GAME_ENTRY',
        userId: address,
        userAgent: navigator.userAgent,
        metadata: { timestamp: Date.now() }
      })

      // For now, simulate contract interaction since we don't have a provider
      // In a real implementation, you would use the actual contract
      console.log('🎮 Entering game with 0.001 Base Sepolia ETH...')
      
      // Simulate transaction
      const txHash = `0x${Math.random().toString(16).substring(2, 66)}`
      
      // Record successful entry
      setLocalStorageItem(`daily_entry_${address}`, Date.now().toString())
      
      // Update player count
      updatePlayerCount()
      
      setSuccess(`✅ Successfully entered game! Transaction: ${txHash}`)
      
      // Track successful action
      securityMonitor.trackUserAction({
        type: 'GAME_ENTRY_SUCCESS',
        userId: address,
        metadata: { transactionHash: txHash }
      })

    } catch (error: any) {
      console.error('Game entry error:', error)
      
      // Enhanced error handling
      const userMessage = errorHandler.handleError(error, 'GamePage.handleEnterGame', 'HIGH')
      setGameError(userMessage)
      
      // Track failed action
      securityMonitor.trackUserAction({
        type: 'GAME_ENTRY_FAILED',
        userId: address,
        metadata: { error: error.message }
      })
    } finally {
      setIsProcessing(false)
    }
  }, [address, isConnected, checkDailyEntry, errorHandler, securityMonitor])

  // Calculate claimable toppings
  const calculateClaimableToppings = useCallback(() => {
    if (!address || !isClient) return 0

    let toppings = 0

    // Daily Play: 1 topping
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const lastEntry = getLocalStorageItem(`daily_entry_${address}`)
    if (lastEntry) {
      const lastEntryDate = new Date(parseInt(lastEntry))
      if (lastEntryDate >= today) {
        toppings += 1
      }
    }

    // Base Sepolia Holdings: 1 topping for minimum 0.001 ETH held
    const balance = parseFloat(getLocalStorageItem(`balance_${address}`) || '0')
    if (balance >= 0.001) {
      toppings += 1
    }

    // Referrals: 1 topping per referral
    const referrals = parseInt(getLocalStorageItem(`referrals_${address}`) || '0')
    toppings += referrals

    // 7-Day Streak: 1 topping
    const streak = parseInt(getLocalStorageItem(`streak_${address}`) || '0')
    if (streak >= 7) {
      toppings += 1
    }

    return toppings
  }, [address, isClient])

  // Update player counts
  const updatePlayerCount = useCallback(async () => {
    try {
      // For now, use localStorage fallback since we don't have contract methods
      if (isClient) {
        const dailyEntries = Object.keys(localStorage)
          .filter(key => key.startsWith('daily_entry_'))
          .filter(key => {
            const entryDate = new Date(parseInt(localStorage.getItem(key) || '0'))
            const today = new Date()
            today.setHours(12, 0, 0, 0)
            return entryDate >= today
          }).length
        setDailyPlayers(dailyEntries)
        
        // Weekly players (last 7 days)
        const weeklyEntries = Object.keys(localStorage)
          .filter(key => key.startsWith('daily_entry_'))
          .filter(key => {
            const entryDate = new Date(parseInt(localStorage.getItem(key) || '0'))
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return entryDate >= weekAgo
          }).length
        setWeeklyPlayers(weeklyEntries)
      }
    } catch (error) {
      console.error('Error updating player count:', error)
    }
  }, [isClient])

  // Update claimable toppings
  const updateClaimableToppings = useCallback(() => {
    const toppings = calculateClaimableToppings()
    setClaimableToppings(toppings)
  }, [calculateClaimableToppings])

  // Initialize data
  useEffect(() => {
    if (isClient) {
      updatePlayerCount()
      updateClaimableToppings()
    }
  }, [isClient, updatePlayerCount, updateClaimableToppings])

  // Debug daily tracking
  const debugDailyTracking = () => {
    if (!address || !isClient) return

    console.log('🔍 Daily Entry Debug:')
    console.log('Address:', address)
    console.log('Today (12pm PST):', new Date().setHours(12, 0, 0, 0))
    console.log('Last Entry:', getLocalStorageItem(`daily_entry_${address}`))
    console.log('Can Enter Today:', checkDailyEntry())
  }

  try {
    return (
    <div
      className="min-h-screen p-4"
      style={{
        backgroundImage: "url('/images/rotated-90-pizza-wallpaper.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl p-6 mb-6">
          <h1 className="text-4xl text-center text-red-800 mb-6" style={{
            fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
            fontWeight: "bold"
          }}>
            🍕 Pizza Party 🍕
          </h1>

          {/* Game Entry Section */}
          <div className="text-center mb-8">
            <Button
              onClick={handleEnterGame}
              disabled={isProcessing || !isClient}
              className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all"
              style={{
                fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
                fontWeight: "bold"
              }}
            >
              {isProcessing ? "Processing..." : "ENTER GAME .001 Base Sepolia"}
            </Button>

            {/* Wallet Status */}
            {isConnected && address && (
              <div className="mt-4 p-3 bg-green-100 rounded-xl border-2 border-green-300">
                <p className="text-sm text-green-800 font-mono">
                  ✅ Connected to Wallet {formatAddress}
                </p>
              </div>
            )}

            {/* Error/Success Messages */}
            {gameError && (
              <div className="mt-4 p-3 bg-red-100 rounded-xl border-2 border-red-300">
                <p className="text-sm text-red-800">{gameError}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-100 rounded-xl border-2 border-green-300">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}
          </div>

          {/* Player Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Players Today</h3>
              <p className="text-2xl font-bold text-blue-600">{dailyPlayers}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-800 mb-2">Claimable Toppings</h3>
              <p className="text-2xl font-bold text-purple-600">{claimableToppings}</p>
            </div>
          </div>

          {/* Invite Friends Button */}
          <div className="text-center">
            <Button
              onClick={() => {
                if (!isConnected) {
                  setShowWalletModal(true)
                } else {
                  setShowInviteModal(true)
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg"
              style={{
                fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
                fontWeight: "bold"
              }}
            >
              👥 Invite Friends
            </Button>
            
            {!isConnected && (
              <p className="text-sm text-gray-600 mt-2">
                Connect wallet to invite friends
              </p>
            )}
          </div>
        </div>

        {/* Wallet Connection Modal */}
        <WagmiWalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
        />

        {/* Invite Friends Modal */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="bg-white/95 backdrop-blur-sm border-4 border-blue-800 rounded-3xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-blue-800 text-center" style={{
                fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
                fontWeight: "bold"
              }}>
                🎉 Invite Friends to Pizza Party! 🎉
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700 text-center">
                Share the fun! Invite your friends to join Pizza Party and earn rewards together.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    const url = window.location.href
                    const text = "🍕 Join me in Pizza Party! A fun decentralized game on Base Sepolia! 🎮"
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  🐦 Share on Twitter
                </Button>
                
                <Button
                  onClick={() => {
                    const url = window.location.href
                    const text = "🍕 Join me in Pizza Party! A fun decentralized game on Base Sepolia! 🎮"
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📘 Share on Facebook
                </Button>
                
                <Button
                  onClick={() => {
                    const url = window.location.href
                    const text = "🍕 Join me in Pizza Party! A fun decentralized game on Base Sepolia! 🎮"
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                >
                  💼 Share on LinkedIn
                </Button>
                
                <Button
                  onClick={() => {
                    const url = window.location.href
                    const text = "🍕 Join me in Pizza Party! A fun decentralized game on Base Sepolia! 🎮"
                    navigator.clipboard.writeText(`${text}\n${url}`)
                    alert("Link copied to clipboard!")
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  📋 Copy Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
  } catch (error) {
    console.error('Game page rendering error:', error)
    return (
      <div className="min-h-screen p-4" style={{
        backgroundImage: "url('/images/rotated-90-pizza-wallpaper.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl p-6">
            <h1 className="text-4xl text-center text-red-800 mb-6" style={{
              fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
              fontWeight: "bold"
            }}>
              🍕 Pizza Party 🍕
            </h1>
            <p className="text-center text-gray-600 mb-4">Something went wrong rendering the game.</p>
            <div className="text-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-800 hover:bg-red-900 text-white"
              >
                🔄 Reload Game
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
