// Jackpot calculation and data utilities

// Calculate community jackpot based on total toppings claimed (in VMF)
export const calculateCommunityJackpot = (): number => {
  if (typeof window === "undefined") return 0 // Default for SSR

  // Get total toppings from all sources
  const totalToppings = getTotalToppingsClaimed()
  
  // Convert toppings to VMF (1 topping = 1 VMF)
  return totalToppings
}

// Get total toppings claimed across all players
export const getTotalToppingsClaimed = (): number => {
  if (typeof window === "undefined") return 0

  const keys = Object.keys(localStorage)
  let totalToppings = 0

  keys.forEach((key) => {
    // Count all earned toppings that have been claimed
    if (key.startsWith("pizza_toppings_")) {
      const toppings = Number.parseInt(localStorage.getItem(key) || "0")
      totalToppings += toppings
    }
    
    // Count daily play entries (1 topping per day played)
    if (key.startsWith("pizza_entry_")) {
      const today = new Date().toDateString()
      if (key.includes(today) && localStorage.getItem(key) === "true") {
        totalToppings += 1 // 1 topping for daily play
      }
    }

    // Count referral success records (2 toppings per referral)
    if (key.startsWith("pizza_referral_success_")) {
      const successRecord = JSON.parse(localStorage.getItem(key) || "[]")
      const referralToppings = successRecord.length * 2 // 2 toppings per referral
      totalToppings += referralToppings
    }

          // Count VMF holdings (3 toppings per 10 VMF)
      if (key.startsWith("pizza_vmf_holdings_")) {
        const vmfAmount = Number.parseInt(localStorage.getItem(key) || "0")
        const vmfToppings = Math.floor(vmfAmount / 10) * 3 // 3 toppings per 10 VMF
        totalToppings += vmfToppings
      }

    
  })

  return totalToppings
}

// Format jackpot amount for display
export const formatJackpotAmount = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toLocaleString()
}

// Get real weekly jackpot information with actual data
export const getWeeklyJackpotInfo = () => {
  // Calculate time until next Sunday at 12pm PST
  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Find next Sunday at 12pm PST
  const nextSunday = new Date(pstTime)
  const daysUntilSunday = (7 - pstTime.getDay()) % 7
  if (daysUntilSunday === 0 && pstTime.getHours() >= 12) {
    // If it's Sunday and past 12pm, go to next Sunday
    nextSunday.setDate(nextSunday.getDate() + 7)
  } else {
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)
  }
  nextSunday.setHours(12, 0, 0, 0)

  // Calculate time difference
  const difference = nextSunday.getTime() - pstTime.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  // Calculate real toppings and players from actual game data
  let totalToppings = 0
  let totalPlayers = 0
  const uniquePlayers = new Set()

  if (typeof window !== "undefined") {
    const keys = Object.keys(localStorage)
    const today = new Date().toDateString()

    // Count real data from all sources
    keys.forEach((key) => {
      // Daily play entries (1 topping per day played)
      if (key.startsWith("pizza_entry_")) {
        if (key.includes(today) && localStorage.getItem(key) === "true") {
          totalToppings += 1 // 1 topping for daily play
          const address = key.replace("pizza_entry_", "").replace(`_${today}`, "")
          uniquePlayers.add(address)
        }
      }

      // Referral success records (2 toppings per referral)
      if (key.startsWith("pizza_referral_success_")) {
        const address = key.replace("pizza_referral_success_", "")
        const successRecord = JSON.parse(localStorage.getItem(key) || "[]")
        const referralToppings = successRecord.length * 2 // 2 toppings per referral
        totalToppings += referralToppings
        uniquePlayers.add(address)
      }

      // VMF holdings (1 topping per 10 VMF - simulated for now)
      if (key.startsWith("pizza_vmf_holdings_")) {
        const address = key.replace("pizza_vmf_holdings_", "")
        const vmfAmount = Number.parseInt(localStorage.getItem(key) || "0")
        const vmfToppings = Math.floor(vmfAmount / 10) // 1 topping per 10 VMF
        totalToppings += vmfToppings
        uniquePlayers.add(address)
      }

      // Streak bonuses (3 toppings for 7-day streak)
      if (key.startsWith("pizza_streak_")) {
        const address = key.replace("pizza_streak_", "")
        const streakDays = Number.parseInt(localStorage.getItem(key) || "0")
        if (streakDays >= 7) {
          totalToppings += 3 // 3 toppings for 7-day streak
        }
        uniquePlayers.add(address)
      }

      // Legacy toppings storage (for backward compatibility)
      if (key.startsWith("pizza_toppings_")) {
        const toppings = Number.parseInt(localStorage.getItem(key) || "0")
        if (toppings > 0) {
          totalToppings += toppings
          const address = key.replace("pizza_toppings_", "")
          uniquePlayers.add(address)
        }
      }
    })

    totalPlayers = uniquePlayers.size
  }

  return {
    totalToppings,
    totalPlayers,
    timeUntilDraw: {
      days: Math.max(0, days),
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds),
    },
  }
}

