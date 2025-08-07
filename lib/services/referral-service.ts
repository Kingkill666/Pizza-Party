// Referral service for referral operations
import { InputValidator } from '@/lib/input-validator'
import { ErrorHandler } from '@/lib/error-handler'
import { SecurityMonitor } from '@/lib/security-monitor'

export interface CreateReferralParams {
  walletAddress: string
  signature: string
}

export interface CreateReferralResult {
  success: boolean
  referralCode?: string
  walletAddress?: string
  createdAt?: string
  error?: string
}

export interface ReferralStats {
  address: string
  referralCode: string
  totalReferrals: number
  totalRewards: string
  referrals: Referral[]
}

export interface Referral {
  address: string
  joinedAt: string
  reward: string
}

export interface IReferralService {
  createReferralCode(params: CreateReferralParams): Promise<CreateReferralResult>
  getReferralStats(address: string): Promise<ReferralStats>
  validateReferralCode(code: string): boolean
  processReferral(code: string, newUserAddress: string): Promise<boolean>
}

export class ReferralService implements IReferralService {
  constructor(
    private securityService: ISecurityService,
    private errorHandler: ErrorHandler
  ) {}

  async createReferralCode(params: CreateReferralParams): Promise<CreateReferralResult> {
    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(params.walletAddress)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      // Security checks
      if (this.securityService.isUserFlagged(params.walletAddress)) {
        throw new Error('Account temporarily restricted due to suspicious activity')
      }

      const rateLimitStatus = this.securityService.getRateLimitStatus(params.walletAddress, 'REFERRAL_CREATION')
      if (!rateLimitStatus.allowed) {
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimitStatus.resetTime - Date.now()) / 60000)} minutes`)
      }

      // Track user action
      this.securityService.trackUserAction({
        type: 'REFERRAL_CREATION_ATTEMPT',
        userId: params.walletAddress
      })

      // Check if referral code already exists
      const existingCode = localStorage.getItem(`referral_code_${params.walletAddress}`)
      if (existingCode) {
        throw new Error('Referral code already exists for this wallet')
      }

      // Generate referral code
      const referralCode = this.generateReferralCode(params.walletAddress)
      
      // Store referral code
      localStorage.setItem(`referral_code_${params.walletAddress}`, referralCode)
      localStorage.setItem(`referral_created_${params.walletAddress}`, Date.now().toString())

      // Track successful creation
      this.securityService.trackUserAction({
        type: 'REFERRAL_CREATION_SUCCESS',
        userId: params.walletAddress,
        metadata: { referralCode }
      })

      return {
        success: true,
        referralCode,
        walletAddress: params.walletAddress,
        createdAt: new Date().toISOString()
      }

    } catch (error: any) {
      console.error('Referral creation error:', error)
      
      const userMessage = this.errorHandler.handleError(error, 'ReferralService.createReferralCode', 'MEDIUM')
      
      // Track failed creation
      this.securityService.trackUserAction({
        type: 'REFERRAL_CREATION_FAILED',
        userId: params.walletAddress,
        metadata: { error: error.message }
      })

      return {
        success: false,
        error: userMessage
      }
    }
  }

  async getReferralStats(address: string): Promise<ReferralStats> {
    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(address)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      // Get referral code
      const referralCode = localStorage.getItem(`referral_code_${address}`) || 'NONE'

      // Get referral data
      const totalReferrals = parseInt(localStorage.getItem(`total_referrals_${address}`) || '0')
      const totalRewards = localStorage.getItem(`total_referral_rewards_${address}`) || '0'

      // Mock referrals (in real app, this would come from blockchain events)
      const referrals: Referral[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          reward: '0.005'
        }
      ]

      return {
        address,
        referralCode,
        totalReferrals,
        totalRewards,
        referrals
      }

    } catch (error: any) {
      const userMessage = this.errorHandler.handleError(error, 'ReferralService.getReferralStats', 'MEDIUM')
      throw new Error(userMessage)
    }
  }

  validateReferralCode(code: string): boolean {
    const validation = InputValidator.validateReferralCode(code)
    return validation.valid
  }

  async processReferral(code: string, newUserAddress: string): Promise<boolean> {
    try {
      // Input validation
      const codeValidation = InputValidator.validateReferralCode(code)
      if (!codeValidation.valid) {
        throw new Error(codeValidation.error || 'Invalid referral code')
      }

      const addressValidation = InputValidator.validateWalletAddress(newUserAddress)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      // Find referrer by code
      const referrerAddress = this.findReferrerByCode(code)
      if (!referrerAddress) {
        throw new Error('Invalid referral code')
      }

      // Check if user already used a referral
      const existingReferral = localStorage.getItem(`referral_used_${newUserAddress}`)
      if (existingReferral) {
        throw new Error('User already used a referral code')
      }

      // Process referral
      localStorage.setItem(`referral_used_${newUserAddress}`, referrerAddress)
      
      // Update referrer stats
      const currentReferrals = parseInt(localStorage.getItem(`total_referrals_${referrerAddress}`) || '0')
      localStorage.setItem(`total_referrals_${referrerAddress}`, (currentReferrals + 1).toString())

      // Award toppings to both users
      const referrerToppings = parseInt(localStorage.getItem(`toppings_${referrerAddress}`) || '0')
      localStorage.setItem(`toppings_${referrerAddress}`, (referrerToppings + 1).toString())

      const newUserToppings = parseInt(localStorage.getItem(`toppings_${newUserAddress}`) || '0')
      localStorage.setItem(`toppings_${newUserAddress}`, (newUserToppings + 1).toString())

      return true

    } catch (error: any) {
      console.error('Referral processing error:', error)
      return false
    }
  }

  private generateReferralCode(address: string): string {
    const timestamp = Date.now().toString().slice(-6)
    const addressSuffix = address.slice(-6)
    return `PIZZA${addressSuffix}${timestamp}`
  }

  private findReferrerByCode(code: string): string | null {
    // In a real app, this would query a database or contract
    // For now, we'll check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('referral_code_')) {
        const storedCode = localStorage.getItem(key)
        if (storedCode === code) {
          return key.replace('referral_code_', '')
        }
      }
    }
    return null
  }
}

// Service interface for dependency injection
export interface ISecurityService {
  isUserFlagged(userId: string): boolean
  getRateLimitStatus(userId: string, actionType: string): any
  trackUserAction(action: any): void
} 