"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface FarcasterRetryButtonProps {
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
  isLoading?: boolean;
  customFontStyle?: React.CSSProperties;
}

export function FarcasterRetryButton({ 
  onRetry, 
  retryCount, 
  maxRetries, 
  isLoading = false,
  customFontStyle 
}: FarcasterRetryButtonProps) {
  const canRetry = retryCount < maxRetries;
  
  return (
    <Button
      onClick={onRetry}
      disabled={!canRetry || isLoading}
      className="w-full !bg-orange-600 hover:!bg-orange-700 text-white text-sm font-bold py-2 px-4 rounded-lg border-2 border-orange-700 shadow-md transform hover:scale-105 transition-all"
      style={customFontStyle}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Retrying...' : `Retry Farcaster Wallet (${retryCount}/${maxRetries})`}
    </Button>
  );
}