// Get real daily player count
export const getDailyPlayerCount = (): number => {
  if (typeof window === "undefined") return 0

  const today = new Date().toDateString()
  const keys = Object.keys(localStorage)
  let count = 0

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(today) && localStorage.getItem(key) === "true") {
      count++
    }
  })

  return count
}

// Get real weekly player count (unique players who played this week)
export const getWeeklyPlayerCount = (): number => {
  if (typeof window === "undefined") return 0

  const keys = Object.keys(localStorage)
  const uniquePlayers = new Set()

  // Get the start of the current week (Monday 12pm PST)
  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Find the most recent Monday at 12pm PST
  const currentWeekStart = new Date(pstTime)
  const daysSinceMonday = (pstTime.getDay() + 6) % 7 // Monday = 0, Sunday = 6
  currentWeekStart.setDate(currentWeekStart.getDate() - daysSinceMonday)
  currentWeekStart.setHours(12, 0, 0, 0)

  // If we're before Monday 12pm PST, go back to previous Monday
  if (pstTime < currentWeekStart) {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7)
  }

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_")) {
      // Extract date from key (format: pizza_entry_address_date)
      const parts = key.split("_")
      if (parts.length >= 3) {
        const dateString = parts.slice(2).join("_") // Rejoin in case date has underscores
        const entryDate = new Date(dateString)
        
        // Only count entries from this week (since Monday 12pm PST)
        if (entryDate >= currentWeekStart) {
          const address = parts[1]
      uniquePlayers.add(address)
        }
      }
    }
  })

  return uniquePlayers.size
}

// Get real toppings available to claim
export const getToppingsAvailableToClaim = (): number => {
  if (typeof window === "undefined") return 0

  const keys = Object.keys(localStorage)
  let totalToppings = 0

  keys.forEach((key) => {
    // Count all earned toppings that haven't been claimed yet
    if (key.startsWith("pizza_toppings_")) {
      const toppings = Number.parseInt(localStorage.getItem(key) || "0")
      totalToppings += toppings
    }
  })

  return totalToppings
}

// Get user's claimable toppings for a specific address (only when wallet is connected)
export const getUserClaimableToppings = (userAddress: string, isWalletConnected: boolean = false): number => {
  if (typeof window === "undefined" || !userAddress || !isWalletConnected) return 0

  let totalToppings = 0

  // Check for user's toppings in localStorage
  const toppingsKey = `pizza_toppings_${userAddress.toLowerCase()}`
  const storedToppings = Number.parseInt(localStorage.getItem(toppingsKey) || "0")
  totalToppings += storedToppings

  // Check for daily play entries (1 topping per day played)
  const today = new Date().toDateString()
  const entryKey = `pizza_entry_${userAddress.toLowerCase()}_${today}`
  if (localStorage.getItem(entryKey) === "true") {
    totalToppings += 1 // 1 topping for today's play
  }

  // Check for referral success records (2 toppings per referral)
  const referralKey = `pizza_referral_success_${userAddress.toLowerCase()}`
  const referralRecord = localStorage.getItem(referralKey)
  if (referralRecord) {
    try {
      const successRecord = JSON.parse(referralRecord)
      const referralToppings = successRecord.length * 2 // 2 toppings per referral
      totalToppings += referralToppings
    } catch (error) {
      console.error("Error parsing referral record:", error)
    }
  }

  // Check for VMF holdings (3 toppings per 10 VMF)
  const vmfKey = `pizza_vmf_holdings_${userAddress.toLowerCase()}`
  const vmfAmount = Number.parseInt(localStorage.getItem(vmfKey) || "0")
  const vmfToppings = Math.floor(vmfAmount / 10) * 3 // 3 toppings per 10 VMF
  totalToppings += vmfToppings



  return totalToppings
}

