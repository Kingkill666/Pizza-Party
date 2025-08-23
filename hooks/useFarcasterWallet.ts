import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface FarcasterWalletState {
  isFarcasterEnvironment: boolean
  fid: number | null
  walletAddress: string | null
  signer: ethers.Signer | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
}

export function useFarcasterWallet() {
  const [state, setState] = useState<FarcasterWalletState>({
    isFarcasterEnvironment: false,
    fid: null,
    walletAddress: null,
    signer: null,
    isConnected: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const detectFarcasterEnvironment = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        // Check if we're in a Farcaster environment
            const isFarcaster = window.location.href.includes('farcaster') || 
                       window.location.href.includes('warpcast') ||
                       window.location.href.includes('miniapp') ||
                       window.farcaster ||
                       window.farcasterSdk

        if (!isFarcaster) {
          setState(prev => ({ 
            ...prev, 
            isFarcasterEnvironment: false, 
            isLoading: false 
          }))
          return
        }

        setState(prev => ({ ...prev, isFarcasterEnvironment: true }))

        // Try to get Farcaster SDK
        let sdk = window.farcasterSdk || window.farcaster?.sdk

        if (!sdk) {
          // Try to dynamically import the SDK
          try {
            const { sdk: importedSdk } = await import('@farcaster/miniapp-sdk')
            sdk = importedSdk
          } catch (importError) {
            console.warn('Failed to import Farcaster SDK:', importError)
          }
        }

        if (sdk) {
          // Initialize the SDK
          await sdk.actions.ready()
          
          // Get the current user
          const user = await sdk.actions.getCurrentUser()
          
          if (user) {
            setState(prev => ({ 
              ...prev, 
              fid: user.fid,
              isConnected: true,
              isLoading: false 
            }))

            // Get the user's verified addresses
            try {
              const verifiedAddresses = await sdk.actions.getVerifiedAddresses()
              if (verifiedAddresses && verifiedAddresses.eth_addresses && verifiedAddresses.eth_addresses.length > 0) {
                const walletAddress = verifiedAddresses.eth_addresses[0]
                setState(prev => ({ 
                  ...prev, 
                  walletAddress 
                }))
              }
            } catch (addressError) {
              console.warn('Failed to get verified addresses:', addressError)
            }

            // Get the signer for transactions
            try {
              const signer = await sdk.actions.getSigner()
              if (signer) {
                setState(prev => ({ 
                  ...prev, 
                  signer 
                }))
              }
            } catch (signerError) {
              console.warn('Failed to get signer:', signerError)
            }
          } else {
            setState(prev => ({ 
              ...prev, 
              error: 'No Farcaster user found',
              isLoading: false 
            }))
          }
        } else {
          setState(prev => ({ 
            ...prev, 
            error: 'Farcaster SDK not available',
            isLoading: false 
          }))
        }

      } catch (error) {
        console.error('Error detecting Farcaster environment:', error)
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false 
        }))
      }
    }

    detectFarcasterEnvironment()
  }, [])

  return state
}
