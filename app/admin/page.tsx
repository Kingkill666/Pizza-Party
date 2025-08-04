"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { ArrowLeft, Users, Coins, Clock, AlertTriangle, Check, X, Shield, Settings, Activity } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { useVMFBalance } from "@/hooks/useVMFBalance"
import { calculateCommunityJackpot, formatJackpotAmount, getWeeklyJackpotInfo } from "@/lib/jackpot-data"
import PayoutSystem from "@/components/PayoutSystem"

export default function AdminPage() {
  const customFontStyle = {
    fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
    fontWeight: "bold" as const,
  }

  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [emergencyAction, setEmergencyAction] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)
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
  const [securityStatus, setSecurityStatus] = useState({
    contractPaused: false,
    blacklistedAddresses: 0,
    suspiciousTransactions: 0,
    lastSecurityCheck: new Date(),
  })

  const { isConnected, connection } = useWallet()
  const { balance, formattedBalance, hasMinimum } = useVMFBalance()

  // Load admin data
  useEffect(() => {
    loadAdminData()
    const interval = setInterval(loadAdminData, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadAdminData = () => {
    // Load community jackpot
    const jackpot = calculateCommunityJackpot()
    setCommunityJackpot(jackpot)

    // Load weekly info
    const info = getWeeklyJackpotInfo()
    setWeeklyInfo(info)

    // Load security status
    loadSecurityStatus()
  }

  const loadSecurityStatus = () => {
    if (typeof window !== "undefined") {
      const paused = localStorage.getItem("pizza_contract_paused") === "true"
      const blacklisted = JSON.parse(localStorage.getItem("pizza_blacklisted_addresses") || "[]")
      const suspicious = JSON.parse(localStorage.getItem("pizza_suspicious_transactions") || "[]")

      setSecurityStatus({
        contractPaused: paused,
        blacklistedAddresses: blacklisted.length,
        suspiciousTransactions: suspicious.length,
        lastSecurityCheck: new Date(),
      })
    }
  }

  // Emergency pause/unpause contract
  const handleEmergencyPause = async (pause: boolean) => {
    if (!isConnected) {
      setAdminError("Wallet not connected")
      return
    }

    setIsProcessing(true)
    setAdminError(null)

    try {
      console.log(`🚨 ${pause ? "Pausing" : "Unpausing"} contract...`)
      
      // Simulate smart contract call
      if (typeof window !== "undefined") {
        localStorage.setItem("pizza_contract_paused", pause.toString())
      }
      
      setSecurityStatus(prev => ({
        ...prev,
        contractPaused: pause,
        lastSecurityCheck: new Date(),
      }))

      console.log(`✅ Contract ${pause ? "paused" : "unpaused"} successfully`)
      setShowEmergencyModal(false)
    } catch (error) {
      console.error("❌ Emergency action failed:", error)
      setAdminError(`Failed to ${pause ? "pause" : "unpause"} contract`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Blacklist/unblacklist address
  const handleBlacklistAddress = async (address: string, blacklist: boolean) => {
    if (!isConnected) {
      setAdminError("Wallet not connected")
      return
    }

    setIsProcessing(true)
    setAdminError(null)

    try {
      console.log(`🚫 ${blacklist ? "Blacklisting" : "Unblacklisting"} address: ${address}`)
      
      // Simulate smart contract call
      if (typeof window !== "undefined") {
        const blacklisted = JSON.parse(localStorage.getItem("pizza_blacklisted_addresses") || "[]")
        
        if (blacklist) {
          if (!blacklisted.includes(address)) {
            blacklisted.push(address)
          }
        } else {
          const index = blacklisted.indexOf(address)
          if (index > -1) {
            blacklisted.splice(index, 1)
          }
        }
        
        localStorage.setItem("pizza_blacklisted_addresses", JSON.stringify(blacklisted))
      }
      
      setSecurityStatus(prev => ({
        ...prev,
        blacklistedAddresses: prev.blacklistedAddresses + (blacklist ? 1 : -1),
        lastSecurityCheck: new Date(),
      }))

      console.log(`✅ Address ${blacklist ? "blacklisted" : "unblacklisted"} successfully`)
    } catch (error) {
      console.error("❌ Blacklist action failed:", error)
      setAdminError(`Failed to ${blacklist ? "blacklist" : "unblacklist"} address`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Emergency withdrawal
  const handleEmergencyWithdrawal = async () => {
    if (!isConnected) {
      setAdminError("Wallet not connected")
      return
    }

    setIsProcessing(true)
    setAdminError(null)

    try {
      console.log("🚨 Processing emergency withdrawal...")
      
      // Simulate smart contract call
      const currentJackpot = calculateCommunityJackpot()
      
      // Record withdrawal
      if (typeof window !== "undefined") {
        const withdrawals = JSON.parse(localStorage.getItem("pizza_emergency_withdrawals") || "[]")
        withdrawals.push({
          timestamp: Date.now(),
          amount: currentJackpot,
          admin: connection?.address,
        })
        localStorage.setItem("pizza_emergency_withdrawals", JSON.stringify(withdrawals))
      }

      console.log("✅ Emergency withdrawal processed successfully")
      setShowEmergencyModal(false)
    } catch (error) {
      console.error("❌ Emergency withdrawal failed:", error)
      setAdminError("Failed to process emergency withdrawal")
    } finally {
      setIsProcessing(false)
    }
  }

  // Get contract statistics
  const getContractStats = () => {
    if (typeof window === "undefined") return {}

    const keys = Object.keys(localStorage)
    let totalEntries = 0
    let totalToppings = 0
    let uniquePlayers = new Set()

    keys.forEach((key) => {
      if (key.startsWith("pizza_entry_")) {
        if (localStorage.getItem(key) === "true") {
          totalEntries++
          const address = key.replace("pizza_entry_", "").split("_")[0]
          uniquePlayers.add(address)
        }
      }
      if (key.startsWith("pizza_toppings_")) {
        const toppings = Number.parseInt(localStorage.getItem(key) || "0")
        totalToppings += toppings
      }
    })

    return {
      totalEntries,
      totalToppings,
      uniquePlayers: uniquePlayers.size,
    }
  }

  const contractStats = getContractStats()

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
      <div className="max-w-4xl mx-auto">
        <Card className="relative bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl mb-6">
          <CardHeader className="text-center pb-4">
            <div className="absolute top-4 left-4 z-10">
              <Link href="/">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-white hover:bg-gray-100 text-black border-2 border-gray-300 rounded-xl shadow-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <CardTitle className="text-4xl text-red-800 mb-2" style={customFontStyle}>
              🛡️ Admin Panel
            </CardTitle>
            <p className="text-lg text-gray-700" style={customFontStyle}>
              Smart Contract Management & Security
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Display */}
            {adminError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800 font-bold" style={customFontStyle}>
                    {adminError}
                  </p>
                </div>
              </div>
            )}

            {/* Contract Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-blue-600" style={customFontStyle}>
                  Total Entries
                </p>
                <p className="text-2xl font-bold text-blue-800" style={customFontStyle}>
                  {contractStats.totalEntries.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <Coins className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-green-600" style={customFontStyle}>
                  Total Toppings
                </p>
                <p className="text-2xl font-bold text-green-800" style={customFontStyle}>
                  {contractStats.totalToppings.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-purple-600" style={customFontStyle}>
                  Unique Players
                </p>
                <p className="text-2xl font-bold text-purple-800" style={customFontStyle}>
                  {contractStats.uniquePlayers.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-3" style={customFontStyle}>
                🛡️ Security Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl ${securityStatus.contractPaused ? "text-red-600" : "text-green-600"}`}>
                    {securityStatus.contractPaused ? "⏸️" : "▶️"}
                  </div>
                  <p className="text-sm font-bold" style={customFontStyle}>
                    Contract Status
                  </p>
                  <p className="text-xs text-gray-600" style={customFontStyle}>
                    {securityStatus.contractPaused ? "Paused" : "Active"}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-red-600">🚫</div>
                  <p className="text-sm font-bold" style={customFontStyle}>
                    Blacklisted
                  </p>
                  <p className="text-xs text-gray-600" style={customFontStyle}>
                    {securityStatus.blacklistedAddresses} addresses
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-orange-600">⚠️</div>
                  <p className="text-sm font-bold" style={customFontStyle}>
                    Suspicious
                  </p>
                  <p className="text-xs text-gray-600" style={customFontStyle}>
                    {securityStatus.suspiciousTransactions} transactions
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-blue-600">🕒</div>
                  <p className="text-sm font-bold" style={customFontStyle}>
                    Last Check
                  </p>
                  <p className="text-xs text-gray-600" style={customFontStyle}>
                    {securityStatus.lastSecurityCheck.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Emergency Controls */}
              <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                <h3 className="text-lg font-bold text-red-800 mb-3" style={customFontStyle}>
                  🚨 Emergency Controls
                </h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleEmergencyPause(!securityStatus.contractPaused)}
                    disabled={isProcessing || !isConnected}
                    className={`w-full ${
                      securityStatus.contractPaused
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white`}
                  >
                    {isProcessing ? "Processing..." : securityStatus.contractPaused ? "Unpause Contract" : "Pause Contract"}
                  </Button>
                  <Button
                    onClick={() => setShowEmergencyModal(true)}
                    disabled={isProcessing || !isConnected}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Emergency Withdrawal
                  </Button>
                </div>
              </div>

              {/* Security Controls */}
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3" style={customFontStyle}>
                  🛡️ Security Controls
                </h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowSecurityModal(true)}
                    disabled={isProcessing || !isConnected}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Manage Blacklist
                  </Button>
                  <Button
                    onClick={loadSecurityStatus}
                    disabled={isProcessing}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Refresh Security Status
                  </Button>
                </div>
              </div>
            </div>

            {/* Payout System */}
            <PayoutSystem />
          </CardContent>
        </Card>

        {/* Emergency Modal */}
        <Dialog open={showEmergencyModal} onOpenChange={setShowEmergencyModal}>
          <DialogContent className="max-w-md mx-auto bg-white border-4 border-red-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-800 text-center" style={customFontStyle}>
                🚨 Emergency Withdrawal
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                <p className="text-red-800 font-bold text-center" style={customFontStyle}>
                  ⚠️ WARNING ⚠️
                </p>
                <p className="text-red-700 text-sm text-center mt-2" style={customFontStyle}>
                  This will withdraw all VMF tokens from the contract to the admin wallet.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleEmergencyWithdrawal}
                  disabled={isProcessing}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isProcessing ? "Processing..." : "Confirm Withdrawal"}
                </Button>
                <Button
                  onClick={() => setShowEmergencyModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Security Modal */}
        <Dialog open={showSecurityModal} onOpenChange={setShowSecurityModal}>
          <DialogContent className="max-w-md mx-auto bg-white border-4 border-blue-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-800 text-center" style={customFontStyle}>
                🛡️ Blacklist Management
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="text-blue-800 text-sm text-center" style={customFontStyle}>
                  Enter an address to blacklist or unblacklist it from the game.
                </p>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="0x..."
                  className="w-full p-2 border-2 border-gray-300 rounded-lg"
                  onChange={(e) => setEmergencyAction(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBlacklistAddress(emergencyAction, true)}
                    disabled={isProcessing || !emergencyAction}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isProcessing ? "Processing..." : "Blacklist"}
                  </Button>
                  <Button
                    onClick={() => handleBlacklistAddress(emergencyAction, false)}
                    disabled={isProcessing || !emergencyAction}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isProcessing ? "Processing..." : "Unblacklist"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
