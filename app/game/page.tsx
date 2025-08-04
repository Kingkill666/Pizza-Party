"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Users, Coins, Handshake, Check, ExternalLink, AlertCircle, X, Clock, Gift, Copy, Share } from "lucide-react"
import { useVMFBalance } from "@/hooks/useVMFBalance"
import { useWallet } from "@/hooks/useWallet"
import { WALLETS, isMobile } from "@/lib/wallet-config"
import { calculateCommunityJackpot, formatJackpotAmount } from "@/lib/jackpot-data"

export default function GamePage() {
  const customFontStyle = {
    fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkduster", "Kalam", "Caveat", cursive',
    fontWeight: "bold" as const,
  }

  // Pizza sauce bubble font - the thick, rounded, inflated style
  const pizzaSauceFontStyle = {
    fontFamily: '"Fredoka One", "Bungee", "Lilita One", "Chewy", "Bubblegum Sans", "Righteous", "Bowlby One", cursive',
    fontWeight: "400" as const, // These fonts are naturally very bold
  }

  const [playerCount, setPlayerCount] = useState(0) // Start at 0 - no one has played yet
  const [communityJackpot, setCommunityJackpot] = useState(0) // Use community jackpot instead of hardcoded
  const [hasEntered, setHasEntered] = useState(false)
  const [hasEnteredToday, setHasEnteredToday] = useState(false) // Track if wallet entered today
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReferralRewardModal, setShowReferralRewardModal] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [referralLink, setReferralLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [referralStats, setReferralStats] = useState({
    totalAllowed: 3, // Each player gets 3 invites total
    used: 1, // Already created 1 referral code
    remaining: 2, // 2 invites left to send
    joined: 0, // No one has joined using referral codes yet
  })
  const [toppingsEarned, setToppingsEarned] = useState(0) // Start with 0 toppings
  const [incomingReferralCode, setIncomingReferralCode] = useState<string | null>(null)
  const [deviceIsMobile, setDeviceIsMobile] = useState(false)

  // Daily game window countdown
  const [timeLeftInWindow, setTimeLeftInWindow] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showVMFModal, setShowVMFModal] = useState(false)
  const {
    connection,
    isConnecting,
    error: walletError,
    connectWallet,
    disconnect,
    isConnected,
    formattedAddress,
  } = useWallet()
  const { balance, formattedBalance, isLoading: vmfLoading, hasMinimum } = useVMFBalance()

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

  // Function to get next 12pm PST (start of next game window)
  const getNext12pmPST = () => {
    const now = new Date()

    // Convert current time to PST (UTC-8)
    const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const pstTime = new Date(utc + pstOffset * 60000)

    // Get today at 12pm PST
    const today12pm = new Date(pstTime)
    today12pm.setHours(12, 0, 0, 0)

    // If it's already past 12pm PST today, get tomorrow at 12pm PST
    if (pstTime.getHours() >= 12) {
      today12pm.setDate(today12pm.getDate() + 1)
    }

    return today12pm
  }

  // Calculate time remaining in current 24-hour game window
  const calculateTimeLeftInWindow = () => {
    const now = new Date()
    const pstOffset = -8 * 60 // PST is UTC-8
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const pstTime = new Date(utc + pstOffset * 60000)

    const next12pm = getNext12pmPST()
    const difference = next12pm.getTime() - pstTime.getTime()

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return { hours, minutes, seconds }
    }

    return { hours: 0, minutes: 0, seconds: 0 }
  }

  // Generate unique referral code
  const generateReferralCode = () => {
    console.log(`🔧 generateReferralCode called - connection?.address: ${connection?.address}`)
    
    if (!connection?.address) {
      console.log("❌ No wallet connected for referral code generation")
      return ""
    }

    console.log(`✅ Wallet address found: ${connection.address}`)

    // Validate wallet address before generating code
    if (!validateWalletAddress(connection.address)) {
      console.error("❌ Invalid wallet address for referral code generation")
      return ""
    }

    console.log(`✅ Wallet address validated successfully`)

    // Use wallet address in the referral code generation for uniqueness
    const walletSuffix = connection.address.slice(-6).toUpperCase()
    const timestamp = Date.now().toString(36).toUpperCase()
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    const generatedCode = `PIZZA${walletSuffix}${timestamp}${randomStr}`
    
    console.log(`🔧 Generated referral code: ${generatedCode} (length: ${generatedCode.length})`)
    console.log(`🔧 Components: PIZZA + ${walletSuffix} + ${timestamp} + ${randomStr}`)
    
    // Validate the generated code
    if (!validateReferralCode(generatedCode)) {
      console.error("❌ Generated referral code failed validation")
      console.error(`❌ Code: "${generatedCode}", Length: ${generatedCode.length}`)
      return ""
    }
    
    console.log(`✅ Referral code validated successfully: ${generatedCode}`)
    return generatedCode
  }

  // Process referral code usage
  const processReferralCode = (referralCode: string, newUserAddress: string) => {
    // Validate inputs
    if (!referralCode || !newUserAddress) {
      console.error("Invalid referral code or user address")
      return false
    }

    // Sanitize inputs
    const sanitizedCode = sanitizeInput(referralCode)
    const sanitizedAddress = sanitizeInput(newUserAddress)

    // Validate referral code format
    if (!validateReferralCode(sanitizedCode)) {
      console.error("Invalid referral code format")
      return false
    }

    // Validate user address
    if (!validateWalletAddress(sanitizedAddress)) {
      console.error("Invalid user address")
      return false
    }

    console.log(`🎁 Processing referral code: ${sanitizedCode} for new user: ${sanitizedAddress}`)

    // Find who owns this referral code (in a real app, this would be a database lookup)
    // For now, we'll simulate finding the referrer
    const referrerAddress = findReferrerByCode(sanitizedCode)

    if (referrerAddress) {
      // Award 2 toppings to the referrer
      awardToppingsToReferrer(referrerAddress, 2, sanitizedCode)

      // Mark this referral as successful
      markReferralAsUsed(sanitizedCode, sanitizedAddress, referrerAddress)

      console.log(`✅ Referral processed! ${referrerAddress} earned 2 toppings`)
      return true
    }

    console.log(`❌ Referral code ${sanitizedCode} not found`)
    return false
  }

  // Find referrer by referral code (simulate database lookup)
  const findReferrerByCode = (code: string): string | null => {
    // In a real app, this would query a database
    // For demo purposes, we'll simulate this
    const storedReferrals = JSON.parse(localStorage.getItem("pizza_referral_codes") || "{}")
    return storedReferrals[code] || null
  }

  // Award toppings to referrer
  const awardToppingsToReferrer = (referrerAddress: string, toppings: number, referralCode: string) => {
    // Store the toppings award
    const toppingsKey = `pizza_toppings_${referrerAddress}`
    const currentToppings = Number.parseInt(localStorage.getItem(toppingsKey) || "0")
    const newToppings = currentToppings + toppings
    localStorage.setItem(toppingsKey, newToppings.toString())

    // Store referral success record
    const referralSuccessKey = `pizza_referral_success_${referrerAddress}`
    const successRecord = JSON.parse(localStorage.getItem(referralSuccessKey) || "[]")
    successRecord.push({
      code: referralCode,
      toppings: toppings,
      timestamp: Date.now(),
      date: new Date().toISOString(),
    })
    localStorage.setItem(referralSuccessKey, JSON.stringify(successRecord))

    console.log(`🍕 Awarded ${toppings} toppings to ${referrerAddress}. Total: ${newToppings}`)

    // Update community jackpot
    setCommunityJackpot(calculateCommunityJackpot())
  }

  // Mark referral as used
  const markReferralAsUsed = (referralCode: string, newUserAddress: string, referrerAddress: string) => {
    const usedReferralsKey = `pizza_used_referrals_${referralCode}`
    const usedReferrals = JSON.parse(localStorage.getItem(usedReferralsKey) || "[]")
    usedReferrals.push({
      user: newUserAddress,
      referrer: referrerAddress,
      timestamp: Date.now(),
      date: new Date().toISOString(),
    })
    localStorage.setItem(usedReferralsKey, JSON.stringify(usedReferrals))

    console.log(`📝 Marked referral code ${referralCode} as used by ${newUserAddress}`)
  }

  // Check if user has already used a referral code
  const hasUsedReferralCode = (userAddress: string): boolean => {
    const allUsedReferrals = JSON.parse(localStorage.getItem("pizza_all_used_referrals") || "[]")
    return allUsedReferrals.some((ref: any) => ref.user === userAddress)
  }

  // Store referral code in localStorage
  const storeReferralCode = (code: string, ownerAddress: string) => {
    const storedReferrals = JSON.parse(localStorage.getItem("pizza_referral_codes") || "{}")
    storedReferrals[code] = ownerAddress
    localStorage.setItem("pizza_referral_codes", JSON.stringify(storedReferrals))
    console.log(`💾 Stored referral code ${code} for ${ownerAddress}`)
  }

  // Load user's toppings from localStorage
  const loadUserToppings = (userAddress: string): number => {
    const toppingsKey = `pizza_toppings_${userAddress}`
    const toppings = Number.parseInt(localStorage.getItem(toppingsKey) || "0")
    console.log(`🍕 Loaded ${toppings} toppings for ${userAddress}`)
    return toppings
  }

  // Load referral stats for a user
  const loadReferralStats = (userAddress: string) => {
    const stats = {
      totalAllowed: 3,
      used: 0,
      remaining: 3,
      joined: 0,
    }

    // Count successful referrals
    const referralSuccessKey = `pizza_referral_success_${userAddress}`
    const successRecord = JSON.parse(localStorage.getItem(referralSuccessKey) || "[]")
    stats.joined = successRecord.length

    // Calculate remaining invites
    stats.used = Math.min(stats.joined, stats.totalAllowed)
    stats.remaining = Math.max(0, stats.totalAllowed - stats.used)

    console.log(`📊 Referral stats for ${userAddress}:`, stats)
    return stats
  }

  // Load community jackpot from localStorage
  const loadCommunityJackpot = () => {
    const jackpot = calculateCommunityJackpot()
    setCommunityJackpot(jackpot)
    console.log(`💰 Community jackpot: ${jackpot}`)
  }

  // Get today's player count from localStorage
  const getTodaysPlayerCount = (): number => {
    const today = new Date().toDateString()
    const entries = Object.keys(localStorage).filter(key => 
      key.startsWith(`pizza_entry_`) && key.includes(today)
    )
    const count = entries.length
    console.log(`👥 Today's player count: ${count}`)
    return count
  }

  // Detect mobile device
  useEffect(() => {
    setDeviceIsMobile(isMobile())
  }, [])

  // Detect referral code from URL on page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const refCode = urlParams.get("ref")

      if (refCode) {
        console.log(`🔗 Detected referral code in URL: ${refCode}`)
        setIncomingReferralCode(refCode)

        // Clean URL (remove ref parameter)
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
      }
    }
  }, [])

  // Handle wallet connection with referral processing
  useEffect(() => {
    if (isConnected && connection?.address && incomingReferralCode) {
      // Check if this user has already used a referral code
      if (!hasUsedReferralCode(connection.address)) {
        console.log(`🎯 Processing referral for new user: ${connection.address}`)

        // Process the referral code
        const success = processReferralCode(incomingReferralCode, connection.address)

        if (success) {
          // Show success modal
          setShowReferralRewardModal(true)
        }
      } else {
        console.log(`⚠️ User ${connection.address} has already used a referral code`)
      }

      // Clear the incoming referral code
      setIncomingReferralCode(null)
    }
  }, [isConnected, connection?.address, incomingReferralCode])

  // Load user data when wallet connects
  useEffect(() => {
    if (isConnected && connection?.address) {
      // Load user's toppings - should be 0 for new users
      const userToppings = loadUserToppings(connection.address)
      setToppingsEarned(userToppings)

      // Load user's referral stats
      const userStats = loadReferralStats(connection.address)
      setReferralStats(userStats)

      console.log(`👤 Loaded user data: ${userToppings} toppings, ${userStats.joined} referrals`)
    } else {
      // COMPLETE RESET when wallet disconnects
      console.log("🔌 Wallet disconnected - resetting all user state")

      setToppingsEarned(0)
      setReferralStats({
        totalAllowed: 3,
        used: 0,
        remaining: 3,
        joined: 0,
      })
      setReferralCode("")
      setReferralLink("")
      setHasEnteredToday(false)
      setHasEntered(false)
      setCopied(false)

      // Close any open modals
      setShowInviteModal(false)
      setShowShareModal(false)
      setShowReferralRewardModal(false)
      setShowVMFModal(false)

      console.log("✅ All user state reset")
    }
  }, [isConnected, connection?.address])

  // Load community jackpot on mount and refresh periodically
  useEffect(() => {
    // Load immediately
    loadCommunityJackpot()

    // Refresh every 5 seconds to catch updates
    const interval = setInterval(loadCommunityJackpot, 5000)

    return () => clearInterval(interval)
  }, [])

  // Load real player count on mount and refresh periodically
  useEffect(() => {
    const loadPlayerCount = () => {
      const realCount = getTodaysPlayerCount()
      setPlayerCount(realCount)
      console.log(`📊 Real player count for today: ${realCount}`)
    }

    // Load immediately
    loadPlayerCount()

    // Refresh every 5 seconds to catch updates
    const interval = setInterval(loadPlayerCount, 5000)

    return () => clearInterval(interval)
  }, [])

  // Update daily game window countdown every second
  useEffect(() => {
    const updateTimer = () => {
      setTimeLeftInWindow(calculateTimeLeftInWindow())
    }

    // Update immediately
    updateTimer()

    // Then update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  // Check if wallet has already entered today (simulate with localStorage)
  useEffect(() => {
    if (isConnected && connection?.address) {
      const today = new Date().toDateString()
      const entryKey = `pizza_entry_${connection.address}_${today}`
      const hasEntered = localStorage.getItem(entryKey) === "true"
      setHasEnteredToday(hasEntered)
    }
  }, [isConnected, connection?.address])

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Generate referral code on component mount
  useEffect(() => {
    console.log(`🔄 useEffect triggered - isConnected: ${isConnected}, address: ${connection?.address}`)
    
    if (isConnected && connection?.address) {
      console.log(`✅ Wallet connected, generating referral code for: ${connection.address}`)
      
      // Generate referral code only when wallet is connected
      let code = generateReferralCode()
      console.log(`🎯 Generated code: "${code}"`)
      
      // Fallback if generation fails
      if (!code) {
        console.log("⚠️ Primary code generation failed, using fallback")
        const walletSuffix = connection.address.slice(-6).toUpperCase()
        const timestamp = Date.now().toString(36).toUpperCase()
        code = `PIZZA${walletSuffix}${timestamp}`
        console.log(`🔄 Fallback code generated: ${code}`)
      }
      
      if (code) {
        setReferralCode(code)
        const link = `${window.location.origin}?ref=${code}`
        setReferralLink(link)
        console.log(`🔗 Set referral link: ${link}`)

        // Store this referral code tied to the connected wallet
        storeReferralCode(code, connection.address)
      } else {
        console.error("❌ Failed to generate referral code even with fallback")
        setReferralCode("ERROR")
        setReferralLink("")
      }
    } else {
      console.log("❌ Wallet not connected, clearing referral data")
      // Clear referral data when wallet is disconnected
      setReferralCode("")
      setReferralLink("")
    }
  }, [isConnected, connection?.address])

  // Input validation functions
  const validateWalletAddress = (address: string): boolean => {
    if (!address) return false
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false
    return true
  }

  const validateReferralCode = (code: string): boolean => {
    if (!code) return true // Empty code is valid
    if (code.length < 3 || code.length > 50) return false // Increased max length to 50
    if (!/^[a-zA-Z0-9_-]+$/.test(code)) return false
    return true
  }

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>\"'&]/g, '')
  }

  const validateVMFAmount = (amount: number): boolean => {
    if (amount < 0) return false
    if (amount > 1000000) return false // Reasonable upper limit
    return true
  }

  const handleEnterGame = () => {
    // Validate wallet connection
    if (!isConnected) {
      setShowWalletModal(true)
      return
    }

    // Validate wallet address
    if (!connection?.address || !validateWalletAddress(connection.address)) {
      console.error("Invalid wallet address")
      return
    }

    // Validate VMF balance
    if (!hasMinimum(1)) {
      setShowVMFModal(true)
      return
    }

    // Validate VMF amount
    if (!validateVMFAmount(balance)) {
      console.error("Invalid VMF balance")
      return
    }

    // Check if wallet has already entered today
    if (hasEnteredToday) {
      return // Button should be disabled, but extra check
    }

    // Validate referral code if provided
    if (incomingReferralCode && !validateReferralCode(incomingReferralCode)) {
      console.error("Invalid referral code format")
      return
    }

    // Sanitize inputs before processing
    const sanitizedAddress = sanitizeInput(connection.address)
    const sanitizedReferralCode = incomingReferralCode ? sanitizeInput(incomingReferralCode) : ""

    // User has wallet connected, sufficient VMF, and hasn't entered today
    setHasEntered(true)
    setHasEnteredToday(true)
    setPlayerCount((prev) => prev + 1)

    // Store entry in localStorage with sanitized data
    const today = new Date().toDateString()
    const entryKey = `pizza_entry_${sanitizedAddress}_${today}`
    localStorage.setItem(entryKey, "true")

    // Update player count immediately
    setPlayerCount((prev) => prev + 1)
  }

  const handleWalletConnect = async (walletId: string) => {
    try {
      await connectWallet(walletId)
      setShowWalletModal(false)
    } catch (error) {
      console.error("Connection failed:", error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const handleInviteClick = () => {
    if (!isConnected) {
      setShowWalletModal(true)
      return
    }
    
    // Debug: Force regenerate referral code
    console.log("🔧 Manual referral code regeneration triggered")
    const code = generateReferralCode()
    console.log(`🎯 Manual generation result: "${code}"`)
    
    setShowInviteModal(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
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
            {/* MASSIVE Pizza Party Title - Exact copy from homepage */}
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
            {/* Toppings Display */}
            {isConnected && toppingsEarned > 0 && (
              <div className="bg-orange-100 p-4 rounded-xl border-2 border-orange-200 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-orange-600" />
                  <p className="font-semibold text-orange-800 text-center" style={customFontStyle}>
                    Your Toppings for Weekly Jackpot
                  </p>
                </div>
                <div className="flex justify-center items-center gap-1 flex-wrap mb-2">
                  {[...Array(Math.min(toppingsEarned, 20))].map((_, i) => (
                    <Image
                      key={i}
                      src="/images/pepperoni-art.png"
                      alt="Pepperoni"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  ))}
                  {toppingsEarned > 20 && (
                    <span className="text-orange-800 font-bold" style={customFontStyle}>
                      +{toppingsEarned - 20} more
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-orange-800 text-center" style={customFontStyle}>
                  {toppingsEarned} Toppings
                </p>
              </div>
            )}

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
                  VMF Jackpot
                </p>
                <p className="text-xl font-bold text-green-800" style={customFontStyle}>
                  {formatJackpotAmount(communityJackpot)}
                </p>
              </div>
            </div>

            {/* Entry Status Alert */}
            {isConnected && hasEnteredToday && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-yellow-600" />
                  <p className="font-semibold text-yellow-800" style={customFontStyle}>
                    Already Entered Today!
                  </p>
                </div>
                <p className="text-sm text-yellow-700" style={customFontStyle}>
                  Your wallet has already entered today's game. You can enter again when the next game starts at 12pm
                  PST.
                </p>
              </div>
            )}

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

              {/* Clickable slice areas */}
              <svg viewBox="0 0 288 288" className="absolute top-0 left-0 w-full h-full">
                {[...Array(8)].map((_, i) => {
                  const angle = i * 45 - 90
                  const nextAngle = (i + 1) * 45 - 90
                  const centerX = 144
                  const centerY = 144
                  const radius = 120
                  const isSelected = false

                  return (
                    <path
                      key={i}
                      d={`M ${centerX} ${centerY} L ${centerX + radius * Math.cos((angle * Math.PI) / 180)} ${centerY + radius * Math.sin((angle * Math.PI) / 180)} A ${radius} ${radius} 0 0 1 ${centerX + radius * Math.cos((nextAngle * Math.PI) / 180)} ${centerY + radius * Math.sin((nextAngle * Math.PI) / 180)} Z`}
                      fill={isSelected ? "rgba(252, 165, 165, 0.5)" : "transparent"}
                      stroke="transparent"
                      strokeWidth="2"
                      className="cursor-default"
                    />
                  )
                })}
              </svg>
            </div>

            {/* Entry Section */}
            <div className="text-center">
              {!hasEnteredToday ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <Button
                    onClick={handleEnterGame}
                    disabled={hasEnteredToday}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-xl border-4 border-green-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      ...customFontStyle,
                      letterSpacing: "1px",
                      fontSize: "1.25rem",
                    }}
                  >
                    <Image
                      src="/images/star-favicon-original.png"
                      alt="Star"
                      width={24}
                      height={24}
                      className="inline mr-2 rounded-full"
                    />
                    ENTER GAME $1 VMF
                    <Image
                      src="/images/star-favicon-original.png"
                      alt="Star"
                      width={24}
                      height={24}
                      className="inline ml-2 rounded-full"
                    />
                  </Button>

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

                  {/* Invites Button */}
                  <Button
                    onClick={handleInviteClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-blue-800 shadow-lg transform hover:scale-105 transition-all"
                    style={{
                      ...customFontStyle,
                      letterSpacing: "1px",
                      fontSize: "1.25rem",
                    }}
                  >
                    <Handshake className="mr-2 h-5 w-5" />
                    {isConnected && connection?.address
                      ? `Invites ${referralStats.remaining}/${referralStats.totalAllowed}`
                      : "Connect Wallet to Invite"}
                    <Handshake className="ml-2 h-5 w-5" />
                  </Button>

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
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div
                    className="w-full bg-green-100 text-green-800 text-lg px-4 py-2 rounded-xl border-2 border-green-300 text-center"
                    style={customFontStyle}
                  >
                    🍕 You're in! Good Luck! 🍕
                  </div>

                  <div
                    className="w-full bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded-xl border-2 border-blue-300 text-center"
                    style={customFontStyle}
                  >
                    ⏰ Next entry available when new game starts at 12pm PST
                  </div>

                  {/* Weekly Jackpot Button - also show when entered */}
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

                  {/* Invites Button - also show when entered */}
                  <Button
                    onClick={handleInviteClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-blue-800 shadow-lg transform hover:scale-105 transition-all"
                    style={{
                      ...customFontStyle,
                      letterSpacing: "1px",
                      fontSize: "1.25rem",
                    }}
                  >
                    <Handshake className="mr-2 h-5 w-5" />
                    {isConnected && connection?.address
                      ? `Invites ${referralStats.remaining}/${referralStats.totalAllowed}`
                      : "Connect Wallet to Invite"}
                    <Handshake className="ml-2 h-5 w-5" />
                  </Button>

                  {/* Game Rules Section */}
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection Modal */}
        <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
          <DialogContent className="max-w-xl mx-auto bg-white border-4 border-red-800 rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-red-800 text-center" style={customFontStyle}>
                🍕 Connect Your Wallet 🍕
              </DialogTitle>
              <p className="text-center text-gray-600 mt-2" style={customFontStyle}>
                {deviceIsMobile
                  ? "Choose your wallet to connect"
                  : "Choose your preferred wallet to connect to Pizza Party"}
              </p>
            </DialogHeader>

            <div className="space-y-4 p-4 max-h-[70vh] overflow-y-auto">
              {/* Error Display with Mobile Instructions */}
              {walletError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-bold text-sm" style={customFontStyle}>
                      Connection Failed
                    </p>
                    <div className="text-red-700 text-xs mt-1 whitespace-pre-line" style={customFontStyle}>
                      {walletError}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Mobile-specific instructions */}
              {deviceIsMobile && (
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-2" style={customFontStyle}>
                    📱 Mobile Connection Tips
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-700" style={customFontStyle}>
                    <li>• Open your wallet app first</li>
                    <li>• Use the browser inside your wallet app</li>
                    <li>• Visit this page from within the wallet</li>
                    <li>• Then try connecting</li>
                  </ul>
                  <div className="mt-3 p-2 bg-white rounded border">
                    <p className="text-xs text-gray-600 mb-1" style={customFontStyle}>
                      Current URL to copy:
                    </p>
                    <p className="text-xs font-mono text-gray-800 break-all">
                      {typeof window !== "undefined" ? window.location.href : ""}
                    </p>
                  </div>
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
                      {!deviceIsMobile && (
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
                  <li>• Check your VMF token balance</li>
                  <li>• Play Pizza Party games</li>
                  <li>• Earn rewards and toppings</li>
                  <li>• Participate in daily & weekly jackpots</li>
                  <li>• Track your game history</li>
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

        {/* Invite Friends Modal */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="max-w-md mx-auto bg-white border-4 border-red-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl text-red-800 text-center" style={customFontStyle}>
                🍕 Invite Friends to Pizza Party! 🍕
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 p-4">
              {/* Your Referral Stats */}
              <div className="bg-blue-100 p-4 rounded-xl border-2 border-blue-300">
                <h3 className="text-lg font-bold text-blue-800 mb-2" style={customFontStyle}>
                  Your Referral Stats
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600" style={customFontStyle}>
                      {referralStats.used}
                    </div>
                    <div className="text-sm text-blue-700" style={customFontStyle}>
                      Used
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600" style={customFontStyle}>
                      {referralStats.joined}
                    </div>
                    <div className="text-sm text-green-700" style={customFontStyle}>
                      Joined
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600" style={customFontStyle}>
                      {referralStats.remaining}
                    </div>
                    <div className="text-sm text-orange-700" style={customFontStyle}>
                      Remaining
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Referral Code */}
              <div className="bg-yellow-100 p-4 rounded-xl border-2 border-yellow-300">
                <h3 className="text-lg font-bold text-yellow-800 mb-2" style={customFontStyle}>
                  Your Referral Code
                </h3>
                <div className="bg-white p-3 rounded-lg border border-yellow-400">
                  <p className="text-lg font-mono font-bold text-center text-gray-800" style={customFontStyle}>
                    {referralCode || "Loading..."}
                  </p>
                </div>
              </div>

              {/* Share Your Link */}
              <div className="bg-green-100 p-4 rounded-xl border-2 border-green-300">
                <h3 className="text-lg font-bold text-green-800 mb-2" style={customFontStyle}>
                  Share Your Link
                </h3>
                <div className="bg-white p-3 rounded-lg border border-green-400 mb-3">
                  <p className="text-xs font-mono text-gray-800 break-all" style={customFontStyle}>
                    {referralLink || "Loading..."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                    style={customFontStyle}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={shareLink}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    style={customFontStyle}
                  >
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Referral Rewards */}
              <div className="bg-purple-100 p-4 rounded-xl border-2 border-purple-300">
                <h3 className="text-lg font-bold text-purple-800 mb-2 flex items-center" style={customFontStyle}>
                  🎁 Referral Rewards
                </h3>
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
                  <ExternalLink className="h-4 w-4" />
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

        {/* Other modals continue here... */}
      </div>
    </div>
  )
}
