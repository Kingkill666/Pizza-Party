// Jackpot data and timer logic for Pizza Party game

// Get next Monday at 12pm PST
function getNextMondayAt12PM(): Date {
  const now = new Date()
  
  // Convert to PST (UTC-8)
  const pstOffset = -8 * 60 // PST is UTC-8
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const pstTime = new Date(utc + (pstOffset * 60000))
  
  const currentDay = pstTime.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysUntilMonday = currentDay === 1 ? 7 : (8 - currentDay) % 7 // If today is Monday, get next Monday
  
  const nextMonday = new Date(pstTime)
  nextMonday.setDate(pstTime.getDate() + daysUntilMonday)
  nextMonday.setHours(12, 0, 0, 0) // 12pm PST
  
  // If it's already past 12pm on Monday, get next Monday
  if (currentDay === 1 && pstTime.getHours() >= 12) {
    nextMonday.setDate(nextMonday.getDate() + 7)
  }
  
  // Convert back to local time for display
  const localTime = new Date(nextMonday.getTime() - (pstOffset * 60000) - (now.getTimezoneOffset() * 60000))
  
  return localTime
}

// Get next Sunday at 12pm PST (for claiming window)
function getNextSundayAt12PM(): Date {
  const now = new Date()
  
  // Convert to PST (UTC-8)
  const pstOffset = -8 * 60 // PST is UTC-8
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const pstTime = new Date(utc + (pstOffset * 60000))
  
  const currentDay = pstTime.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay // If today is Sunday, get next Sunday
  
  const nextSunday = new Date(pstTime)
  nextSunday.setDate(pstTime.getDate() + daysUntilSunday)
  nextSunday.setHours(12, 0, 0, 0) // 12pm PST
  
  // If it's already past 12pm on Sunday, get next Sunday
  if (currentDay === 0 && pstTime.getHours() >= 12) {
    nextSunday.setDate(nextSunday.getDate() + 7)
  }
  
  // Convert back to local time for display
  const localTime = new Date(nextSunday.getTime() - (pstOffset * 60000) - (now.getTimezoneOffset() * 60000))
  
  return localTime
}

// Calculate time until next draw
function calculateTimeUntilDraw(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const nextDraw = getNextMondayAt12PM()
  const timeDiff = nextDraw.getTime() - now.getTime()
  
  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds }
}

// Check if it's time for weekly jackpot draw (Monday 12pm PST)
function checkWeeklyJackpotTime(): boolean {
  const now = new Date()
  const nextDraw = getNextMondayAt12PM()
  const timeDiff = nextDraw.getTime() - now.getTime()
  
  // Consider it time if within 1 minute of draw time
  return timeDiff <= 60000 && timeDiff > 0
}

// Check if it's time for daily jackpot draw
function checkDailyJackpotTime(): boolean {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Daily draw happens at 12pm PST every day
  return currentHour === 12 && currentMinute === 0
}

// Get time until claiming window (Sunday 12pm PST to Monday 12pm PST)
function calculateTimeUntilClaimingWindow(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date()
  
  // Convert to PST (UTC-8)
  const pstOffset = -8 * 60 // PST is UTC-8
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const pstTime = new Date(utc + (pstOffset * 60000))
  
  const currentDay = pstTime.getDay()
  const currentHour = pstTime.getHours()
  
  let nextClaimingStart: Date
  
  if (currentDay === 0 && currentHour >= 12) {
    // It's Sunday after 12pm, next claiming is next Sunday
    nextClaimingStart = new Date(pstTime)
    nextClaimingStart.setDate(pstTime.getDate() + 7)
    nextClaimingStart.setHours(12, 0, 0, 0)
  } else if (currentDay === 1 && currentHour < 12) {
    // It's Monday before 12pm, claiming is still open
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  } else {
    // Get next Sunday at 12pm
    nextClaimingStart = getNextSundayAt12PM()
  }
  
  const timeDiff = nextClaimingStart.getTime() - now.getTime()
  
  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
  
  return { days, hours, minutes, seconds }
}

