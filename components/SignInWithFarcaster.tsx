"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { ExternalLink, QrCode, X, RefreshCw } from 'lucide-react';

interface SignInWithFarcasterProps {
  domain: string;
  uri: string;
  redirectUrl?: string;
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  customFontStyle?: React.CSSProperties;
}

export function SignInWithFarcaster({
  domain,
  uri,
  redirectUrl,
  onSuccess,
  onError,
  customFontStyle
}: SignInWithFarcasterProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const {
    isAuthenticating,
    isAuthenticated,
    error,
    qrCodeUrl,
    authUrl,
    userData,
    startAuth,
    stopAuth,
    reset,
    openAuthUrl,
    canStartAuth,
    canStopAuth,
    hasQRCode,
    hasAuthUrl,
  } = useFarcasterAuth({
    domain,
    uri,
    redirectUrl,
    timeoutMs: 300000, // 5 minutes
    pollIntervalMs: 2000, // 2 seconds
  });

  // Handle authentication success
  if (isAuthenticated && userData && onSuccess) {
    onSuccess(userData);
    setShowAuthModal(false);
    reset();
  }

  // Handle authentication error
  if (error && onError) {
    onError(error);
  }

  const handleStartAuth = async () => {
    setShowAuthModal(true);
    await startAuth();
  };

  const handleStopAuth = () => {
    stopAuth();
    setShowAuthModal(false);
  };

  const handleReset = () => {
    reset();
    setShowAuthModal(false);
  };

  return (
    <>
      {/* Sign in Button */}
      <Button
        onClick={handleStartAuth}
        disabled={!canStartAuth}
        className="w-full !bg-purple-600 hover:!bg-purple-700 text-white text-lg font-bold py-3 px-6 rounded-xl border-4 border-purple-800 shadow-lg transform hover:scale-105 transition-all"
        style={customFontStyle}
      >
        <QrCode className="mr-2 h-5 w-5" />
        Sign in with Farcaster
      </Button>

      {/* Authentication Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md mx-auto bg-white border-4 border-purple-800 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-purple-800 text-center" style={customFontStyle}>
              🟣 Sign in with Farcaster
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-4">
            {/* Loading State */}
            {isAuthenticating && !hasQRCode && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 text-purple-600 animate-spin" />
                <p className="text-purple-800 font-semibold" style={customFontStyle}>
                  Setting up authentication...
                </p>
              </div>
            )}

            {/* QR Code Display */}
            {hasQRCode && (
              <div className="text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <p className="text-sm text-gray-600 mb-3" style={customFontStyle}>
                    Scan this QR code with your Warpcast app:
                  </p>
                  <img
                    src={qrCodeUrl!}
                    alt="Farcaster Sign In QR Code"
                    className="mx-auto border-2 border-gray-300 rounded-lg"
                    style={{ maxWidth: '250px', height: 'auto' }}
                  />
                </div>

                {/* Alternative: Direct Link */}
                {hasAuthUrl && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600" style={customFontStyle}>
                      Or click the link below:
                    </p>
                    <Button
                      onClick={openAuthUrl}
                      className="w-full !bg-purple-600 hover:!bg-purple-700 text-white text-sm font-bold py-2 px-4 rounded-lg border-2 border-purple-700 shadow-md"
                      style={customFontStyle}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Warpcast
                    </Button>
                  </div>
                )}

                {/* Status Message */}
                <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-blue-800" style={customFontStyle}>
                    Waiting for you to approve the sign-in request in Warpcast...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                <p className="text-red-800 font-semibold mb-2" style={customFontStyle}>
                  Authentication Error
                </p>
                <p className="text-red-700 text-sm" style={customFontStyle}>
                  {error}
                </p>
                <div className="mt-3 space-x-2">
                  <Button
                    onClick={handleReset}
                    className="!bg-red-600 hover:!bg-red-700 text-white text-sm font-bold py-1 px-3 rounded border border-red-700"
                    style={customFontStyle}
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={handleStopAuth}
                    className="!bg-gray-600 hover:!bg-gray-700 text-white text-sm font-bold py-1 px-3 rounded border border-gray-700"
                    style={customFontStyle}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {canStopAuth && (
                <Button
                  onClick={handleStopAuth}
                  className="flex-1 !bg-gray-600 hover:!bg-gray-700 text-white text-sm font-bold py-2 px-4 rounded-lg border-2 border-gray-700 shadow-md"
                  style={customFontStyle}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
              
              {error && (
                <Button
                  onClick={handleReset}
                  className="flex-1 !bg-purple-600 hover:!bg-purple-700 text-white text-sm font-bold py-2 px-4 rounded-lg border-2 border-purple-700 shadow-md"
                  style={customFontStyle}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
