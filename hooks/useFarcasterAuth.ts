import { useState, useEffect, useCallback, useRef } from 'react';
import { FarcasterAuthService } from '@/lib/farcaster-auth';

interface UseFarcasterAuthOptions {
  domain: string;
  uri: string;
  redirectUrl?: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
}

interface FarcasterAuthState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  error: string | null;
  qrCodeUrl: string | null;
  authUrl: string | null;
  userData: {
    fid: number | null;
    username: string | null;
    displayName: string | null;
    bio: string | null;
    pfpUrl: string | null;
  } | null;
}

export function useFarcasterAuth(options: UseFarcasterAuthOptions) {
  const [state, setState] = useState<FarcasterAuthState>({
    isAuthenticating: false,
    isAuthenticated: false,
    error: null,
    qrCodeUrl: null,
    authUrl: null,
    userData: null,
  });

  const channelTokenRef = useRef<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  // Start authentication process
  const startAuth = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isAuthenticating: true,
        error: null,
        qrCodeUrl: null,
        authUrl: null,
        userData: null,
      }));

      console.log('🚀 Starting FIP-11 Sign in With Farcaster...');

      // Create authentication channel
      const channel = await FarcasterAuthService.createChannel({
        domain: options.domain,
        uri: options.uri,
        redirectUrl: options.redirectUrl,
      });

      channelTokenRef.current = channel.channelToken;

      // Generate QR code URL
      const qrCodeUrl = FarcasterAuthService.generateQRCodeUrl(channel.url);

      setState(prev => ({
        ...prev,
        qrCodeUrl,
        authUrl: channel.url,
      }));

      console.log('✅ Auth channel created, starting polling...');

      // Start polling for authentication completion
      await pollForAuth(channel.channelToken);

    } catch (error) {
      console.error('❌ Authentication failed:', error);
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }));
    }
  }, [options.domain, options.uri, options.redirectUrl]);

  // Poll for authentication completion
  const pollForAuth = useCallback(async (channelToken: string) => {
    const timeoutMs = options.timeoutMs || 300000; // 5 minutes
    const pollIntervalMs = options.pollIntervalMs || 2000; // 2 seconds
    const startTime = Date.now();

    const poll = async () => {
      try {
        // Check if we've exceeded timeout
        if (Date.now() - startTime > timeoutMs) {
          throw new Error('Authentication timeout - user did not complete sign in');
        }

        const status = await FarcasterAuthService.checkStatus(channelToken);

        if (status.state === 'completed' && status.signature && status.fid) {
          // Authentication completed successfully
          console.log('🎉 Farcaster authentication completed!', status);

          setState(prev => ({
            ...prev,
            isAuthenticating: false,
            isAuthenticated: true,
            userData: {
              fid: status.fid,
              username: status.username || null,
              displayName: status.displayName || null,
              bio: status.bio || null,
              pfpUrl: status.pfpUrl || null,
            },
          }));

          // Clear polling
          if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
          }

          return;
        }

        // Continue polling
        pollingRef.current = setTimeout(poll, pollIntervalMs);

      } catch (error) {
        console.error('❌ Polling error:', error);
        setState(prev => ({
          ...prev,
          isAuthenticating: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
        }));

        // Clear polling
        if (pollingRef.current) {
          clearTimeout(pollingRef.current);
          pollingRef.current = null;
        }
      }
    };

    // Start polling
    poll();
  }, [options.timeoutMs, options.pollIntervalMs]);

  // Stop authentication
  const stopAuth = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isAuthenticating: false,
      error: null,
      qrCodeUrl: null,
      authUrl: null,
    }));

    channelTokenRef.current = null;
  }, []);

  // Reset authentication state
  const reset = useCallback(() => {
    stopAuth();
    setState({
      isAuthenticating: false,
      isAuthenticated: false,
      error: null,
      qrCodeUrl: null,
      authUrl: null,
      userData: null,
    });
  }, [stopAuth]);

  // Open auth URL in new window/tab
  const openAuthUrl = useCallback(() => {
    if (state.authUrl) {
      window.open(state.authUrl, '_blank', 'noopener,noreferrer');
    }
  }, [state.authUrl]);

  return {
    // State
    ...state,
    
    // Actions
    startAuth,
    stopAuth,
    reset,
    openAuthUrl,
    
    // Convenience getters
    canStartAuth: !state.isAuthenticating && !state.isAuthenticated,
    canStopAuth: state.isAuthenticating,
    hasQRCode: !!state.qrCodeUrl,
    hasAuthUrl: !!state.authUrl,
  };
}
