// Payout system for Pizza Party dApp

export interface PayoutEntry {
  id: string
  walletAddress: string
  amount: number
  type: "daily" | "weekly" | "referral"
  status: "pending" | "completed" | "failed"
  transactionHash?: string
  createdAt: Date
  completedAt?: Date
  gameDate?: string // For daily payouts
  weekNumber?: number // For weekly payouts
}

export interface PayoutStats {
  totalPaid: number
  totalPending: number
  totalFailed: number
  dailyPayouts: number
  weeklyPayouts: number
  referralPayouts: number
}

// Generate unique payout ID
export const generatePayoutId = (): string => {
  return `payout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Create a new payout entry
export const createPayoutEntry = (
  walletAddress: string,
  amount: number,
  type: "daily" | "weekly" | "referral",
  gameDate?: string,
  weekNumber?: number,
): PayoutEntry => {
  return {
    id: generatePayoutId(),
    walletAddress,
    amount,
    type,
    status: "pending",
    createdAt: new Date(),
    gameDate,
    weekNumber,
  }
}

// Store payout entry in localStorage (in production, this would be a database)
export const storePayoutEntry = (payout: PayoutEntry): void => {
  if (typeof window === "undefined") return

  const payoutsKey = "pizza_payouts"
  const existingPayouts = JSON.parse(localStorage.getItem(payoutsKey) || "[]")
  existingPayouts.push(payout)
  localStorage.setItem(payoutsKey, JSON.stringify(existingPayouts))

  console.log(`💰 Stored payout entry: ${payout.id} for ${payout.amount} VMF`)
}

// Get all payout entries
export const getAllPayouts = (): PayoutEntry[] => {
  if (typeof window === "undefined") return []

  const payoutsKey = "pizza_payouts"
  const payouts = JSON.parse(localStorage.getItem(payoutsKey) || "[]")

  // Convert date strings back to Date objects
  return payouts.map((payout: any) => ({
    ...payout,
    createdAt: new Date(payout.createdAt),
    completedAt: payout.completedAt ? new Date(payout.completedAt) : undefined,
  }))
}

// Get payouts for a specific wallet
export const getWalletPayouts = (walletAddress: string): PayoutEntry[] => {
  return getAllPayouts().filter((payout) => payout.walletAddress.toLowerCase() === walletAddress.toLowerCase())
}

// Update payout status
export const updatePayoutStatus = (
  payoutId: string,
  status: "completed" | "failed",
  transactionHash?: string,
): void => {
  if (typeof window === "undefined") return

  const payoutsKey = "pizza_payouts"
  const payouts = getAllPayouts()

  const payoutIndex = payouts.findIndex((p) => p.id === payoutId)
  if (payoutIndex === -1) return

  payouts[payoutIndex].status = status
  payouts[payoutIndex].completedAt = new Date()
  if (transactionHash) {
    payouts[payoutIndex].transactionHash = transactionHash
  }

  localStorage.setItem(payoutsKey, JSON.stringify(payouts))
  console.log(`💰 Updated payout ${payoutId} status to ${status}`)
}

// Calculate payout statistics
export const calculatePayoutStats = (): PayoutStats => {
  const payouts = getAllPayouts()

  const stats: PayoutStats = {
    totalPaid: 0,
    totalPending: 0,
    totalFailed: 0,
    dailyPayouts: 0,
    weeklyPayouts: 0,
    referralPayouts: 0,
  }

  payouts.forEach((payout) => {
    switch (payout.status) {
      case "completed":
        stats.totalPaid += payout.amount
        break
      case "pending":
        stats.totalPending += payout.amount
        break
      case "failed":
        stats.totalFailed += payout.amount
        break
    }

    switch (payout.type) {
      case "daily":
        stats.dailyPayouts += payout.amount
        break
      case "weekly":
        stats.weeklyPayouts += payout.amount
        break
      case "referral":
        stats.referralPayouts += payout.amount
        break
    }
  })

  return stats
}

// Process daily game payouts (8 winners split the jackpot)
export const processDailyPayouts = (jackpotAmount: number, gameDate: string): PayoutEntry[] => {
  if (typeof window === "undefined") return []

  // Get all players who entered today's game
  const today = gameDate || new Date().toDateString()
  const players: string[] = []
  const keys = Object.keys(localStorage)

  keys.forEach((key) => {
    if (key.startsWith("pizza_entry_") && key.endsWith(`_${today}`)) {
      if (localStorage.getItem(key) === "true") {
        // Extract wallet address from key
        const address = key.replace("pizza_entry_", "").replace(`_${today}`, "")
        players.push(address)
      }
    }
  })

  if (players.length === 0) {
    console.log("No players found for daily payout")
    return []
  }

  // Select 8 random winners (or all players if less than 8)
  const numWinners = Math.min(8, players.length)
  const winners: string[] = []
  const playersCopy = [...players]

  for (let i = 0; i < numWinners; i++) {
    const randomIndex = Math.floor(Math.random() * playersCopy.length)
    winners.push(playersCopy.splice(randomIndex, 1)[0])
  }

  // Calculate payout per winner
  const payoutPerWinner = Math.floor(jackpotAmount / numWinners)
  const payouts: PayoutEntry[] = []

  winners.forEach((winner) => {
    const payout = createPayoutEntry(winner, payoutPerWinner, "daily", gameDate)
    storePayoutEntry(payout)
    payouts.push(payout)
  })

  console.log(`🎉 Created ${numWinners} daily payouts of ${payoutPerWinner} VMF each`)
  return payouts
}

// Process weekly jackpot payout (single winner takes all)
export const processWeeklyPayout = (jackpotAmount: number, weekNumber: number): PayoutEntry | null => {
  if (typeof window === "undefined") return null

  // Get all players with toppings
  const players: { address: string; toppings: number }[] = []
  const keys = Object.keys(localStorage)

  keys.forEach((key) => {
    if (key.startsWith("pizza_toppings_")) {
      const toppings = Number.parseInt(localStorage.getItem(key) || "0")
      if (toppings > 0) {
        const address = key.replace("pizza_toppings_", "")
        players.push({ address, toppings })
      }
    }
  })

  if (players.length === 0) {
    console.log("No players with toppings found for weekly payout")
    return null
  }

  // Select winner based on weighted random selection
  const totalWeight = players.reduce((sum, player) => sum + player.toppings, 0)
  const random = Math.random() * totalWeight

  let currentWeight = 0
  let winner: string | null = null

  for (const player of players) {
    currentWeight += player.toppings
    if (random <= currentWeight) {
      winner = player.address
      break
    }
  }

  if (!winner) {
    winner = players[players.length - 1].address // Fallback
  }

  const payout = createPayoutEntry(winner, jackpotAmount, "weekly", undefined, weekNumber)
  storePayoutEntry(payout)

  console.log(`🏆 Created weekly payout of ${jackpotAmount} VMF for ${winner}`)
  return payout
}

// Process referral payout (when someone uses a referral code)
export const processReferralPayout = (referrerAddress: string, amount: number): PayoutEntry => {
  const payout = createPayoutEntry(referrerAddress, amount, "referral")
  storePayoutEntry(payout)

  console.log(`🤝 Created referral payout of ${amount} VMF for ${referrerAddress}`)
  return payout
}

// Get pending payouts for processing
export const getPendingPayouts = (): PayoutEntry[] => {
  return getAllPayouts().filter((payout) => payout.status === "pending")
}

// Clear all payout data (admin function)
export const clearAllPayouts = (): void => {
  if (typeof window === "undefined") return

  localStorage.removeItem("pizza_payouts")
  console.log("🗑️ Cleared all payout data")
}

// Export payout data as JSON (for backup/analysis)
export const exportPayoutData = (): string => {
  const payouts = getAllPayouts()
  const stats = calculatePayoutStats()

  return JSON.stringify(
    {
      payouts,
      stats,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  )
}
