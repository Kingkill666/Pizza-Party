"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWallet } from '@/hooks/useWallet'
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

  const {
    address,
    isConnected,
    connectWallet,
    disconnectWallet,
    isConnecting,
    error: walletError,
    setError: setWalletError,
    formatAddress
  } = useWallet()

  // Initialize security systems
  const errorHandler = ErrorHandler.getInstance()
  const securityMonitor = SecurityMonitor.getInstance()

  // Check daily entry eligibility
  const checkDailyEntry = useCallback(() => {
    if (!address) return false
    
    const today = new Date()
    today.setHours(12, 0, 0, 0) // Reset at 12pm PST
    
    const lastEntry = localStorage.getItem(`daily_entry_${address}`)
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
      securityMonitor.trackUserAction({
        type: 'GAME_ENTRY',
        userId: address,
        userAgent: navigator.userAgent,
        metadata: { timestamp: Date.now() }
      })

      const contract = new PizzaPartyContract()
      const tx = await contract.enterDailyGame("", {
        value: "0.001"
      })

      // Record successful entry
      localStorage.setItem(`daily_entry_${address}`, Date.now().toString())
      
      // Update player count
      updatePlayerCount()
      
      setSuccess(`✅ Successfully entered game! Transaction: ${tx.hash}`)
      
      // Track successful action
      securityMonitor.trackUserAction({
        type: 'GAME_ENTRY_SUCCESS',
        userId: address,
        metadata: { transactionHash: tx.hash }
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
  }, [isConnected, address, checkDailyEntry, errorHandler, securityMonitor])

  // Update player count with enhanced error handling
  const updatePlayerCount = useCallback(async () => {
    try {
      const contract = new PizzaPartyContract()
      const dailyCount = await contract.getDailyPlayerCount()
      const weeklyCount = await contract.getWeeklyPlayerCount()
      
      setDailyPlayers(dailyCount || 0)
      setWeeklyPlayers(weeklyCount || 0)
    } catch (error: any) {
      console.error('Error updating player count:', error)
      // Don't show error to user for this background operation
    }
  }, [])

  // Calculate claimable toppings with validation
  const getClaimableToppings = useCallback(() => {
    if (!address) return 0

    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(address)
      if (!addressValidation.valid) {
        console.error('Invalid address for topping calculation:', addressValidation.error)
        return 0
      }

      let totalToppings = 0

      // Daily Play (1 topping)
      if (checkDailyEntry()) {
        totalToppings += 1
      }

      // Base Sepolia Holdings (1 topping per 0.001 ETH minimum)
      const balance = parseFloat(localStorage.getItem(`balance_${address}`) || '0')
      if (balance >= 0.001) {
        totalToppings += 1
      }

      // Referrals (1 topping per referral)
      const referrals = parseInt(localStorage.getItem(`referrals_${address}`) || '0')
      totalToppings += referrals

      // 7-Day Streak (1 topping)
      const streak = parseInt(localStorage.getItem(`streak_${address}`) || '0')
      if (streak >= 7) {
        totalToppings += 1
      }

      return totalToppings
    } catch (error: any) {
      console.error('Error calculating toppings:', error)
      return 0
    }
  }, [address, checkDailyEntry])

  // Handle wallet connection with security tracking
  const handleWalletConnect = useCallback(async (connectorId: string) => {
    try {
      // Track connection attempt
      securityMonitor.trackUserAction({
        type: 'WALLET_CONNECTION_ATTEMPT',
        userId: 'unknown',
        userAgent: navigator.userAgent
      })

      await connectWallet(connectorId)
      
      // Track successful connection
      if (address) {
        securityMonitor.trackUserAction({
          type: 'WALLET_CONNECTION_SUCCESS',
          userId: address,
          metadata: { connectorId }
        })
      }
    } catch (error: any) {
      // Track failed connection
      securityMonitor.trackUserAction({
        type: 'WALLET_CONNECTION_FAILED',
        userId: 'unknown',
        metadata: { error: error.message, connectorId }
      })
      
      const userMessage = errorHandler.handleError(error, 'GamePage.handleWalletConnect', 'MEDIUM')
      setWalletError(userMessage)
    }
  }, [connectWallet, address, securityMonitor, errorHandler, setWalletError])

  // Initialize on mount
  useEffect(() => {
    updatePlayerCount()
    const interval = setInterval(updatePlayerCount, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [updatePlayerCount])

  // Update claimable toppings
  useEffect(() => {
    const toppings = getClaimableToppings()
    setClaimableToppings(toppings)
  }, [getClaimableToppings])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-800 mb-2">🍕 Pizza Party Game 🍕</h1>
          <p className="text-gray-600">Enter daily for a chance to win Base Sepolia ETH!</p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Players Today</h3>
            <p className="text-2xl font-bold text-red-600">{dailyPlayers}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Players</h3>
            <p className="text-2xl font-bold text-red-600">{weeklyPlayers}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Your Toppings</h3>
            <p className="text-2xl font-bold text-red-600">{claimableToppings}</p>
          </div>
        </div>

        {/* Main Game Section */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Daily Game</h2>
            <p className="text-gray-600 mb-6">Pay 0.001 Base Sepolia ETH to enter today's game</p>
            
            <Button
              onClick={handleEnterGame}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
            >
              {isProcessing ? 'Processing...' : 'ENTER GAME .001 Base Sepolia'}
            </Button>

            {/* Wallet Status */}
            {isConnected && address && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✅ Connected to {formatAddress}
                </p>
              </div>
            )}

            {/* Error Messages */}
            {gameError && (
              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="text-red-800">{gameError}</p>
              </div>
            )}

            {/* Success Messages */}
            {success && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-green-800">{success}</p>
              </div>
            )}
          </div>
        </div>

        {/* Invite Friends Section */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Invite Friends</h2>
            <p className="text-gray-600 mb-6">Share Pizza Party with friends and earn rewards!</p>
            
            <Button
              onClick={() => {
                if (!isConnected) {
                  setShowWalletModal(true)
                } else {
                  setShowInviteModal(true)
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Invite Friends
            </Button>

            {/* Wallet Required Hint */}
            {!isConnected && (
              <p className="mt-2 text-sm text-gray-500">
                Connect your wallet to invite friends
              </p>
            )}
          </div>
        </div>

        {/* Wallet Connection Modal */}
        <WagmiWalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletConnect}
        />

        {/* Invite Modal */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">
                🍕 Invite Friends 🍕
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Share your referral code with friends to earn extra toppings!
                </p>
                
                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                  <p className="font-mono text-lg font-bold text-gray-800">
                    PIZZA{address?.slice(-6) || 'XXXXXX'}
                  </p>
                </div>
                
                <Button
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: 'Join Pizza Party!',
                        text: `Join me in Pizza Party and earn Base Sepolia ETH! Use my referral code: PIZZA${address?.slice(-6) || 'XXXXXX'}`,
                        url: window.location.href
                      })
                    } else {
                      // Fallback to clipboard
                      navigator.clipboard.writeText(`Join Pizza Party! Use my referral code: PIZZA${address?.slice(-6) || 'XXXXXX'}`)
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
