import { CONTRACT_ADDRESSES, PIZZA_PARTY_ABI, FREE_PRICE_ORACLE_ABI, FREE_RANDOMNESS_ABI, VMF_TOKEN_ABI } from './contract-config'
import { GaslessGameService } from './services/gasless-game-service';
import { ethers } from 'ethers';

// Web3 provider interface
export interface Web3Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (params: any) => void) => void
  removeListener: (event: string, callback: (params: any) => void) => void
}

// Pizza Party Contract class for interacting with deployed contracts
export class PizzaPartyContract {
  private provider: any
  private pizzaPartyAddress: string
  private priceOracleAddress: string
  private randomnessAddress: string
  private gaslessService?: GaslessGameService;

  constructor(provider: any) {
    this.provider = provider
    this.pizzaPartyAddress = CONTRACT_ADDRESSES.PIZZA_PARTY
    this.priceOracleAddress = CONTRACT_ADDRESSES.FREE_PRICE_ORACLE
    this.randomnessAddress = CONTRACT_ADDRESSES.FREE_RANDOMNESS
    
    // Initialize gasless service
    this.gaslessService = new GaslessGameService(
      provider,
      // We'll initialize the signer later when needed
      undefined as any, 
      this.pizzaPartyAddress,
      PIZZA_PARTY_ABI
    );
  }

