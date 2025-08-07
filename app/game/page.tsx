"use client"

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
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 39, seconds: 46 })

  const { 
    address, 
    isConnected, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    error: walletError, 
    setError: setWalletError, 
    formatAddress 
  } = useWagmiWallet()

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
    if (!address) return false
    
    const today = new Date()
    today.setHours(12, 0, 0, 0) // Reset at 12pm PST
    
    const lastEntry = getLocalStorageItem(`daily_entry_${address}`)
    if (lastEntry) {
      const lastEntryDate = new Date(parseInt(lastEntry))
      return lastEntryDate < today
    }
    
    return true
  }, [address])

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
      securityMonitor.trackUserAction(address, 'GAME_ENTRY', {
        timestamp: Date.now(),
        gameType: 'daily',
        entryFee: '0.001'
      })

      // Record daily entry
      setLocalStorageItem(`daily_entry_${address}`, Date.now().toString())

      // Update player count
      updatePlayerCount()

      setSuccess('Successfully entered the game! Good luck! 🍕')
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000)

    } catch (error: any) {
      console.error('Game entry error:', error)
      const userMessage = errorHandler.handleError(error, 'GamePage.handleEnterGame', 'HIGH')
      setGameError(userMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [address, isConnected, checkDailyEntry, errorHandler, securityMonitor])

  // Calculate claimable toppings
  const calculateClaimableToppings = useCallback(() => {
    if (!address) return 0

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
  }, [address])

  // Update player counts
  const updatePlayerCount = useCallback(async () => {
    try {
      // For now, use localStorage fallback since we don't have contract methods
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
    } catch (error) {
      console.error('Error updating player count:', error)
    }
  }, [])

  // Update claimable toppings
  const updateClaimableToppings = useCallback(() => {
    const toppings = calculateClaimableToppings()
    setClaimableToppings(toppings)
  }, [calculateClaimableToppings])

  // Initialize data
  useEffect(() => {
    updatePlayerCount()
    updateClaimableToppings()
  }, [updatePlayerCount, updateClaimableToppings])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen p-4" style={{
      backgroundImage: "url('/images/rotated-90-pizza-wallpaper.png')",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center center",
    }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl p-6 mb-6">
          <h1 className="text-4xl text-center text-red-800 mb-6" style={{
            fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
            fontWeight: "bold"
          }}>
            🍕 PIZZA PARTY 🍕
          </h1>

          <div className="text-center mb-6">
            <p className="text-xl font-bold text-red-800 mb-2">8 Slices, 8 Winners!</p>
            <p className="text-lg text-gray-700 mb-2">Jackpot split 8 ways!</p>
            <p className="text-lg text-gray-700 mb-4">Winners picked every 24 hrs!</p>
          </div>

          {/* Countdown Timer */}
          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mb-6">
            <h3 className="text-lg font-bold text-blue-800 mb-2 text-center">
              Current Game Window Ends In:
            </h3>
            <div className="flex justify-center space-x-4 mb-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{timeLeft.hours}</div>
                <div className="text-sm text-blue-800">HRS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes}</div>
                <div className="text-sm text-blue-800">MIN</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{timeLeft.seconds}</div>
                <div className="text-sm text-blue-800">SEC</div>
              </div>
            </div>
            <p className="text-sm text-blue-600 text-center">New game starts daily at 12pm PST</p>
          </div>

          {/* Player Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-2 text-center">Players Today</h3>
              <p className="text-2xl font-bold text-blue-600 text-center">{dailyPlayers}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
              <h3 className="text-lg font-bold text-green-800 mb-2 text-center">Jackpot</h3>
              <p className="text-2xl font-bold text-green-600 text-center">$0</p>
            </div>
          </div>

          {/* Pizza Image */}
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-4">Delicious pizza with pepperoni, green peppers, and olives</p>
          </div>

          {/* Game Entry Section */}
          <div className="text-center mb-8">
            <Button
              onClick={handleEnterGame}
              disabled={isProcessing}
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

          {/* Weekly Jackpot Section */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">🏆 Weekly Jackpot 🏆</h2>
          </div>

          {/* Invite Friends Button */}
          <div className="text-center mb-6">
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

          {/* Game Rules */}
          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">🎯 Game Rules:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• One entry per wallet per day</li>
              <li>• Equal chance for all players</li>
              <li>• New game starts daily at 12pm PST</li>
            </ul>
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
}
