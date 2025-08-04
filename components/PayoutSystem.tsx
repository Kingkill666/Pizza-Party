"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, Users, Clock, Gift, Star, AlertCircle, Check } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { useVMFBalance } from "@/hooks/useVMFBalance"
import { calculateCommunityJackpot, formatJackpotAmount, getWeeklyJackpotInfo } from "@/lib/jackpot-data"

// Enhanced payout system with smart contract integration
export default function PayoutSystem() {
  const customFontStyle = {
    fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
    fontWeight: "bold" as const,
  }

  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutHistory, setPayoutHistory] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [payoutError, setPayoutError] = useState<string | null>(null)
  const [communityJackpot, setCommunityJackpot] = useState(0)
  const [weeklyInfo, setWeeklyInfo] = useState({
    totalToppings: 0,
    totalPlayers: 0,
    timeUntilDraw: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  })

  const { isConnected, connection } = useWallet()
  const { balance, formattedBalance, hasMinimum } = useVMFBalance()

  // Load payout data
  useEffect(() => {
    loadPayoutData()
    const interval = setInterval(loadPayoutData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadPayoutData = () => {
    // Load community jackpot
    const jackpot = calculateCommunityJackpot()
    setCommunityJackpot(jackpot)

    // Load weekly info
    const info = getWeeklyJackpotInfo()
    setWeeklyInfo(info)

    // Load payout history from localStorage
    if (typeof window !== "undefined") {
      const history = JSON.parse(localStorage.getItem("pizza_payout_history") || "[]")
      setPayoutHistory(history)
    }
  }

  // Process daily payout (simulated smart contract call)
  const processDailyPayout = async () => {
    if (!isConnected) {
      setPayoutError("Wallet not connected")
      return
    }

    setIsProcessing(true)
    setPayoutError(null)

    try {
      // Simulate smart contract interaction
      console.log("🎯 Processing daily payout...")
      
      // Get current game data
      const currentGame = getCurrentGameData()
      
      // Select winners (simulated)
      const winners = selectDailyWinners(currentGame.totalEntries)
      
      // Calculate prize per winner
      const prizePerWinner = currentGame.jackpotAmount / 8 // 8 winners
      
      // Record payout
      const payoutRecord = {
        id: Date.now(),
        type: "daily",
        timestamp: Date.now(),
        winners: winners,
        jackpotAmount: currentGame.jackpotAmount,
        prizePerWinner: prizePerWinner,
        totalEntries: currentGame.totalEntries,
        processed: true,
      }

      // Store payout history
      const history = JSON.parse(localStorage.getItem("pizza_payout_history") || "[]")
      history.unshift(payoutRecord)
      localStorage.setItem("pizza_payout_history", JSON.stringify(history))
      setPayoutHistory(history)

      // Reset daily game
      resetDailyGame()

      console.log("✅ Daily payout processed successfully")
    } catch (error) {
      console.error("❌ Daily payout failed:", error)
      setPayoutError("Failed to process daily payout")
    } finally {
      setIsProcessing(false)
    }
  }

  // Process weekly payout (simulated smart contract call)
  const processWeeklyPayout = async () => {
    if (!isConnected) {
      setPayoutError("Wallet not connected")
      return
    }

    setIsProcessing(true)
    setPayoutError(null)

    try {
      // Simulate smart contract interaction
      console.log("🏆 Processing weekly payout...")
      
      // Get weekly data
      const weeklyData = getWeeklyData()
      
      // Select winners based on toppings (weighted)
      const winners = selectWeeklyWinners(weeklyData.players)
      
      // Calculate prize per winner
      const prizePerWinner = weeklyData.jackpotAmount / 10 // 10 winners
      
      // Record payout
      const payoutRecord = {
        id: Date.now(),
        type: "weekly",
        timestamp: Date.now(),
        winners: winners,
        jackpotAmount: weeklyData.jackpotAmount,
        prizePerWinner: prizePerWinner,
        totalToppings: weeklyData.totalToppings,
        totalPlayers: weeklyData.totalPlayers,
        processed: true,
      }

      // Store payout history
      const history = JSON.parse(localStorage.getItem("pizza_payout_history") || "[]")
      history.unshift(payoutRecord)
      localStorage.setItem("pizza_payout_history", JSON.stringify(history))
      setPayoutHistory(history)

      // Reset weekly game
      resetWeeklyGame()

      console.log("✅ Weekly payout processed successfully")
    } catch (error) {
      console.error("❌ Weekly payout failed:", error)
      setPayoutError("Failed to process weekly payout")
    } finally {
      setIsProcessing(false)
    }
  }

  // Get current game data
  const getCurrentGameData = () => {
    const today = new Date().toDateString()
    let totalEntries = 0
    let jackpotAmount = 0

    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith("pizza_entry_") && key.endsWith(`_${today}`)) {
          if (localStorage.getItem(key) === "true") {
            totalEntries++
            jackpotAmount += 50 // 50 VMF per entry
          }
        }
      })
    }

    return {
      totalEntries,
      jackpotAmount,
    }
  }

  // Get weekly data
  const getWeeklyData = () => {
    let totalToppings = 0
    let totalPlayers = 0
    const players: any[] = []

    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith("pizza_toppings_")) {
          const toppings = Number.parseInt(localStorage.getItem(key) || "0")
          if (toppings > 0) {
            const address = key.replace("pizza_toppings_", "")
            totalToppings += toppings
            totalPlayers++
            players.push({ address, toppings })
          }
        }
      })
    }

    return {
      totalToppings,
      totalPlayers,
      players,
      jackpotAmount: totalToppings * 25, // 25 VMF per topping
    }
  }

  // Select daily winners (simulated)
  const selectDailyWinners = (totalEntries: number): string[] => {
    const winners: string[] = []
    const addresses = getPlayerAddresses()
    
    for (let i = 0; i < 8 && i < addresses.length; i++) {
      const randomIndex = Math.floor(Math.random() * addresses.length)
      winners.push(addresses[randomIndex])
      addresses.splice(randomIndex, 1)
    }
    
    return winners
  }

  // Select weekly winners based on toppings (weighted)
  const selectWeeklyWinners = (players: any[]): string[] => {
    const winners: string[] = []
    
    if (players.length === 0) return winners
    
    // Create weighted selection
    const totalWeight = players.reduce((sum, player) => sum + player.toppings, 0)
    
    for (let i = 0; i < 10 && i < players.length; i++) {
      const random = Math.random() * totalWeight
      let currentWeight = 0
      
      for (const player of players) {
        currentWeight += player.toppings
        if (random <= currentWeight && !winners.includes(player.address)) {
          winners.push(player.address)
          break
        }
      }
    }
    
    return winners
  }

  // Get player addresses
  const getPlayerAddresses = (): string[] => {
    const addresses: string[] = []
    
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith("pizza_entry_")) {
          const address = key.replace("pizza_entry_", "").split("_")[0]
          if (!addresses.includes(address)) {
            addresses.push(address)
          }
        }
      })
    }
    
    return addresses
  }

  // Reset daily game
  const resetDailyGame = () => {
    if (typeof window !== "undefined") {
      const today = new Date().toDateString()
      const keys = Object.keys(localStorage)
      
      keys.forEach((key) => {
        if (key.startsWith("pizza_entry_") && key.endsWith(`_${today}`)) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // Reset weekly game
  const resetWeeklyGame = () => {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
      
      keys.forEach((key) => {
        if (key.startsWith("pizza_toppings_")) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Format address
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Payout Controls */}
      <Card className="bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-800" style={customFontStyle}>
            🏆 Payout System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Daily Payout */}
          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-800" style={customFontStyle}>
                  Daily Payout
                </h3>
                <p className="text-sm text-blue-600" style={customFontStyle}>
                  Jackpot: {formatJackpotAmount(communityJackpot)} VMF
                </p>
              </div>
              <Button
                onClick={processDailyPayout}
                disabled={isProcessing || !isConnected}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? "Processing..." : "Process Daily"}
              </Button>
            </div>
          </div>

          {/* Weekly Payout */}
          <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-green-800" style={customFontStyle}>
                  Weekly Payout
                </h3>
                <p className="text-sm text-green-600" style={customFontStyle}>
                  Total Toppings: {weeklyInfo.totalToppings.toLocaleString()}
                </p>
              </div>
              <Button
                onClick={processWeeklyPayout}
                disabled={isProcessing || !isConnected}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? "Processing..." : "Process Weekly"}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {payoutError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-bold" style={customFontStyle}>
                  {payoutError}
                </p>
              </div>
            </div>
          )}

      {/* Payout History */}
          <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3" style={customFontStyle}>
              📊 Payout History
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {payoutHistory.length === 0 ? (
                <p className="text-gray-600 text-center" style={customFontStyle}>
                  No payouts processed yet
                </p>
              ) : (
                payoutHistory.map((payout) => (
                  <div key={payout.id} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800" style={customFontStyle}>
                          {payout.type === "daily" ? "🎯 Daily" : "🏆 Weekly"} Payout
                        </p>
                        <p className="text-sm text-gray-600" style={customFontStyle}>
                          {formatTimestamp(payout.timestamp)}
                        </p>
                        <p className="text-sm text-gray-600" style={customFontStyle}>
                          Jackpot: {formatJackpotAmount(payout.jackpotAmount)} VMF
                  </p>
                        <p className="text-sm text-gray-600" style={customFontStyle}>
                          Prize per winner: {formatJackpotAmount(payout.prizePerWinner)} VMF
                  </p>
                </div>
                <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600" style={customFontStyle}>
                            Processed
                          </span>
                        </div>
                        <p className="text-xs text-gray-500" style={customFontStyle}>
                          {payout.winners.length} winners
                        </p>
                      </div>
                    </div>
                  </div>
                ))
                  )}
                </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
