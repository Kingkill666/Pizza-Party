"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWallet } from '@/hooks/useWallet'
import { WALLETS, initMobileOptimizations, isMobile, isIOS, isAndroid, isFarcaster } from '@/lib/wallet-config'
import { createPizzaPartyContract } from '@/lib/contract-interactions'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Clock, Users, Coins, Copy, Share2, ExternalLink, UsersIcon, AlertCircle, X, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function GamePage() {
  const customFontStyle = {
    fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
    fontWeight: "bold" as const,
  }

  // Wallet connection state
  const { isConnected, connection, connectWallet, walletError, isConnecting, error, setError } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isFarcaster: false,
  })

  const [playerCount, setPlayerCount] = useState(0)
  const [jackpot, setJackpot] = useState(0)
  const [timeLeftInWindow, setTimeLeftInWindow] = useState({
    hours: 14,
    minutes: 53,
    seconds: 16,
  })
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [referralCode] = useState("PIZZA123ABC")
  const [referralLink] = useState("https://pizza.party/?ref=PIZZA123ABC")
  const [copied, setCopied] = useState(false)
  // Updated referral stats to be accurate: 1 Used, 0 Joined, 2 Remaining
  const [referralStats] = useState({ 
    used: 1,      // 1 code has been used
    joined: 0,    // 0 people actually joined (maybe they used code but didn't complete registration)
    remaining: 2, // 2 codes still available
    totalAllowed: 3 // Total codes per user
  })

  // Social media platforms for sharing
  const socialPlatforms = [
    {
      name: "X (Twitter)",
      icon: "𝕏",
      color: "bg-black hover:bg-gray-800",
      shareUrl: (url: string, text: string) =>
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "Facebook",
      icon: "📘",
      color: "bg-blue-600 hover:bg-blue-700",
      shareUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "Telegram",
      icon: "✈️",
      color: "bg-sky-500 hover:bg-sky-600",
      shareUrl: (url: string, text: string) =>
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
      name: "Discord",
      icon: "🎮",
      color: "bg-indigo-600 hover:bg-indigo-700",
      action: "copy", // Discord doesn't have direct web sharing
    },
    {
      name: "WhatsApp",
      icon: "💬",
      color: "bg-green-500 hover:bg-green-600",
      shareUrl: (url: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      name: "LinkedIn",
      icon: "💼",
      color: "bg-blue-700 hover:bg-blue-800",
      shareUrl: (url: string, text: string) =>
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Reddit",
      icon: "🤖",
      color: "bg-orange-600 hover:bg-orange-700",
      shareUrl: (url: string, text: string) =>
        `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    },
    {
      name: "Farcaster",
      icon: "🟣",
      color: "bg-purple-600 hover:bg-purple-700",
      shareUrl: (url: string, text: string) =>
        `https://warpcast.com/~/compose?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
  ]

  // Check if user has already entered today
  const checkDailyEntry = () => {
    if (!isConnected || !connection) return false
    
    const now = new Date()
    const pstOffset = -8
    const pstTime = new Date(now.getTime() + (pstOffset * 60 * 60 * 1000))
    const isBeforeNoonPST = pstTime.getHours() < 12
    const today = pstTime.toDateString()
    const yesterday = new Date(pstTime.getTime() - (24 * 60 * 60 * 1000)).toDateString()
    const gameDate = isBeforeNoonPST ? today : yesterday
    const entryKey = `pizza_entry_${connection.address}_${gameDate}`
    
    return localStorage.getItem(entryKey) === 'true'
  }

  // Handle game entry
  const handleEnterGame = async () => {
    if (!isConnected || !connection) {
      setShowWalletModal(true)
      return
    }

    if (checkDailyEntry()) {
      setGameError('You have already entered today! Come back tomorrow.')
      return
    }

    setIsProcessing(true)
    setGameError(null)
    setSuccess(null)

    try {
      // Create contract instance using window.ethereum as provider
      const contract = createPizzaPartyContract(window.ethereum)
      
      // Enter the daily game with 0.001 ETH
      const txHash = await contract.enterDailyGame('')
      
      // Mark as entered for today
      const now = new Date()
      const pstOffset = -8
      const pstTime = new Date(now.getTime() + (pstOffset * 60 * 60 * 1000))
      const isBeforeNoonPST = pstTime.getHours() < 12
      const today = pstTime.toDateString()
      const yesterday = new Date(pstTime.getTime() - (24 * 60 * 60 * 1000)).toDateString()
      const gameDate = isBeforeNoonPST ? today : yesterday
      const entryKey = `pizza_entry_${connection.address}_${gameDate}`
      localStorage.setItem(entryKey, 'true')
      
      setSuccess('Transaction submitted!')
      console.log('✅ Game entry successful:', txHash)
      
      // Update player count
      updatePlayerCount()
      
    } catch (error: any) {
      console.error('❌ Error entering game:', error)
      setGameError(error.message || 'Failed to enter game. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Update player count display
  const updatePlayerCount = async () => {
    try {
      console.log('🔄 Updating player count...')
      
      const now = new Date()
      const pstOffset = -8
      const pstTime = new Date(now.getTime() + (pstOffset * 60 * 60 * 1000))
      const isBeforeNoonPST = pstTime.getHours() < 12
      const today = pstTime.toDateString()
      const yesterday = new Date(pstTime.getTime() - (24 * 60 * 60 * 1000)).toDateString()
      const gameDate = isBeforeNoonPST ? today : yesterday
      const dailyKey = `daily_players_${gameDate}`
      const dailyPlayers = JSON.parse(localStorage.getItem(dailyKey) || '[]')
      const dailyCount = dailyPlayers.length
      console.log('📊 LocalStorage daily players:', dailyCount)
      console.log('📊 Daily key:', dailyKey)
      console.log('📊 Game date:', gameDate)

      let contractDailyCount = 0
      if (isConnected && connection && window.ethereum) {
        try {
          console.log('🔍 Attempting daily contract call...')
          const contract = createPizzaPartyContract(window.ethereum)
          contractDailyCount = await contract.getDailyPlayerCount()
          console.log('📊 Contract daily players:', contractDailyCount)
        } catch (contractError) {
          console.error('❌ Error reading daily players from contract:', contractError)
        }
      } else {
        console.log('🔍 Wallet not connected for daily contract call')
      }

      const dayOfWeek = pstTime.getDay()
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(pstTime.getTime() - (daysSinceMonday * 24 * 60 * 60 * 1000))
      weekStart.setHours(12, 0, 0, 0)
      const weeklyKey = `weekly_players_${weekStart.getTime()}`
      const weeklyPlayers = JSON.parse(localStorage.getItem(weeklyKey) || '[]')
      const weeklyCount = weeklyPlayers.length
      const totalEntriesKey = `total_entries_${gameDate}`
      const totalEntries = Number.parseInt(localStorage.getItem(totalEntriesKey) || '0')

      console.log('📊 Player Stats:', {
        dailyPlayers: dailyCount,
        weeklyPlayers: weeklyCount,
        contractDailyPlayers: contractDailyCount,
        totalEntries: totalEntries,
        gameDate: gameDate
      })

      const displayCount = (contractDailyCount && !isNaN(contractDailyCount) && contractDailyCount > 0)
        ? contractDailyCount
        : dailyCount
      console.log('📊 Final display count:', displayCount)
      setPlayerCount(displayCount)
    } catch (error) {
      console.error('❌ Error updating player count:', error)
    }
  }

  // Handle wallet connection
  const handleWalletConnect = async (walletId: string) => {
    try {
      await connectWallet(walletId)
      setShowWalletModal(false)
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  // Initialize mobile optimizations and device detection
  useEffect(() => {
    initMobileOptimizations()

    setDeviceInfo({
      isMobile: isMobile(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isFarcaster: isFarcaster(),
    })

    window.scrollTo(0, 0)
  }, [])

  // Initialize player count on mount
  useEffect(() => {
    const initializePlayerCount = async () => {
      await updatePlayerCount()
    }
    
    initializePlayerCount()
  }, [])

  // Update player count when wallet connects or changes
  useEffect(() => {
    if (isConnected && connection) {
      updatePlayerCount()
    }
  }, [isConnected, connection])

  // Auto-hide success/error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (gameError) {
      const timer = setTimeout(() => setGameError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [gameError])

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftInWindow(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
      } else {
          return { hours: 0, minutes: 0, seconds: 0 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const shareLink = async () => {
    setShowShareModal(true)
  }

  const handleSocialShare = async (platform: any) => {
    const shareText = "Join me on Pizza Party! 🍕 Play to win a slice of the pie!"

    if (platform.action === "copy") {
      // For platforms like Discord and Instagram that don't have direct web sharing
      await copyToClipboard()
      setShowShareModal(false)
      // You could show a toast here saying "Link copied! Paste it in Discord/Instagram"
    } else if (platform.shareUrl) {
      // Open the social media sharing URL
      const url = platform.shareUrl(referralLink, shareText)
      window.open(url, "_blank", "width=600,height=400")
      setShowShareModal(false)
    }
  }

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
      <div className="max-w-md mx-auto">
        <Card className="relative bg-white/90 backdrop-blur-sm border-4 border-red-800 rounded-3xl shadow-2xl mb-6">
          <CardHeader className="text-center pb-0">
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
            
            {/* MASSIVE Pizza Party Title */}
            <div className="mb-4">
              <div
                className="text-8xl font-black transform -rotate-3 drop-shadow-2xl"
                style={{
                  ...customFontStyle,
                  color: "#DC2626",
                  textShadow: "4px 4px 0px #991B1B, 8px 8px 0px #7F1D1D, 12px 12px 20px rgba(0,0,0,0.5)",
                  letterSpacing: "3px",
                  fontWeight: "900",
                  WebkitTextStroke: "2px #450A0A",
                  background: "linear-gradient(45deg, #DC2626, #EF4444, #F87171)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 6px #DC2626)",
                }}
              >
                PIZZA
              </div>
              <div style={{ height: "10px" }}></div>
              <div
                className="text-8xl font-black transform -rotate-3 drop-shadow-2xl"
                style={{
                  ...customFontStyle,
                  color: "#DC2626",
                  textShadow: "4px 4px 0px #991B1B, 8px 8px 0px #7F1D1D, 12px 12px 20px rgba(0,0,0,0.5)",
                  letterSpacing: "3px",
                  fontWeight: "900",
                  WebkitTextStroke: "2px #450A0A",
                  background: "linear-gradient(45deg, #DC2626, #EF4444, #F87171)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 6px #DC2626)",
                }}
              >
                PARTY
              </div>
            </div>
            
            <CardTitle className="text-4xl text-red-800" style={customFontStyle}>
              8 Slices, 8 Winners!
            </CardTitle>
            <p className="text-2xl text-gray-700 text-center" style={customFontStyle}>
              Jackpot split 8 ways!
            </p>
            <p className="text-2xl text-gray-700" style={customFontStyle}>
              Winners picked every 24 hrs!
            </p>
          </CardHeader>

          <CardContent className="p-6 pt-2">
            {/* Daily Game Window Countdown */}
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <p className="font-semibold text-blue-800 text-center" style={customFontStyle}>
                  Current Game Window Ends In:
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded">
                  <div className="text-xl font-bold text-blue-800" style={customFontStyle}>
                    {timeLeftInWindow.hours}
                  </div>
                  <div className="text-xs text-blue-600" style={customFontStyle}>
                    HRS
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-xl font-bold text-blue-800" style={customFontStyle}>
                    {timeLeftInWindow.minutes}
                  </div>
                  <div className="text-xs text-blue-600" style={customFontStyle}>
                    MIN
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-xl font-bold text-blue-800" style={customFontStyle}>
                    {timeLeftInWindow.seconds}
                  </div>
                  <div className="text-xs text-blue-600" style={customFontStyle}>
                    SEC
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-600 text-center mt-2" style={customFontStyle}>
                New game starts daily at 12pm PST
              </p>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-sm text-blue-600" style={customFontStyle}>
                  Players Today
                </p>
                <p className="text-xl font-bold text-blue-800" style={customFontStyle}>
                  {playerCount.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg text-center">
                <Coins className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-sm text-green-600" style={customFontStyle}>
                  Jackpot
                </p>
                <p className="text-xl font-bold text-green-800" style={customFontStyle}>
                  ${jackpot.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Pizza Game */}
            <div className="relative w-72 h-72 mx-auto mb-6">
              {/* Pizza Image */}
              <Image
                src="/images/pizza-final.png"
                alt="Delicious pizza with pepperoni, green peppers, and olives"
                width={288}
                height={288}
                className="w-full h-full object-contain drop-shadow-2xl"
                priority
              />

              {/* Slice Lines Overlay */}
              <svg viewBox="0 0 288 288" className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {/* 8 slice divider lines from center to edge */}
                {[...Array(8)].map((_, i) => {
                  const angle = i * 45 - 90 // Start from top and go clockwise
                  const centerX = 144
                  const centerY = 144
                  const radius = 120 // Adjust based on pizza size
                  const endX = centerX + radius * Math.cos((angle * Math.PI) / 180)
                  const endY = centerY + radius * Math.sin((angle * Math.PI) / 180)

                  return (
                    <line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={endX}
                      y2={endY}
                      stroke="#8B4513"
                      strokeWidth="3"
                      opacity="0.8"
                    />
                  )
                })}
              </svg>
            </div>

            {/* Entry Section */}
            <div className="text-center">
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-xl border-4 border-green-800 shadow-lg"
                    style={{
                      ...customFontStyle,
                      letterSpacing: "1px",
                      fontSize: "1.25rem",
                    }}
                  onClick={handleEnterGame}
                  disabled={isProcessing}
                  >
                    <Image
                      src="/images/star-favicon-original.png"
                      alt="Star"
                      width={24}
                      height={24}
                      className="inline mr-2 rounded-full"
                    />
                  {isProcessing ? 'Processing...' : 'ENTER GAME .001 Base Sepolia'}
                    <Image
                      src="/images/star-favicon-original.png"
                      alt="Star"
                      width={24}
                      height={24}
                      className="inline ml-2 rounded-full"
                    />
                  </Button>

                {/* Wallet Status Display */}
                {isConnected && connection && (
                  <div className="bg-green-100 border-2 border-green-300 rounded-xl p-3 text-center">
                    <p className="text-green-800 font-bold text-sm" style={customFontStyle}>
                      ✅ Connected to {connection.name || 'Wallet'} {connection.address?.slice(0, 6)}...{connection.address?.slice(-4)}
                      </p>
                    </div>
                )}

                {/* Weekly Jackpot Button */}
                  <Link href="/jackpot">
                    <Button
                      className="w-full bg-red-700 hover:bg-red-800 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-red-900 shadow-lg transform hover:scale-105 transition-all"
                      style={{
                        ...customFontStyle,
                        letterSpacing: "1px",
                        fontSize: "1.25rem",
                      }}
                    >
                      🏆 Weekly Jackpot 🏆
                    </Button>
                  </Link>

                {/* Invite Friends Button */}
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-blue-800 shadow-lg transform hover:scale-105 transition-all"
                  style={{ ...customFontStyle, letterSpacing: "1px", fontSize: "1.25rem" }}
                  onClick={() => {
                    if (!isConnected || !connection) {
                      setShowWalletModal(true)
                    } else {
                      setShowInviteModal(true)
                    }
                  }}
                >
                  <UsersIcon className="mr-2 h-5 w-5" />
                  Invite Friends
                  <UsersIcon className="ml-2 h-5 w-5" />
                  </Button>

                {/* Wallet Required Hint */}
                {!isConnected && (
                  <p className="text-xs text-gray-500 text-center mt-1" style={customFontStyle}>
                    💡 Connect wallet to invite friends
                  </p>
                )}

                {/* Game Rules */}
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-sm">🎯</span>
                      <p className="text-sm font-semibold text-gray-800" style={customFontStyle}>
                        Game Rules:
                      </p>
                    </div>
                    <ul className="space-y-1 text-xs text-gray-700" style={customFontStyle}>
                      <li>• One entry per wallet per day</li>
                      <li>• Equal chance for all players</li>
                      <li>• New game starts daily at 12pm PST</li>
                    </ul>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Invite Friends Modal */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="max-w-md mx-auto bg-white border-4 border-blue-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl text-blue-800 text-center" style={customFontStyle}>
                🎉 Invite Friends to Pizza Party! 🎉
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              {/* Referral Stats */}
              <div className="bg-blue-100 p-4 rounded-xl border-2 border-blue-300">
                <h3 className="text-lg font-bold text-blue-800 mb-2" style={customFontStyle}>
                  Your Referral Stats
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600" style={customFontStyle}>{referralStats.used}</div>
                    <div className="text-sm text-blue-700" style={customFontStyle}>Used</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600" style={customFontStyle}>{referralStats.joined}</div>
                    <div className="text-sm text-green-700" style={customFontStyle}>Joined</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600" style={customFontStyle}>{referralStats.remaining}</div>
                    <div className="text-sm text-orange-700" style={customFontStyle}>Remaining</div>
                  </div>
                </div>
              </div>

              {/* Referral Code */}
              <div className="bg-yellow-100 p-4 rounded-xl border-2 border-yellow-300">
                <h3 className="text-lg font-bold text-yellow-800 mb-2" style={customFontStyle}>Your Referral Code</h3>
                <div className="bg-white p-3 rounded-lg border border-yellow-400">
                  <p className="text-lg font-mono font-bold text-center text-gray-800" style={customFontStyle}>{referralCode}</p>
                </div>
              </div>

              {/* Share Link */}
              <div className="bg-green-100 p-4 rounded-xl border-2 border-green-300">
                <h3 className="text-lg font-bold text-green-800 mb-2" style={customFontStyle}>Share Your Link</h3>
                <div className="bg-white p-3 rounded-lg border border-green-400 mb-3">
                  <p className="text-xs font-mono text-gray-800 break-all" style={customFontStyle}>{referralLink}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg" style={customFontStyle}>
                    <Copy className="mr-2 h-4 w-4" />Copy Link
                  </Button>
                  <Button onClick={shareLink} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" style={customFontStyle}>
                    <Share2 className="mr-2 h-4 w-4" />Share
                  </Button>
                </div>
                {copied && (
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 text-center mt-2">
                    <p className="text-green-800 font-bold" style={customFontStyle}>✅ Link copied to clipboard!</p>
                  </div>
                )}
              </div>

              {/* Referral Rewards */}
              <div className="bg-purple-100 p-4 rounded-xl border-2 border-purple-300">
                <h3 className="text-lg font-bold text-purple-800 mb-2 flex items-center" style={customFontStyle}>🎁 Referral Rewards</h3>
                <ul className="space-y-1 text-sm text-purple-700" style={customFontStyle}>
                  <li>• 2 Toppings per successful referral</li>
                  <li>• Higher jackpot chances</li>
                  <li>• Toppings count toward weekly drawing</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Modal */}
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent className="max-w-md mx-auto bg-white border-4 border-red-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl text-red-800 text-center" style={customFontStyle}>
                🍕 Share on Social Media 🍕
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 p-4">
              <p className="text-center text-gray-600" style={customFontStyle}>
                Choose where you'd like to share your referral link.
              </p>

              <div className="space-y-3">
                {/* X (Twitter) */}
                <Button
                  onClick={() => handleSocialShare({ 
                    action: "share", 
                    name: "X (Twitter)",
                    shareUrl: (link: string, text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`
                  })}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-between"
                  style={customFontStyle}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">𝕏</span>
                    <span>X (Twitter)</span>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>

                {/* Facebook */}
                <Button
                  onClick={() => handleSocialShare({ 
                    action: "share", 
                    name: "Facebook",
                    shareUrl: (link: string, text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
                  })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-between"
                  style={customFontStyle}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">f</span>
                    <span>Facebook</span>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>

                {/* Telegram */}
                <Button
                  onClick={() => handleSocialShare({ 
                    action: "share", 
                    name: "Telegram",
                    shareUrl: (link: string, text: string) => `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
                  })}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-between"
                  style={customFontStyle}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">✈️</span>
                    <span>Telegram</span>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>

                {/* Discord */}
                <Button
                  onClick={() => handleSocialShare({ action: "copy", name: "Discord" })}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-between"
                  style={customFontStyle}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🎮</span>
                    <span>Discord</span>
                  </div>
                  <Copy className="h-4 w-4" />
                </Button>

                {/* WhatsApp */}
                <Button
                  onClick={() => handleSocialShare({ 
                    action: "share", 
                    name: "WhatsApp",
                    shareUrl: (link: string, text: string) => `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`
                  })}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-between"
                  style={customFontStyle}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">💬</span>
                    <span>WhatsApp</span>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>

                {/* Farcaster */}
                <Button
                  onClick={() => handleSocialShare({ 
                    action: "share", 
                    name: "Farcaster",
                    shareUrl: (link: string, text: string) => `https://warpcast.com/~/compose?text=${encodeURIComponent(`${text} ${link}`)}`
                  })}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-between"
                  style={customFontStyle}
                >
                  <div className="flex items-center">
                    <Image
                      src="/images/farcaster-icon.png"
                      alt="Farcaster"
                      width={20}
                      height={20}
                      className="mr-3"
                    />
                    <span>Farcaster</span>
                  </div>
                  <ExternalLink className="h-4 w-4" />
                </Button>

                {/* Copy Link */}
                <Button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-between"
                  style={customFontStyle}
                >
                  <div className="flex items-center">
                    <Copy className="h-5 w-5 mr-3" />
                    <span>Copy Link</span>
                  </div>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {copied && (
                <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-bold" style={customFontStyle}>
                    ✅ Link copied to clipboard!
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Error/Success Messages */}
        {gameError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border-2 border-red-300 rounded-lg p-4 max-w-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-bold" style={customFontStyle}>
                {gameError}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border-2 border-green-300 rounded-lg p-4 max-w-md">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 text-green-600">✅</div>
              <p className="text-green-800 font-bold" style={customFontStyle}>
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Wallet Connection Modal */}
        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="max-w-xl mx-auto bg-white border-4 border-red-800 rounded-3xl max-h-[90vh] overflow-y-auto m-2">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl text-red-800 text-center" style={customFontStyle}>
                🍕 Connect Your Wallet 🍕
              </DialogTitle>
              <p className="text-center text-gray-600 mt-2 text-sm" style={customFontStyle}>
                {deviceInfo.isMobile
                  ? "Choose your wallet to connect"
                  : "Choose your preferred wallet to connect to Pizza Party"}
              </p>
            </DialogHeader>

            <div className="space-y-3 p-4 max-h-[70vh] overflow-y-auto">
              {/* Error Display with Mobile Instructions */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-bold text-sm" style={customFontStyle}>
                      Connection Failed
                    </p>
                    <div className="text-red-700 text-xs mt-1 whitespace-pre-line" style={customFontStyle}>
                      {error}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Show all wallets on both mobile and desktop */}
              {WALLETS.map((wallet) => (
                <Button
                  key={wallet.id}
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={isConnecting === wallet.id}
                  className={`w-full p-4 sm:p-4 rounded-xl border-2 border-gray-200 text-white font-bold text-left flex items-center justify-between hover:scale-105 transition-all min-h-[60px] sm:min-h-[70px] touch-manipulation ${wallet.color}`}
                  style={customFontStyle}
                >
                  <div className="flex items-center flex-1 min-w-0 pr-4">
                    {wallet.iconImage ? (
                      <Image
                        src={wallet.iconImage || "/placeholder.svg"}
                        alt={`${wallet.name} icon`}
                        width={24}
                        height={24}
                        className="w-6 h-6 sm:w-6 sm:h-6 mr-3 sm:mr-3 flex-shrink-0 rounded"
                      />
                    ) : (
                      <span className="text-2xl sm:text-2xl mr-3 sm:mr-3 flex-shrink-0">{wallet.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-lg sm:text-lg font-bold mb-1 sm:mb-1">{wallet.name}</div>
                      {/* Only show description on desktop */}
                      {!deviceInfo.isMobile && (
                        <div className="text-xs sm:text-xs opacity-90 leading-relaxed whitespace-normal">
                          {wallet.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isConnecting === wallet.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    ) : (
                      <ExternalLink className="h-4 w-4 sm:h-4 sm:w-4" />
                    )}
                  </div>
                </Button>
              ))}

              {/* Info Section */}
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200 mt-6">
                <h3 className="text-lg font-bold text-blue-800 mb-2" style={customFontStyle}>
                  🔒 Why Connect Your Wallet?
                </h3>
                <ul className="space-y-1 text-sm text-blue-700" style={customFontStyle}>
                  <li>• Earn VMF tokens and toppings</li>
                  <li>• Participate in daily & weekly jackpots</li>
                  <li>• Track your game history</li>
                  <li>• Secure and decentralized</li>
                </ul>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-200">
                <p className="text-xs text-yellow-800 text-center" style={customFontStyle}>
                  🛡️ Your wallet connection is secure and encrypted. We never store your private keys.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