// Earn toppings for daily play (only when wallet is connected)
export const earnDailyPlayToppings = (userAddress: string, isWalletConnected: boolean): boolean => {
  if (typeof window === "undefined" || !userAddress || !isWalletConnected) return false

  const today = new Date().toDateString()
  const entryKey = `pizza_entry_${userAddress.toLowerCase()}_${today}`
  
  // Check if already played today
  if (localStorage.getItem(entryKey) === "true") {
    return false // Already earned today
  }

  // Mark as played and earn 1 topping
  localStorage.setItem(entryKey, "true")
  
  // Add 1 topping to user's balance
  const toppingsKey = `pizza_toppings_${userAddress.toLowerCase()}`
  const currentToppings = Number.parseInt(localStorage.getItem(toppingsKey) || "0")
  localStorage.setItem(toppingsKey, (currentToppings + 1).toString())
  
  console.log(`🍕 Earned 1 topping for daily play: ${userAddress}`)
  return true
}

// Earn toppings for referrals (only when wallet is connected)
export const earnReferralToppings = (userAddress: string, isWalletConnected: boolean, referralCount: number): boolean => {
  if (typeof window === "undefined" || !userAddress || !isWalletConnected) return false

  const referralKey = `pizza_referral_success_${userAddress.toLowerCase()}`
  const existingReferrals = JSON.parse(localStorage.getItem(referralKey) || "[]")
  
  // Add new referrals
  const newReferrals = Array.from({ length: referralCount }, (_, i) => `referral_${Date.now()}_${i}`)
  const updatedReferrals = [...existingReferrals, ...newReferrals]
  localStorage.setItem(referralKey, JSON.stringify(updatedReferrals))
  
  // Earn 2 toppings per referral
  const earnedToppings = referralCount * 2
  const toppingsKey = `pizza_toppings_${userAddress.toLowerCase()}`
  const currentToppings = Number.parseInt(localStorage.getItem(toppingsKey) || "0")
  localStorage.setItem(toppingsKey, (currentToppings + earnedToppings).toString())
  
  console.log(`👥 Earned ${earnedToppings} toppings for ${referralCount} referrals: ${userAddress}`)
  return true
}

// Earn toppings for VMF holdings (only when wallet is connected)
export const earnVMFHoldingsToppings = (userAddress: string, isWalletConnected: boolean, vmfAmount: number): boolean => {
  if (typeof window === "undefined" || !userAddress || !isWalletConnected) return false

  const vmfKey = `pizza_vmf_holdings_${userAddress.toLowerCase()}`
  localStorage.setItem(vmfKey, vmfAmount.toString())
  
  // Calculate toppings: 3 toppings per 10 VMF
  const earnedToppings = Math.floor(vmfAmount / 10) * 3
  
  if (earnedToppings > 0) {
    const toppingsKey = `pizza_toppings_${userAddress.toLowerCase()}`
    const currentToppings = Number.parseInt(localStorage.getItem(toppingsKey) || "0")
    localStorage.setItem(toppingsKey, (currentToppings + earnedToppings).toString())
    
    console.log(`💰 Earned ${earnedToppings} toppings for ${vmfAmount} VMF holdings: ${userAddress}`)
  }
  
  return true
}

// Check if toppings can be claimed (only between Sunday 12pm PST and Monday 12pm PST)
export const canClaimToppings = (): boolean => {
  if (typeof window === "undefined") return false

  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = pstTime.getDay()
  const currentHour = pstTime.getHours()

  // Can claim from Sunday 12pm PST (day 0, hour 12+) to Monday 12pm PST (day 1, hour < 12)
  if (dayOfWeek === 0 && currentHour >= 12) {
    return true // Sunday 12pm PST or later
  } else if (dayOfWeek === 1 && currentHour < 12) {
    return true // Monday before 12pm PST
  }

  return false
}

