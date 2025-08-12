// Gasless game service for Pizza Party
// Enables users to play without paying gas fees

import { GaslessTransactionManager, GaslessUtils, Web3Provider } from '../gasless-transactions';
import { ethers } from 'ethers';

export interface GaslessGameTransaction {
  type: 'enterDailyGame' | 'claimToppings' | 'addJackpotEntry';
  data: any;
  estimatedGas: string;
}

export class GaslessGameService {
  private gaslessManager: GaslessTransactionManager;
  private pizzaPartyContract: ethers.Contract;

  constructor(
    provider: Web3Provider,
    signer: ethers.Signer,
    contractAddress: string,
    contractABI: any
  ) {
    this.gaslessManager = new GaslessTransactionManager(provider, signer);
    this.pizzaPartyContract = new ethers.Contract(contractAddress, contractABI, signer);
  }

  /**
   * Enter daily game gaslessly
   */
  async enterDailyGameGasless(referralCode: string = ''): Promise<string> {
    try {
      console.log('🍕 Creating gasless daily game entry...');

      // Check if gasless is supported
      const isSupported = await this.gaslessManager.isGaslessSupported();
      if (!isSupported) {
        throw new Error('Gasless transactions not supported on this network');
      }

      // Create the transaction data
      const data = this.pizzaPartyContract.interface.encodeFunctionData(
        'enterDailyGame',
        [referralCode]
      );

      // Estimate gas
      const estimatedGas = await this.gaslessManager.estimateGaslessGas(
        await this.pizzaPartyContract.getAddress(),
        data
      );

      console.log(`💰 Estimated gas: ${estimatedGas.toString()}`);

      // Execute gasless transaction
      const transactionHash = await this.gaslessManager.executeGaslessTransaction(
        await this.pizzaPartyContract.getAddress(),
        data
      );

      console.log('✅ Gasless daily game entry successful!');
      console.log(`🔗 Transaction: ${transactionHash}`);

      return transactionHash;
    } catch (error) {
      console.error('❌ Gasless daily game entry failed:', error);
      throw error;
    }
  }

  /**
   * Claim toppings gaslessly
   */
  async claimToppingsGasless(): Promise<string> {
    try {
      console.log('🍕 Creating gasless topping claim...');

      // Check if gasless is supported
      const isSupported = await this.gaslessManager.isGaslessSupported();
      if (!isSupported) {
        throw new Error('Gasless transactions not supported on this network');
      }

      // Create the transaction data
      const data = this.pizzaPartyContract.interface.encodeFunctionData(
        'claimToppings'
      );

      // Estimate gas
      const estimatedGas = await this.gaslessManager.estimateGaslessGas(
        await this.pizzaPartyContract.getAddress(),
        data
      );

      console.log(`💰 Estimated gas: ${estimatedGas.toString()}`);

      // Execute gasless transaction
      const transactionHash = await this.gaslessManager.executeGaslessTransaction(
        await this.pizzaPartyContract.getAddress(),
        data
      );

      console.log('✅ Gasless topping claim successful!');
      console.log(`🔗 Transaction: ${transactionHash}`);

      return transactionHash;
    } catch (error) {
      console.error('❌ Gasless topping claim failed:', error);
      throw error;
    }
  }

  /**
   * Add jackpot entry gaslessly
   */
  async addJackpotEntryGasless(): Promise<string> {
    try {
      console.log('🏆 Creating gasless jackpot entry...');

      // Check if gasless is supported
      const isSupported = await this.gaslessManager.isGaslessSupported();
      if (!isSupported) {
        throw new Error('Gasless transactions not supported on this network');
      }

      // Create the transaction data
      const data = this.pizzaPartyContract.interface.encodeFunctionData(
        'addJackpotEntry'
      );

      // Estimate gas
      const estimatedGas = await this.gaslessManager.estimateGaslessGas(
        await this.pizzaPartyContract.getAddress(),
        data
      );

      console.log(`💰 Estimated gas: ${estimatedGas.toString()}`);

      // Execute gasless transaction
      const transactionHash = await this.gaslessManager.executeGaslessTransaction(
        await this.pizzaPartyContract.getAddress(),
        data
      );

      console.log('✅ Gasless jackpot entry successful!');
      console.log(`🔗 Transaction: ${transactionHash}`);

      return transactionHash;
    } catch (error) {
      console.error('❌ Gasless jackpot entry failed:', error);
      throw error;
    }
  }

