// Gasless transaction implementation for Base network
// Based on: https://docs.base.org/cookbook/go-gasless

import { ethers } from 'ethers';

// Web3 provider interface
export interface Web3Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, callback: (params: any) => void) => void
  removeListener: (event: string, callback: (params: any) => void) => void
}

export interface GaslessTransactionRequest {
  to: string;
  data: string;
  value?: string;
  nonce?: number;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface GaslessTransactionResponse {
  signature: string;
  transaction: GaslessTransactionRequest;
}

export class GaslessTransactionManager {
  private provider: Web3Provider;
  private signer: ethers.Signer;

  constructor(provider: Web3Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Create a gasless transaction using EIP-1559
   */
  async createGaslessTransaction(
    to: string,
    data: string,
    value: string = '0x0'
  ): Promise<GaslessTransactionResponse> {
    try {
      // Get the current network
      const chainId = await this.provider.request({
        method: 'eth_chainId',
        params: []
      });
      
      // Get the current nonce
      const address = await this.signer.getAddress();
      const nonce = await this.provider.request({
        method: 'eth_getTransactionCount',
        params: [address, 'latest']
      });
      
      // Get the current gas price
      const feeData = await this.provider.request({
        method: 'eth_feeData',
        params: []
      });
      
      // Create the transaction request
      const transaction: GaslessTransactionRequest = {
        to,
        data,
        value,
        nonce: parseInt(nonce, 16),
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: '0x186A0', // 100,000 gas limit
      };

      // Create the transaction hash for signing
      const transactionHash = ethers.TypedDataEncoder.hash(
        {
          name: 'EIP712Domain',
          version: '1',
          chainId: parseInt(chainId, 16),
          verifyingContract: to,
        },
        {
          Transaction: [
            { name: 'to', type: 'address' },
            { name: 'data', type: 'bytes' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'maxFeePerGas', type: 'uint256' },
            { name: 'maxPriorityFeePerGas', type: 'uint256' },
            { name: 'gasLimit', type: 'uint256' },
          ],
        },
        {
          to: transaction.to,
          data: transaction.data,
          value: transaction.value,
          nonce: transaction.nonce,
          maxFeePerGas: transaction.maxFeePerGas,
          maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
          gasLimit: transaction.gasLimit,
        }
      );

      // Sign the transaction
      const signature = await this.signer.signMessage(ethers.getBytes(transactionHash));

      return {
        signature,
        transaction,
      };
    } catch (error) {
      console.error('Error creating gasless transaction:', error);
      throw new Error('Failed to create gasless transaction');
    }
  }

  /**
   * Submit a gasless transaction to a relayer
   */
  async submitGaslessTransaction(
    gaslessTx: GaslessTransactionResponse,
    relayerUrl: string = 'https://relayer.base.org'
  ): Promise<string> {
    try {
      const response = await fetch(relayerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: gaslessTx.transaction,
          signature: gaslessTx.signature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Relayer error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.transactionHash;
    } catch (error) {
      console.error('Error submitting gasless transaction:', error);
      throw new Error('Failed to submit gasless transaction');
    }
  }

  /**
   * Create and submit a gasless transaction in one step
   */
  async executeGaslessTransaction(
    to: string,
    data: string,
    value: string = '0x0'
  ): Promise<string> {
    const gaslessTx = await this.createGaslessTransaction(to, data, value);
    return await this.submitGaslessTransaction(gaslessTx);
  }

  /**
   * Estimate gas for a gasless transaction
   */
  async estimateGaslessGas(
    to: string,
    data: string,
    value: string = '0x0'
  ): Promise<bigint> {
    try {
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [{
          to,
          data,
          value,
        }]
      });
      
      // Convert hex to bigint and add buffer for gasless overhead
      const gasEstimateBigInt = BigInt(gasEstimate);
      return gasEstimateBigInt + BigInt(50000); // 50k gas buffer
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  /**
   * Check if gasless transactions are supported on current network
   */
  async isGaslessSupported(): Promise<boolean> {
    try {
      // Use eth_chainId for raw Web3 provider
      const chainId = await this.provider.request({
        method: 'eth_chainId',
        params: []
      });
      
      // Only Base Mainnet (chainId: 0x2105 = 8453) supports gasless transactions
      return chainId === '0x2105'; // Base Mainnet
    } catch (error) {
      console.error('Error checking gasless support:', error);
      return false;
    }
  }
}

/**
 * Hook for using gasless transactions in React components
 */
export function useGaslessTransactions(provider: Web3Provider, signer: ethers.Signer) {
  const gaslessManager = new GaslessTransactionManager(provider, signer);

  const executeGaslessTransaction = async (
    to: string,
    data: string,
    value: string = '0x0'
  ): Promise<string> => {
    return await gaslessManager.executeGaslessTransaction(to, data, value);
  };

  const estimateGas = async (
    to: string,
    data: string,
    value: string = '0x0'
  ): Promise<bigint> => {
    return await gaslessManager.estimateGaslessGas(to, data, value);
  };

  const isSupported = async (): Promise<boolean> => {
    return await gaslessManager.isGaslessSupported();
  };

  return {
    executeGaslessTransaction,
    estimateGas,
    isSupported,
  };
}

/**
 * Utility functions for gasless transactions
 */
export const GaslessUtils = {
  /**
   * Format transaction for gasless submission
   */
  formatTransaction: (tx: GaslessTransactionRequest): any => {
    return {
      to: tx.to,
      data: tx.data,
      value: tx.value || '0x0',
      nonce: tx.nonce,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      gasLimit: tx.gasLimit,
    };
  },

  /**
   * Validate gasless transaction parameters
   */
  validateTransaction: (tx: GaslessTransactionRequest): boolean => {
    return !!(
      tx.to &&
      tx.data &&
      ethers.isAddress(tx.to) &&
      tx.data.startsWith('0x')
    );
  },

  /**
   * Get recommended gas limits for common operations
   */
  getRecommendedGasLimits: () => ({
    simpleTransfer: '0x5208', // 21,000 gas
    contractInteraction: '0x186A0', // 100,000 gas
    complexContract: '0x30D40', // 200,000 gas
    gameEntry: '0x186A0', // 100,000 gas for Pizza Party entry
  }),
}; 