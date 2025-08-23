"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface FarcasterWalletContextType {
  fid: number | null;
  username: string | null;
  avatar: string | null;
  wallet: string | null;
  signer: any;
  connected: boolean;
  loading: boolean;
  error: string | null;
  isFarcasterEnvironment: boolean;
  signMessage: (message: string) => Promise<string>;
}

const FarcasterWalletContext = createContext<FarcasterWalletContextType>({
  fid: null,
  username: null,
  avatar: null,
  wallet: null,
  signer: null,
  connected: false,
  loading: true,
  error: null,
  isFarcasterEnvironment: false,
  signMessage: async () => { throw new Error('Signer not initialized'); },
});

export const FarcasterWalletProvider = ({ children }: { children: ReactNode }) => {
  const [fid, setFid] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFarcasterEnvironment, setIsFarcasterEnvironment] = useState(false);

  // Farcaster-only approach - no ethers.js needed

  // Sign message function
  const signMessage = async (message: string): Promise<string> => {
    if (!signer) {
      console.warn('⚠️ No Farcaster signer available for message signing');
      throw new Error("No Farcaster signer available");
    }
    
    if (!message || typeof message !== 'string') {
      throw new Error("Invalid message provided");
    }
    
    try {
      console.log('📝 Attempting to sign message:', message);
      const signature = await signer.signMessage(message);
      
      if (!signature) {
        throw new Error("Signature returned null or undefined");
      }
      
      console.log('✅ Message signed successfully');
      console.log('🔐 Signature:', signature);
      return signature;
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Automatically detect Farcaster environment and initialize
  useEffect(() => {
    async function initFarcaster() {
      try {
        setLoading(true);
        setError(null);

        // 1. Check if we're in a Farcaster environment
        const isFarcaster = window.location.href.includes('farcaster') || 
                           window.location.href.includes('warpcast') ||
                           window.location.href.includes('miniapp') ||
                           window.farcaster ||
                           window.farcasterSdk ||
                           (window as any).Warpcast

        if (!isFarcaster) {
          console.log('🌐 Not in Farcaster environment')
          setIsFarcasterEnvironment(false);
          setLoading(false);
          return;
        }

        setIsFarcasterEnvironment(true);
        console.log('🎮 Farcaster environment detected')

        // 2. Try to get Farcaster SDK or Warpcast directly
        let sdk = window.farcasterSdk || window.farcaster?.sdk || (window as any).Warpcast

        if (!sdk) {
          // Try to dynamically import the SDK
          try {
            const { sdk: importedSdk } = await import('@farcaster/miniapp-sdk')
            sdk = importedSdk
            console.log('✅ Farcaster SDK imported dynamically')
          } catch (importError) {
            console.warn('⚠️ Failed to import Farcaster SDK:', importError)
            setError('Farcaster SDK not available')
            setLoading(false);
            return;
          }
        }

        if (sdk) {
          try {
            // 3. Initialize the SDK
            await sdk.actions.ready()
            console.log('✅ Farcaster SDK ready')
            
            // 4. Try different methods to get user info
            let user = null;
            let fid = null;
            
            // Try different possible methods
            if (sdk.actions.getUser) {
              try {
                user = await sdk.actions.getUser()
                console.log('✅ Got user via getUser()')
              } catch (e) {
                console.warn('⚠️ getUser() failed:', e)
              }
            }
            
            if (!user && sdk.actions.getCurrentUser) {
              try {
                user = await sdk.actions.getCurrentUser()
                console.log('✅ Got user via getCurrentUser()')
              } catch (e) {
                console.warn('⚠️ getCurrentUser() failed:', e)
              }
            }
            
            if (!user && sdk.actions.getUserInfo) {
              try {
                user = await sdk.actions.getUserInfo()
                console.log('✅ Got user via getUserInfo()')
              } catch (e) {
                console.warn('⚠️ getUserInfo() failed:', e)
              }
            }
            
            // If we still don't have a user, try to get FID from other sources
            if (!user) {
              // Try to get FID from window.farcaster
              if (window.farcaster?.user?.fid) {
                fid = window.farcaster.user.fid;
                console.log('✅ Got FID from window.farcaster.user.fid:', fid)
              } else if (window.farcaster?.fid) {
                fid = window.farcaster.fid;
                console.log('✅ Got FID from window.farcaster.fid:', fid)
              } else if ((window as any).Warpcast?.wallet?.fid) {
                fid = (window as any).Warpcast.wallet.fid;
                console.log('✅ Got FID from window.Warpcast.wallet.fid:', fid)
              }
            } else {
              fid = user.fid;
            }
            
            if (fid) {
              setFid(fid);
              console.log('✅ Farcaster user found:', fid)

              // 5. Try to get wallet address
              try {
                let walletAddress = null;
                
                // Try different methods to get wallet
                if (sdk.actions.getVerifiedAddresses) {
                  try {
                    const verifiedAddresses = await sdk.actions.getVerifiedAddresses()
                    if (verifiedAddresses && verifiedAddresses.eth_addresses && verifiedAddresses.eth_addresses.length > 0) {
                      walletAddress = verifiedAddresses.eth_addresses[0]
                      console.log('✅ Wallet address found via getVerifiedAddresses():', walletAddress)
                    }
                  } catch (e) {
                    console.warn('⚠️ getVerifiedAddresses() failed:', e)
                  }
                }
                
                // Fallback: try to get from window.farcaster
                if (!walletAddress && window.farcaster?.user?.verifiedAddresses) {
                  const addresses = window.farcaster.user.verifiedAddresses;
                  if (addresses.eth_addresses && addresses.eth_addresses.length > 0) {
                    walletAddress = addresses.eth_addresses[0];
                    console.log('✅ Wallet address found via window.farcaster:', walletAddress)
                  }
                }
                
                // Fallback: try to get from window.Warpcast
                if (!walletAddress && (window as any).Warpcast?.wallet?.address) {
                  walletAddress = (window as any).Warpcast.wallet.address;
                  console.log('✅ Wallet address found via window.Warpcast:', walletAddress)
                }
                
                if (walletAddress) {
                  setWallet(walletAddress)
                } else {
                  console.warn('⚠️ No verified wallet addresses found')
                  setError('No wallet linked to Farcaster account')
                }
              } catch (addressError) {
                console.warn('⚠️ Failed to get verified addresses:', addressError)
                setError('Failed to get wallet address')
              }

              // 6. Try to get signer
              try {
                let farcasterSigner = null;
                
                if (sdk.actions.getSigner) {
                  try {
                    farcasterSigner = await sdk.actions.getSigner()
                    console.log('✅ Farcaster signer available via getSigner()')
                  } catch (e) {
                    console.warn('⚠️ getSigner() failed:', e)
                  }
                }
                
                // Fallback: try to get from window.farcaster
                if (!farcasterSigner && window.farcaster?.signer) {
                  farcasterSigner = window.farcaster.signer;
                  console.log('✅ Farcaster signer available via window.farcaster.signer')
                }
                
                // Fallback: try to get from window.Warpcast
                if (!farcasterSigner && (window as any).Warpcast?.wallet) {
                  farcasterSigner = (window as any).Warpcast.wallet;
                  console.log('✅ Farcaster signer available via window.Warpcast.wallet')
                }
                
                if (farcasterSigner) {
                  setSigner(farcasterSigner)
                } else {
                  console.warn('⚠️ No Farcaster signer available')
                }
              } catch (signerError) {
                console.warn('⚠️ Failed to get signer:', signerError)
              }

              // 7. Set username
              setUsername(`user_${fid}`)
              setAvatar(null)

            } else {
              console.warn('⚠️ No Farcaster user found')
              setError('No Farcaster user found')
            }
          } catch (sdkError) {
            console.error('❌ SDK initialization error:', sdkError)
            setError('Failed to initialize Farcaster SDK')
          }
        } else {
          console.warn('⚠️ Farcaster SDK not available')
          setError('Farcaster SDK not available')
        }

        setLoading(false);

      } catch (err) {
        console.error('❌ Farcaster init error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    initFarcaster();
  }, []);

  const contextValue: FarcasterWalletContextType = {
    fid,
    username,
    avatar,
    wallet,
    signer,
    connected: !!wallet,
    loading,
    error,
    isFarcasterEnvironment,
    signMessage
  };

  // Expose provider globally for QA testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__FarcasterWalletProvider = contextValue;
      console.log('🌐 FarcasterWalletProvider exposed globally:', {
        fid: contextValue.fid,
        username: contextValue.username,
        wallet: contextValue.wallet,
        connected: contextValue.connected,
        loading: contextValue.loading,
        hasSignMessage: !!contextValue.signMessage
      });
    }
  }, [contextValue]);

  return (
    <FarcasterWalletContext.Provider value={contextValue}>
      {children}
    </FarcasterWalletContext.Provider>
  );
};

export const useFarcasterWallet = () => {
  const context = useContext(FarcasterWalletContext);
  if (!context) {
    throw new Error('useFarcasterWallet must be used within a FarcasterWalletProvider');
  }
  return context;
};