// Check if toppings can be claimed (Sunday 12pm PST to Monday 12pm PST)
function checkCanClaimToppings(): boolean {
  const now = new Date()
  
  // Convert to PST (UTC-8)
  const pstOffset = -8 * 60 // PST is UTC-8
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const pstTime = new Date(utc + (pstOffset * 60000))
  
  const currentDay = pstTime.getDay()
  const currentHour = pstTime.getHours()
  
  // Claiming window: Sunday 12pm PST to Monday 12pm PST
  return (currentDay === 0 && currentHour >= 12) || (currentDay === 1 && currentHour < 12)
}

// Simulated data functions
export function calculateCommunityJackpot(): number {
  return 0 // No community jackpot since no players
}

export function formatJackpotAmount(amount: number): string {
  return amount.toLocaleString()
}

export function getWeeklyJackpotInfo() { 
  const timeUntilDraw = calculateTimeUntilDraw()
  
  // Debug logging
  console.log('🕐 getWeeklyJackpotInfo called')
  console.log('📅 timeUntilDraw:', timeUntilDraw)
  console.log('🕐 Current time:', new Date().toLocaleString())
  console.log('🕐 Next Monday 12pm PST:', getNextMondayAt12PM().toLocaleString())
  
  // Return zero since there are no actual players yet
  const totalToppings = 0
  const totalPlayers = 0
  
  return {
    totalToppings,
    totalPlayers,
    timeUntilDraw,
  }
}

export function getDailyPlayerCount(): number {
  return 0 // No actual players yet
}

export function getWeeklyPlayerCount(): number {
  return 0 // No actual players yet
}

export function getToppingsAvailableToClaim(): number {
  return 0 // No toppings available since no players
}

export function getTotalToppingsClaimed(): number {
  return 0 // No toppings claimed since no players
}

export function selectWeeklyJackpotWinners(): string[] {
  const winners = []
  const winnerCount = Math.min(10, Math.floor(Math.random() * 15) + 5)
  
  for (let i = 0; i < winnerCount; i++) {
    winners.push(`0x${Math.random().toString(16).substring(2, 42)}`)
  }
  
  return winners
}

export function payWeeklyJackpotWinners(winners: string[], amount: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`💰 Paid ${amount} VMF to ${winners.length} weekly winners`)
      resolve()
    }, 1000)
  })
}

export function getUserClaimableToppings(address: string, isConnected: boolean): number {
  if (!isConnected || !address) return 0
  return Math.floor(Math.random() * 20) + 1
}

export function getTimeUntilClaimingWindow() { 
  return calculateTimeUntilClaimingWindow()
}

export function isWeeklyJackpotTime(): boolean {
  return checkWeeklyJackpotTime()
}

export function earnDailyPlayToppings(playerAddress: string): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const toppings = Math.floor(Math.random() * 5) + 1
      console.log(`🎁 Earned ${toppings} toppings for daily play`)
      resolve(toppings)
    }, 1000)
  })
}

export function earnVMFHoldingsToppings(playerAddress: string): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const toppings = Math.floor(Math.random() * 3) + 1
      console.log(`🎁 Earned ${toppings} toppings for VMF holdings`)
      resolve(toppings)
    }, 1000)
  })
}

export function selectDailyJackpotWinners(): string[] {
  const winners = []
  const winnerCount = Math.min(8, Math.floor(Math.random() * 10) + 3)
  
  for (let i = 0; i < winnerCount; i++) {
    winners.push(`0x${Math.random().toString(16).substring(2, 42)}`)
  }
  
  return winners
}

export function payDailyJackpotWinners(winners: string[], amount: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`💰 Paid ${amount} VMF to ${winners.length} daily winners`)
      resolve()
    }, 1000)
  })
}

export function isDailyJackpotTime(): boolean {
  return checkDailyJackpotTime()
}

export function getDailyJackpotAmount(): number {
  return 0 // No daily jackpot amount since no players
}

export function getRealTimeDailyPlayerCount(): number {
  return 0 // No real-time players since no actual players
}

export function getRealTimeJackpotValue(): number {
  return 0 // No real-time jackpot value since no players
}

export function canClaimToppings(): boolean {
  return checkCanClaimToppings()
}