  /**
   * Get gas estimates for all game actions
   */
  async getGasEstimates(): Promise<{
    enterDailyGame: string;
    claimToppings: string;
    addJackpotEntry: string;
  }> {
    try {
      const contractAddress = await this.pizzaPartyContract.getAddress();

      // Estimate gas for enter daily game
      const enterDailyGameData = this.pizzaPartyContract.interface.encodeFunctionData(
        'enterDailyGame',
        ['']
      );
      const enterDailyGameGas = await this.gaslessManager.estimateGaslessGas(
        contractAddress,
        enterDailyGameData
      );

      // Estimate gas for claim toppings
      const claimToppingsData = this.pizzaPartyContract.interface.encodeFunctionData(
        'claimToppings'
      );
      const claimToppingsGas = await this.gaslessManager.estimateGaslessGas(
        contractAddress,
        claimToppingsData
      );

      // Estimate gas for add jackpot entry
      const addJackpotEntryData = this.pizzaPartyContract.interface.encodeFunctionData(
        'addJackpotEntry'
      );
      const addJackpotEntryGas = await this.gaslessManager.estimateGaslessGas(
        contractAddress,
        addJackpotEntryData
      );

      return {
        enterDailyGame: enterDailyGameGas.toString(),
        claimToppings: claimToppingsGas.toString(),
        addJackpotEntry: addJackpotEntryGas.toString(),
      };
    } catch (error) {
      console.error('❌ Failed to get gas estimates:', error);
      throw error;
    }
  }

  /**
   * Check if user can perform gasless transactions
   */
  async canPerformGasless(): Promise<{
    supported: boolean;
    reason?: string;
  }> {
    try {
      const isSupported = await this.gaslessManager.isGaslessSupported();
      
      if (!isSupported) {
        return {
          supported: false,
          reason: 'Gasless transactions not supported on this network',
        };
      }

      // Check if user has sufficient balance for gasless transactions
      if (this.gaslessManager) {
        const signerAddress = await this.gaslessManager['signer'].getAddress();
        const balance = await this.gaslessManager['provider'].request({
          method: 'eth_getBalance',
          params: [signerAddress, 'latest']
        });

        const balanceBigInt = BigInt(balance);
        const minBalance = ethers.parseEther('0.001');

        if (balanceBigInt < minBalance) {
          return {
            supported: false,
            reason: 'Insufficient balance for gasless transactions',
          };
        }
      }

      return { supported: true };
    } catch (error) {
      console.error('❌ Error checking gasless capability:', error);
      return {
        supported: false,
        reason: 'Error checking gasless capability',
      };
    }
  }
}

/**
 * Hook for using gasless game transactions in React components
 */
export function useGaslessGameService(
  provider: Web3Provider,
  signer: ethers.Signer,
  contractAddress: string,
  contractABI: any
) {
  const gaslessService = new GaslessGameService(provider, signer, contractAddress, contractABI);

  return {
    enterDailyGame: (referralCode?: string) => gaslessService.enterDailyGameGasless(referralCode),
    claimToppings: () => gaslessService.claimToppingsGasless(),
    addJackpotEntry: () => gaslessService.addJackpotEntryGasless(),
    getGasEstimates: () => gaslessService.getGasEstimates(),
    canPerformGasless: () => gaslessService.canPerformGasless(),
  };
} 