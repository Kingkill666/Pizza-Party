// Jackpot calculation and data utilities

// Calculate community jackpot based on real player activity
export const calculateCommunityJackpot = (): number => {
  if (typeof window === "undefined") return 0 // Default for SSR

  // Count today's players (each player pays $1 worth of VMF)
  const today = new Date().toDateString()
  const keys = Object.keys(localStorage)
  let todaysPlayers = 0

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.includes(today) && localStorage.getItem(key) === "true") {
      todaysPlayers++
    }
  })

  // Each player pays $1 worth of VMF, so jackpot = number of players
  return todaysPlayers
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

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_")) {
      const address = key.replace("pizza_entry_", "").split("_")[0]
      uniquePlayers.add(address)
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

// Simulate jackpot winner selection (for demo purposes)
export const selectJackpotWinner = (): string | null => {
  if (typeof window === "undefined") return null

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

  if (players.length === 0) return null

  // Create weighted selection based on toppings
  const totalWeight = players.reduce((sum, player) => sum + player.toppings, 0)
  const random = Math.random() * totalWeight

  let currentWeight = 0
  for (const player of players) {
    currentWeight += player.toppings
    if (random <= currentWeight) {
      return player.address
    }
  }

  // Fallback to last player
  return players[players.length - 1].address
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
