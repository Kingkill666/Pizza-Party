import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useFarcasterWallet } from '@/components/FarcasterWalletProvider';

interface UseFarcasterMiniAppOptions {
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export function useFarcasterMiniApp(options: UseFarcasterMiniAppOptions = {}) {
  const {
    timeoutMs = 5000,
    maxRetries = 3,
    retryDelayMs = 1000
  } = options;

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

  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize derived values for performance
  const isConnected = useMemo(() => connected && fid && username, [connected, fid, username]);
  const isReady = useMemo(() => !loading && !error && isConnected, [loading, error, isConnected]);
  const isError = useMemo(() => !!error, [error]);
  const isLoading = useMemo(() => loading, [loading]);

  // Memoize wallet display info
  const walletDisplay = useMemo(() => {
    if (!wallet) return 'N/A';
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }, [wallet]);

  // Memoize user display info
  const userDisplay = useMemo(() => {
    if (!username || !fid) return 'Unknown User';
    return `@${username} (FID: ${fid})`;
  }, [username, fid]);

  // Retry mechanism
  const retryDetection = useCallback(() => {
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(`🔄 Retrying Farcaster wallet detection (attempt ${retryCount.current}/${maxRetries})`);
      
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Set retry timeout
      retryTimeoutRef.current = setTimeout(() => {
        // Force re-initialization by triggering a page refresh or SDK re-initialization
        if (typeof window !== 'undefined' && window.location) {
          console.log('🔄 Attempting to re-initialize Farcaster SDK...');
          // This will trigger the provider to re-detect
          window.dispatchEvent(new Event('farcaster-retry'));
        }
      }, retryDelayMs);
    } else {
      console.error(`❌ Max retries (${maxRetries}) exceeded for Farcaster wallet detection`);
    }
  }, [maxRetries, retryDelayMs]);

  // Timeout handling
  useEffect(() => {
    if (loading) {
      console.log('🔍 Detecting Farcaster mini app wallet...');
      
      // Set timeout for detection
      timeoutRef.current = setTimeout(() => {
        if (loading) {
          console.warn(`⚠️ Farcaster wallet detection timed out after ${timeoutMs}ms`);
          retryDetection();
        }
      }, timeoutMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [loading, timeoutMs, retryDetection]);

  // Error handling with retry logic
  useEffect(() => {
    if (error) {
      console.error('❌ Farcaster mini app wallet detection failed:', error);
      
      // Auto-retry on certain types of errors
      if (error.includes('SDK not available') || error.includes('Failed to import')) {
        retryDetection();
      }
    }
  }, [error, retryDetection]);

  // Success case with performance logging
  useEffect(() => {
    if (isConnected && wallet) {
      console.log('✅ Farcaster mini app wallet detected successfully!', {
        fid,
        username,
        wallet: walletDisplay,
        detectionTime: Date.now()
      });
      
      // Reset retry count on success
      retryCount.current = 0;
    }
  }, [isConnected, wallet, fid, username, walletDisplay]);

  // Performance monitoring
  useEffect(() => {
    if (isReady) {
      console.log('🚀 Farcaster mini app ready for use:', {
        user: userDisplay,
        wallet: walletDisplay,
        retryCount: retryCount.current
      });
    }
  }, [isReady, userDisplay, walletDisplay]);

  return {
    // Core state
    fid,
    username,
    wallet,
    connected,
    loading,
    error,
    isFarcasterEnvironment,
    signMessage,
    signer,
    
    // Memoized convenience getters
    isReady,
    isError,
    isLoading,
    isConnected,
    
    // Memoized display values
    walletDisplay,
    userDisplay,
    
    // Retry functionality
    retryCount: retryCount.current,
    maxRetries,
    retryDetection,
    
    // Performance metrics
    hasRetried: retryCount.current > 0,
    canRetry: retryCount.current < maxRetries
  };
}