  // Get player data from contract
  async getPlayerData(playerAddress: string) {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.pizzaPartyAddress,
          data: this.encodeFunctionCall('getPlayerInfo', [playerAddress])
        }, 'latest']
      })
      return this.decodePlayerData(data)
    } catch (error) {
      console.error('Error getting player data:', error)
      return null
    }
  }

  // Get current jackpots
  async getJackpots() {
    try {
      const [dailyJackpot, weeklyJackpot] = await Promise.all([
        this.provider.request({
          method: 'eth_call',
          params: [{
            to: this.pizzaPartyAddress,
            data: this.encodeFunctionCall('currentDailyJackpot', [])
          }, 'latest']
        }),
        this.provider.request({
          method: 'eth_call',
          params: [{
            to: this.pizzaPartyAddress,
            data: this.encodeFunctionCall('currentWeeklyJackpot', [])
          }, 'latest']
        })
      ])

      return {
        daily: this.decodeUint256(dailyJackpot),
        weekly: this.decodeUint256(weeklyJackpot)
      }
    } catch (error) {
      console.error('Error getting jackpots:', error)
      return { daily: 0, weekly: 0 }
    }
  }

  // Get current entry fee
  async getCurrentEntryFee() {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.pizzaPartyAddress,
          data: this.encodeFunctionCall('getCurrentEntryFee', [])
        }, 'latest']
      })
      return this.decodeUint256(data)
    } catch (error) {
      console.error('Error getting entry fee:', error)
      return 0
    }
  }

  // Get current VMF price
  async getCurrentVMFPrice() {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.priceOracleAddress,
          data: this.encodeFunctionCallWithABI('getVMFPrice', [], FREE_PRICE_ORACLE_ABI)
        }, 'latest']
      })
      return this.decodeUint256(data)
    } catch (error) {
      console.error('Error getting VMF price:', error)
      return 0
    }
  }

  /**
   * Enter daily game with gasless transaction support
   */
  async enterDailyGame(referralCode: string = '', useGasless: boolean = false): Promise<string> {
    try {
      if (useGasless && this.gaslessService) {
        // Check if gasless is supported
        const gaslessCheck = await this.gaslessService.canPerformGasless();
        if (gaslessCheck.supported) {
          console.log('🚀 Using gasless transaction for daily game entry');
          return await this.gaslessService.enterDailyGameGasless(referralCode);
        } else {
          console.log('⚠️ Gasless not available, falling back to regular transaction:', gaslessCheck.reason);
        }
      }

      // Fallback to regular transaction
      console.log('💰 Using regular transaction for daily game entry');
      return await this.enterDailyGameRegular(referralCode);
    } catch (error) {
      console.error('❌ Daily game entry failed:', error);
      throw error;
    }
  }

  /**
   * Regular transaction for daily game entry
   */
  private async enterDailyGameRegular(referralCode: string = ''): Promise<string> {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      // Get the current VMF price and calculate required amount for $1 entry fee
      const vmfPriceData = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.priceOracleAddress,
          data: this.encodeFunctionCallWithABI('getRequiredVMFForDollar', [], FREE_PRICE_ORACLE_ABI)
        }, 'latest']
      })
      
      const requiredVMFAmount = this.decodeUint256(vmfPriceData)
      console.log('Required VMF amount for $1 entry:', requiredVMFAmount)
      
      // Convert to hex format for transaction
      const vmfAmountHex = '0x' + BigInt(requiredVMFAmount).toString(16)
      
      // VMF token contract address
      const vmfContractAddress = CONTRACT_ADDRESSES.VMF_TOKEN
      
      // Step 1: Approve VMF tokens to the Pizza Party contract
      const approveData = this.encodeFunctionCallWithABI('approve', [this.pizzaPartyAddress, vmfAmountHex], VMF_TOKEN_ABI)
      
      const approveGasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: vmfContractAddress,
          data: approveData
        }]
      })

      const approveTxHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: vmfContractAddress,
          data: approveData,
          gas: approveGasEstimate
        }]
      })

      // Wait for approval transaction to be mined
      await this.waitForTransaction(approveTxHash)
      console.log('VMF approval transaction confirmed:', approveTxHash)
      
      // Step 2: Transfer VMF tokens to the contract (this will be the entry fee)
      const transferData = this.encodeFunctionCallWithABI('transfer', [this.pizzaPartyAddress, vmfAmountHex], VMF_TOKEN_ABI)
      
      const transferGasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: vmfContractAddress,
          data: transferData
        }]
      })

      const transferTxHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: vmfContractAddress,
          data: transferData,
          gas: transferGasEstimate
        }]
      })

      // Wait for transfer transaction to be mined
      await this.waitForTransaction(transferTxHash)
      console.log('VMF transfer transaction confirmed:', transferTxHash)
      
      // Step 3: Call enterDailyGame with no ETH value (since we already transferred VMF)
      const enterGameData = this.encodeFunctionCall('enterDailyGame', [referralCode])
      
      const enterGameGasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: enterGameData,
          value: '0x0' // No ETH value
        }]
      })

      const enterGameTxHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: enterGameData,
          value: '0x0', // No ETH value
          gas: enterGameGasEstimate
        }]
      })

      return enterGameTxHash
    } catch (error) {
      console.error('Error entering daily game:', error)
      throw error
    }
  }

  /**
   * Claim toppings with gasless transaction support
   */
  async claimToppings(useGasless: boolean = false): Promise<string> {
    try {
      if (useGasless && this.gaslessService) {
        // Check if gasless is supported
        const gaslessCheck = await this.gaslessService.canPerformGasless();
        if (gaslessCheck.supported) {
          console.log('🚀 Using gasless transaction for topping claim');
          return await this.gaslessService.claimToppingsGasless();
        } else {
          console.log('⚠️ Gasless not available, falling back to regular transaction:', gaslessCheck.reason);
        }
      }

      // Fallback to regular transaction
      console.log('💰 Using regular transaction for topping claim');
      return await this.claimToppingsRegular();
    } catch (error) {
      console.error('❌ Topping claim failed:', error);
      throw error;
    }
  }

  /**
   * Regular transaction for claiming toppings
   */
  private async claimToppingsRegular(): Promise<string> {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('awardVMFHoldingsToppings', [])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error awarding VMF holdings toppings:', error)
      throw error
    }
  }

  /**
   * Add jackpot entry with gasless transaction support
   */
  async addJackpotEntry(useGasless: boolean = false): Promise<string> {
    try {
      if (useGasless && this.gaslessService) {
        // Check if gasless is supported
        const gaslessCheck = await this.gaslessService.canPerformGasless();
        if (gaslessCheck.supported) {
          console.log('🚀 Using gasless transaction for jackpot entry');
          return await this.gaslessService.addJackpotEntryGasless();
        } else {
          console.log('⚠️ Gasless not available, falling back to regular transaction:', gaslessCheck.reason);
        }
      }

      // Fallback to regular transaction
      console.log('💰 Using regular transaction for jackpot entry');
      return await this.addJackpotEntryRegular();
    } catch (error) {
      console.error('❌ Jackpot entry failed:', error);
      throw error;
    }
  }

  /**
   * Regular transaction for adding jackpot entry
   */
  private async addJackpotEntryRegular(): Promise<string> {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('awardStreakBonus', [])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error awarding streak bonus:', error)
      throw error
    }
  }

  // Wait for transaction to be mined
  private async waitForTransaction(txHash: string): Promise<void> {
    let attempts = 0
    const maxAttempts = 50 // Wait up to 5 minutes (50 * 6 seconds)
    
    while (attempts < maxAttempts) {
      try {
        const receipt = await this.provider.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        })
        
        if (receipt && receipt.status === '0x1') {
          console.log(`Transaction ${txHash} confirmed`)
          return
        } else if (receipt && receipt.status === '0x0') {
          throw new Error(`Transaction ${txHash} failed`)
        }
        
        // Wait 6 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 6000))
        attempts++
      } catch (error) {
        console.error('Error checking transaction status:', error)
        attempts++
        await new Promise(resolve => setTimeout(resolve, 6000))
      }
    }
    
    throw new Error(`Transaction ${txHash} not confirmed after ${maxAttempts * 6} seconds`)
  }

  // Create referral code
  async createReferralCode() {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('createReferralCode', [])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error creating referral code:', error)
      throw error
    }
  }

  // Award VMF holdings toppings
  async awardVMFHoldingsToppings() {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('awardVMFHoldingsToppings', [])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error awarding VMF holdings toppings:', error)
      throw error
    }
  }

  // Get daily player count
  async getDailyPlayerCount(): Promise<number> {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.pizzaPartyAddress,
          data: this.encodeFunctionCall('dailyPlayerCount', ['0x0000000000000000000000000000000000000000000000000000000000000001'])
        }, 'latest']
      })
      return this.decodeUint256(data)
    } catch (error) {
      console.error('Error getting daily player count:', error)
      return 0
    }
  }

  // Get weekly player count
  async getWeeklyPlayerCount(): Promise<number> {
    try {
      const data = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: this.pizzaPartyAddress,
          data: this.encodeFunctionCall('weeklyPlayerCount', ['0x0000000000000000000000000000000000000000000000000000000000000001'])
        }, 'latest']
      })
      return this.decodeUint256(data)
    } catch (error) {
      console.error('Error getting weekly player count:', error)
      return 0
    }
  }

  // Award streak bonus
  async awardStreakBonus() {
    try {
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' })
      const account = accounts[0]
      
      const data = this.encodeFunctionCall('awardStreakBonus', [])
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data
        }]
      })

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: this.pizzaPartyAddress,
          data: data,
          gas: gasEstimate
        }]
      })

      return txHash
    } catch (error) {
      console.error('Error awarding streak bonus:', error)
      throw error
    }
  }

  // Helper methods
  private encodeFunctionCall(functionName: string, params: any[]): string {
    try {
      // Use ethers.js to properly encode the function call
      const iface = new ethers.Interface(PIZZA_PARTY_ABI)
      return iface.encodeFunctionData(functionName, params)
    } catch (error) {
      console.error(`Error encoding function call for ${functionName}:`, error)
      return '0x'
    }
  }

  // Encode function call with specific ABI
  private encodeFunctionCallWithABI(functionName: string, params: any[], abi: any[]): string {
    try {
      // Use ethers.js to properly encode the function call with specific ABI
      const iface = new ethers.Interface(abi)
      return iface.encodeFunctionData(functionName, params)
    } catch (error) {
      console.error(`Error encoding function call for ${functionName}:`, error)
      throw error
    }
  }

  private decodePlayerData(data: string) {
    // Simple decoding - in real implementation, you'd decode the tuple properly
    return {
      hasEnteredToday: false,
      lastEntryTime: 0,
      totalEntries: 0,
      toppings: 0,
      referralCode: '',
      referredBy: ''
    }
  }

  private decodeUint256(data: string): number {
    return parseInt(data, 16)
  }

  /**
   * Get regular gas estimates for all game actions
   */
  private async getRegularGasEstimates(): Promise<{
    enterDailyGame: string;
    claimToppings: string;
    addJackpotEntry: string;
  }> {
    try {
      // Default gas estimates for regular transactions
      return {
        enterDailyGame: '100000', // 100k gas
        claimToppings: '80000',   // 80k gas
        addJackpotEntry: '120000', // 120k gas
      };
    } catch (error) {
      console.error('❌ Failed to get regular gas estimates:', error);
      return {
        enterDailyGame: '100000',
        claimToppings: '80000',
        addJackpotEntry: '120000',
      };
    }
  }

  /**
   * Get gas estimates for all game actions
   */
  async getGasEstimates(): Promise<{
    regular: {
      enterDailyGame: string;
      claimToppings: string;
      addJackpotEntry: string;
    };
    gasless: {
      enterDailyGame: string;
      claimToppings: string;
      addJackpotEntry: string;
    };
  }> {
    try {
      // Get regular gas estimates
      const regularEstimates = await this.getRegularGasEstimates();

      // Get gasless gas estimates
      let gaslessEstimates = {
        enterDailyGame: '0',
        claimToppings: '0',
        addJackpotEntry: '0',
      };

      if (this.gaslessService) {
        try {
          gaslessEstimates = await this.gaslessService.getGasEstimates();
        } catch (error) {
          console.log('⚠️ Could not get gasless estimates:', error);
        }
      }

      return {
        regular: regularEstimates,
        gasless: gaslessEstimates,
      };
    } catch (error) {
      console.error('❌ Failed to get gas estimates:', error);
      throw error;
    }
  }

  /**
   * Check if gasless transactions are available
   */
  async isGaslessAvailable(): Promise<{
    available: boolean;
    reason?: string;
  }> {
    if (!this.gaslessService) {
      return {
        available: false,
        reason: 'Gasless service not initialized',
      };
    }

    const gaslessCheck = await this.gaslessService.canPerformGasless();
    return {
      available: gaslessCheck.supported,
      reason: gaslessCheck.reason,
    };
  }
}

// Factory function to create PizzaPartyContract instance
export const createPizzaPartyContract = (provider: Web3Provider): PizzaPartyContract => {
  return new PizzaPartyContract(provider)
}

// Utility functions
export const formatVMFAmount = (amount: number): string => {
  return (amount / 1e18).toFixed(6)
}

export const parseVMFAmount = (amount: string): number => {
  return parseFloat(amount) * 1e18
}

// Check transaction status
export const checkTransactionStatus = async (provider: Web3Provider, txHash: string): Promise<boolean> => {
  try {
    const receipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    })
    return receipt && receipt.status === '0x1'
  } catch (error) {
    console.error('Error checking transaction status:', error)
    return false
  }
} 