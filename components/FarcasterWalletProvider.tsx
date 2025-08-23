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

  // Single-purpose Farcaster mini app detection
  useEffect(() => {
    async function detectFarcasterWallet() {
      try {
        console.log('🔍 Starting Farcaster mini app wallet detection...');
        setLoading(true);
        setError(null);

        // 1. Check if we're in a Farcaster mini app environment
        const isInFarcaster = window.location.href.includes('farcaster') || 
                             window.location.href.includes('warpcast') ||
                             window.location.href.includes('miniapp') ||
                             window.farcaster ||
                             window.farcasterSdk ||
                             (window as any).Warpcast;

        if (!isInFarcaster) {
          console.log('🌐 Not in Farcaster mini app environment');
          setIsFarcasterEnvironment(false);
          setLoading(false);
          return;
        }

        setIsFarcasterEnvironment(true);
        console.log('🎮 Farcaster mini app environment detected');

        // 2. Try to get Farcaster SDK
        let sdk = window.farcasterSdk || window.farcaster?.sdk || (window as any).Warpcast;

        if (!sdk) {
          try {
            const { sdk: importedSdk } = await import('@farcaster/miniapp-sdk');
            sdk = importedSdk;
            console.log('✅ Farcaster SDK imported successfully');
          } catch (importError) {
            console.warn('⚠️ Failed to import Farcaster SDK:', importError);
            setError('Farcaster SDK not available');
            setLoading(false);
            return;
          }
        }

        // 3. Initialize SDK and get user info
        if (sdk?.actions?.ready) {
          await sdk.actions.ready();
          console.log('✅ Farcaster SDK ready');
        }

        // 4. Get user FID - try multiple methods
        let userFid = null;
        
        // Try SDK methods first
        if (sdk?.actions?.getUser) {
          try {
            const user = await sdk.actions.getUser();
            userFid = user.fid;
            console.log('✅ Got FID via getUser():', userFid);
          } catch (e) {
            console.warn('⚠️ getUser() failed:', e);
          }
        }

        // Fallback to window objects
        if (!userFid) {
          if (window.farcaster?.user?.fid) {
            userFid = window.farcaster.user.fid;
            console.log('✅ Got FID from window.farcaster.user.fid:', userFid);
          } else if (window.farcaster?.fid) {
            userFid = window.farcaster.fid;
            console.log('✅ Got FID from window.farcaster.fid:', userFid);
          } else if ((window as any).Warpcast?.wallet?.fid) {
            userFid = (window as any).Warpcast.wallet.fid;
            console.log('✅ Got FID from window.Warpcast.wallet.fid:', userFid);
          }
        }

        if (!userFid) {
          console.warn('⚠️ No Farcaster user FID found');
          setError('No Farcaster user found');
          setLoading(false);
          return;
        }

        setFid(userFid);
        console.log('✅ Farcaster user FID set:', userFid);

        // 5. Get wallet address
        let walletAddress = null;
        
        if (sdk?.actions?.getVerifiedAddresses) {
          try {
            const verifiedAddresses = await sdk.actions.getVerifiedAddresses();
            if (verifiedAddresses?.eth_addresses?.length > 0) {
              walletAddress = verifiedAddresses.eth_addresses[0];
              console.log('✅ Got wallet via getVerifiedAddresses():', walletAddress);
            }
          } catch (e) {
            console.warn('⚠️ getVerifiedAddresses() failed:', e);
          }
        }

        // Fallback to window objects
        if (!walletAddress) {
          if (window.farcaster?.user?.verifiedAddresses?.eth_addresses?.length > 0) {
            walletAddress = window.farcaster.user.verifiedAddresses.eth_addresses[0];
            console.log('✅ Got wallet from window.farcaster:', walletAddress);
          } else if ((window as any).Warpcast?.wallet?.address) {
            walletAddress = (window as any).Warpcast.wallet.address;
            console.log('✅ Got wallet from window.Warpcast:', walletAddress);
          }
        }

        if (walletAddress) {
          setWallet(walletAddress);
          console.log('✅ Wallet address set:', walletAddress);
        } else {
          console.warn('⚠️ No verified wallet address found');
          setError('No wallet linked to Farcaster account');
          setLoading(false);
          return;
        }

        // 6. Get signer
        let farcasterSigner = null;
        
        if (sdk?.actions?.getSigner) {
          try {
            farcasterSigner = await sdk.actions.getSigner();
            console.log('✅ Got signer via getSigner()');
          } catch (e) {
            console.warn('⚠️ getSigner() failed:', e);
          }
        }

        // Fallback to window objects
        if (!farcasterSigner) {
          if (window.farcaster?.signer) {
            farcasterSigner = window.farcaster.signer;
            console.log('✅ Got signer from window.farcaster.signer');
          } else if ((window as any).Warpcast?.wallet) {
            farcasterSigner = (window as any).Warpcast.wallet;
            console.log('✅ Got signer from window.Warpcast.wallet');
          }
        }

        if (farcasterSigner) {
          setSigner(farcasterSigner);
          console.log('✅ Farcaster signer set');
        } else {
          console.warn('⚠️ No Farcaster signer available');
          setError('No Farcaster signer available');
          setLoading(false);
          return;
        }

        // 7. Set username and avatar
        setUsername(`user_${userFid}`);
        setAvatar(null);

        console.log('✅ Farcaster mini app wallet detection complete');
        setLoading(false);

      } catch (err) {
        console.error('❌ Farcaster wallet detection error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    detectFarcasterWallet();
  }, []);

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
      return signature;
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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

  // Handle retry events from the hook
  useEffect(() => {
    const handleRetry = () => {
      console.log('🔄 Retry event received, re-initializing Farcaster detection...');
      // Reset state and re-detect
      setFid(null);
      setUsername(null);
      setAvatar(null);
      setWallet(null);
      setSigner(null);
      setError(null);
      setLoading(true);
      setIsFarcasterEnvironment(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener('farcaster-retry', handleRetry);
      return () => window.removeEventListener('farcaster-retry', handleRetry);
    }
  }, []);

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
