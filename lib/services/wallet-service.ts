// Wallet service for wallet operations
import { InputValidator } from '@/lib/input-validator'
import { ErrorHandler } from '@/lib/error-handler'
import { SecurityMonitor } from '@/lib/security-monitor'

export interface WalletConnectionParams {
  walletType: 'metamask' | 'coinbase' | 'walletconnect'
  chainId: number
}

export interface WalletConnectionResult {
  success: boolean
  address?: string
  chainId?: number
  balance?: string
  sessionToken?: string
  error?: string
}

export interface WalletBalance {
  address: string
  balance: string
  currency: string
  chainId: number
  lastUpdated: string
}

export interface IWalletService {
  connectWallet(params: WalletConnectionParams): Promise<WalletConnectionResult>
  disconnectWallet(): Promise<void>
  getBalance(address: string): Promise<string>
  switchNetwork(chainId: number): Promise<boolean>
  validateAddress(address: string): boolean
  getConnectionStatus(): boolean
}

export class WalletService implements IWalletService {
  constructor(
    private securityService: ISecurityService,
    private errorHandler: ErrorHandler
  ) {}

  async connectWallet(params: WalletConnectionParams): Promise<WalletConnectionResult> {
    try {
      // Input validation
      const chainValidation = InputValidator.validateChainId(params.chainId)
      if (!chainValidation.valid) {
        throw new Error(chainValidation.error || 'Invalid chain ID')
      }

      // Track connection attempt
      this.securityService.trackUserAction({
        type: 'WALLET_CONNECTION_ATTEMPT',
        userId: 'unknown',
        userAgent: navigator.userAgent
      })

      // Simulate wallet connection (in real app, this would use actual wallet APIs)
      const mockAddress = '0x1234567890123456789012345678901234567890'
      const mockBalance = '0.500'

      // Track successful connection
      this.securityService.trackUserAction({
        type: 'WALLET_CONNECTION_SUCCESS',
        userId: mockAddress,
        metadata: { walletType: params.walletType, chainId: params.chainId }
      })

      return {
        success: true,
        address: mockAddress,
        chainId: params.chainId,
        balance: mockBalance,
        sessionToken: `session_${mockAddress}_${Date.now()}`
      }

    } catch (error: any) {
      // Track failed connection
      this.securityService.trackUserAction({
        type: 'WALLET_CONNECTION_FAILED',
        userId: 'unknown',
        metadata: { error: error.message, walletType: params.walletType }
      })

      const userMessage = this.errorHandler.handleError(error, 'WalletService.connectWallet', 'MEDIUM')
      
      return {
        success: false,
        error: userMessage
      }
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      // Clear session data
      if (typeof window !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('wallet') || key.includes('ethereum') || key.includes('wagmi'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }

      console.log('Wallet disconnected successfully')
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      // Input validation
      const addressValidation = InputValidator.validateWalletAddress(address)
      if (!addressValidation.valid) {
        throw new Error(addressValidation.error || 'Invalid wallet address')
      }

      // Simulate balance fetch (in real app, this would call RPC)
      const mockBalance = '0.500'
      return mockBalance

    } catch (error: any) {
      const userMessage = this.errorHandler.handleError(error, 'WalletService.getBalance', 'MEDIUM')
      throw new Error(userMessage)
    }
  }

  async switchNetwork(chainId: number): Promise<boolean> {
    try {
      // Input validation
      const chainValidation = InputValidator.validateChainId(chainId)
      if (!chainValidation.valid) {
        throw new Error(chainValidation.error || 'Invalid chain ID')
      }

      // Simulate network switch (in real app, this would call wallet APIs)
      console.log(`Switching to network ${chainId}`)
      return true

    } catch (error: any) {
      const userMessage = this.errorHandler.handleError(error, 'WalletService.switchNetwork', 'MEDIUM')
      throw new Error(userMessage)
    }
  }

  validateAddress(address: string): boolean {
    const validation = InputValidator.validateWalletAddress(address)
    return validation.valid
  }

  getConnectionStatus(): boolean {
    // Check if wallet is connected (simplified)
    return typeof window !== 'undefined' && !!window.ethereum
  }
}

// Service interface for dependency injection
export interface ISecurityService {
  trackUserAction(action: any): void
} 