// Get time until next claiming window
export const getTimeUntilClaimingWindow = () => {
  if (typeof window === "undefined") return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Find next Sunday at 12pm PST
  const nextSunday = new Date(pstTime)
  const daysUntilSunday = (7 - pstTime.getDay()) % 7
  if (daysUntilSunday === 0 && pstTime.getHours() >= 12) {
    // If it's Sunday and past 12pm, go to next Sunday
    nextSunday.setDate(nextSunday.getDate() + 7)
  } else {
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday)
  }
  nextSunday.setHours(12, 0, 0, 0)

  // Calculate time difference
  const difference = nextSunday.getTime() - pstTime.getTime()
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  return {
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  }
}

// Check if it's time for daily jackpot draw (every day at 12pm PST)
export const isDailyJackpotTime = (): boolean => {
  if (typeof window === "undefined") return false

  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Check if it's 12pm PST
  return pstTime.getHours() === 12 && pstTime.getMinutes() === 0
}

// Check if it's time for weekly jackpot draw (every Monday at 12pm PST)
export const isWeeklyJackpotTime = (): boolean => {
  if (typeof window === "undefined") return false

  const now = new Date()
  const pstOffset = -8 * 60 // PST is UTC-8 (in minutes)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const pstTime = new Date(utc + pstOffset * 60000)

  // Check if it's Monday at 12pm PST
  return pstTime.getDay() === 1 && pstTime.getHours() === 12 && pstTime.getMinutes() === 0
}

// Get daily jackpot amount (total VMF from today's players)
export const getDailyJackpotAmount = (): number => {
  if (typeof window === "undefined") return 0

  const today = new Date().toDateString()
  const keys = Object.keys(localStorage)
  let dailyPlayers = 0

  // Count today's players (each player pays $1 VMF)
  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(today) && localStorage.getItem(key) === "true") {
      dailyPlayers++
    }
  })

  // Each player pays $1 VMF, so daily jackpot = number of players
  return dailyPlayers
}

// Select daily jackpot winners (8 winners from today's players)
export const selectDailyJackpotWinners = (): string[] => {
  if (typeof window === "undefined") return []

  const players: { address: string; toppings: number }[] = []
  const keys = Object.keys(localStorage)
  const today = new Date().toDateString()

  // Collect all players who played today
  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(today)) {
      const address = key.replace("pizza_entry_", "").replace(`_${today}`, "")
      if (address) {
        // Get player's toppings for weighted selection
        const toppingsKey = `pizza_toppings_${address}`
        const toppings = Number.parseInt(localStorage.getItem(toppingsKey) || "1") // Minimum 1 topping for playing
        players.push({ address, toppings })
      }
    }
  })

  if (players.length === 0) return []

  // Create weighted selection based on toppings (more toppings = higher chance)
  const winners: string[] = []
  const maxWinners = Math.min(8, players.length) // Maximum 8 winners or all players if less than 8

  for (let i = 0; i < maxWinners; i++) {
    const totalWeight = players.reduce((sum, player) => sum + player.toppings, 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    let selectedIndex = -1

    for (let j = 0; j < players.length; j++) {
      currentWeight += players[j].toppings
      if (random <= currentWeight) {
        selectedIndex = j
        break
      }
    }

    if (selectedIndex !== -1) {
      winners.push(players[selectedIndex].address)
      // Remove selected player to avoid duplicates
      players.splice(selectedIndex, 1)
    }
  }

  return winners
}

// Select weekly jackpot winners (10 winners from all players with toppings)
export const selectWeeklyJackpotWinners = (): string[] => {
  if (typeof window === "undefined") return []

  const players: { address: string; toppings: number }[] = []
  const keys = Object.keys(localStorage)

  // Collect all players with toppings
  keys.forEach((key) => {
    if (key.startsWith("pizza_toppings_")) {
      const toppings = Number.parseInt(localStorage.getItem(key) || "0")
      if (toppings > 0) {
        const address = key.replace("pizza_toppings_", "")
        players.push({ address, toppings })
      }
    }
  })

  if (players.length === 0) return []

  // Create weighted selection based on toppings (more toppings = higher chance)
  const winners: string[] = []
  const maxWinners = Math.min(10, players.length) // Maximum 10 winners or all players if less than 10

  for (let i = 0; i < maxWinners; i++) {
  const totalWeight = players.reduce((sum, player) => sum + player.toppings, 0)
  const random = Math.random() * totalWeight

  let currentWeight = 0
    let selectedIndex = -1

    for (let j = 0; j < players.length; j++) {
      currentWeight += players[j].toppings
    if (random <= currentWeight) {
        selectedIndex = j
        break
      }
    }

    if (selectedIndex !== -1) {
      winners.push(players[selectedIndex].address)
      // Remove selected player to avoid duplicates
      players.splice(selectedIndex, 1)
    }
  }

  return winners
}

