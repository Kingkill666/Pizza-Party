import { useEffect } from 'react';
import { useFarcasterWallet } from '@/components/FarcasterWalletProvider';

export function useFarcasterMiniApp() {
  const { 
    fid, 
    username, 
    wallet, 
    connected, 
    loading, 
    error, 
    isFarcasterEnvironment,
    signMessage,
    signer 
  } = useFarcasterWallet();

  useEffect(() => {
    // Handle loading state during initial detection
    if (loading) {
      console.log('🔍 Detecting Farcaster mini app wallet...');
      return;
    }

    // Handle errors gracefully
    if (error) {
      console.error('❌ Farcaster mini app wallet detection failed:', error);
      return;
    }

    // Success case
    if (connected && wallet) {
      console.log('✅ Farcaster mini app wallet detected successfully!', {
        fid,
        username,
        wallet: wallet.slice(0, 6) + '...' + wallet.slice(-4)
      });
    }
  }, [loading, error, connected, wallet, fid, username]);

  return {
    fid,
    username,
    wallet,
    connected,
    loading,
    error,
    isFarcasterEnvironment,
    signMessage,
    signer,
    // Convenience getters
    isReady: !loading && !error && connected,
    isError: !!error,
    isLoading: loading
  };
}