// Simulate daily jackpot VMF payment to 8 winners
export const payDailyJackpotWinners = async (winners: string[], dailyJackpotVMF: number): Promise<void> => {
  if (typeof window === "undefined") return

  const vmfPerWinner = Math.floor(dailyJackpotVMF / winners.length)
  
  console.log(`🏆 DAILY JACKPOT: Paying ${winners.length} winners ${vmfPerWinner} VMF each from total jackpot of ${dailyJackpotVMF} VMF`)
  console.log(`💰 VMF Contract Address: 0x2213414893259b0c48066acd1763e7fba97859e5`)
  
  winners.forEach((winner, index) => {
    console.log(`🎉 Daily Winner ${index + 1}: ${winner} receives ${vmfPerWinner} VMF`)
  })

  // In a real implementation, this would trigger smart contract calls to transfer VMF
  // For now, we'll simulate the payment
  return Promise.resolve()
}

// Simulate weekly jackpot VMF payment to 10 winners
export const payWeeklyJackpotWinners = async (winners: string[], totalVMF: number): Promise<void> => {
  if (typeof window === "undefined") return

  const vmfPerWinner = Math.floor(totalVMF / winners.length)
  
  console.log(`🏆 WEEKLY JACKPOT: Paying ${winners.length} winners ${vmfPerWinner} VMF each from total jackpot of ${totalVMF} VMF`)
  console.log(`💰 VMF Contract Address: 0x2213414893259b0c48066acd1763e7fba97859e5`)
  
  winners.forEach((winner, index) => {
    console.log(`🎉 Weekly Winner ${index + 1}: ${winner} receives ${vmfPerWinner} VMF`)
  })

  // In a real implementation, this would trigger smart contract calls to transfer VMF
  // For now, we'll simulate the payment
  return Promise.resolve()
}

// Reset weekly jackpot (called after winner selection)
export const resetWeeklyJackpot = (): void => {
  if (typeof window === "undefined") return

  const keys = Object.keys(localStorage)

  // Clear all toppings
  keys.forEach((key) => {
    if (key.startsWith("pizza_toppings_")) {
      localStorage.removeItem(key)
    }
  })

  // Clear referral stats (reset remaining invites)
  keys.forEach((key) => {
    if (key.startsWith("pizza_referrer_stats_")) {
      localStorage.setItem(
        key,
        JSON.stringify({
          totalAllowed: 3,
          used: 0,
          remaining: 3,
          joined: 0,
        }),
      )
    }
  })

  console.log("🏆 Weekly jackpot reset completed")
}

// Get real-time daily player count (wallets that have confirmed $1 VMF transactions today)
export const getRealTimeDailyPlayerCount = (): number => {
  if (typeof window === "undefined") return 0

  const keys = Object.keys(localStorage)
  const today = new Date().toDateString()
  const uniquePlayers = new Set()

  // Count players who have confirmed VMF transactions today
  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(today)) {
      const parts = key.split("_")
      if (parts.length >= 3) {
        const address = parts[1]
        // Only count if they have confirmed the transaction
        if (localStorage.getItem(key) === "true") {
          uniquePlayers.add(address)
        }
      }
    }
  })

  return uniquePlayers.size
}

// Get real-time VMF price from DEX (simulated for now)
export const getVMFPriceFromDEX = async (): Promise<number> => {
  // In a real implementation, this would fetch from Uniswap, PancakeSwap, or other DEXs
  // For now, we'll simulate a price that fluctuates around $1
  const basePrice = 1.0
  const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
  return Math.max(0.1, basePrice + variation) // Minimum $0.10
}

// Calculate real-time jackpot value in USD
export const getRealTimeJackpotValue = async (): Promise<number> => {
  if (typeof window === "undefined") return 0

  // Get total VMF entered today
  const dailyPlayers = getRealTimeDailyPlayerCount()
  const totalVMFEntered = dailyPlayers // Each player pays 1 VMF

  // Get current VMF price from DEX
  const vmfPrice = await getVMFPriceFromDEX()

  // Calculate jackpot value: total VMF × current VMF price
  return totalVMFEntered * vmfPrice
}
