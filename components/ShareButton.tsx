import React from 'react';
import { useFarcasterSharing } from '../hooks/useFarcasterSharing';

interface ShareButtonProps {
  type: 'game-announcement' | 'game-entry' | 'winner' | 'referral' | 'jackpot-milestone' | 'daily-winners' | 'weekly-winners' | 'topping-milestone' | 'game-stats';
  options?: {
    text?: string;
    imageUrl?: string;
    gameId?: string;
    jackpotAmount?: string;
    winnerCount?: number;
    referralCode?: string;
  };
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  type,
  options = {},
  children,
  className = '',
  disabled = false,
  onSuccess,
  onError
}) => {
  const {
    isSharing,
    isSharingAvailable,
    sharingMethod,
    error,
    shareGameAnnouncement,
    shareGameEntry,
    shareWinnerAnnouncement,
    shareReferralCode,
    shareJackpotMilestone,
    shareDailyWinners,
    shareWeeklyWinners,
    shareToppingMilestone,
    shareGameStats,
    clearError
  } = useFarcasterSharing();

  const handleShare = async () => {
    if (disabled || isSharing || !isSharingAvailable) return;

    try {
      let result;
      
      switch (type) {
        case 'game-announcement':
          result = await shareGameAnnouncement(options);
          break;
        case 'game-entry':
          result = await shareGameEntry(options);
          break;
        case 'winner':
          result = await shareWinnerAnnouncement(options);
          break;
        case 'referral':
          result = await shareReferralCode(options);
          break;
        case 'jackpot-milestone':
          result = await shareJackpotMilestone(options);
          break;
        case 'daily-winners':
          result = await shareDailyWinners(options);
          break;
        case 'weekly-winners':
          result = await shareWeeklyWinners(options);
          break;
        case 'topping-milestone':
          result = await shareToppingMilestone(options);
          break;
        case 'game-stats':
          result = await shareGameStats(options);
          break;
        default:
          throw new Error(`Unknown share type: ${type}`);
      }

      onSuccess?.(result);
    } catch (err: any) {
      onError?.(err.message);
    }
  };

  const getButtonText = () => {
    if (isSharing) return 'Sharing...';
    
    switch (type) {
      case 'game-announcement':
        return 'Share Game';
      case 'game-entry':
        return 'Share Entry';
      case 'winner':
        return 'Share Win';
      case 'referral':
        return 'Share Referral';
      case 'jackpot-milestone':
        return 'Share Jackpot';
      case 'daily-winners':
        return 'Share Winners';
      case 'weekly-winners':
        return 'Share Winners';
      case 'topping-milestone':
        return 'Share Toppings';
      case 'game-stats':
        return 'Share Stats';
      default:
        return 'Share';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'game-announcement':
        return '🍕';
      case 'game-entry':
        return '🎮';
      case 'winner':
        return '🏆';
      case 'referral':
        return '🎁';
      case 'jackpot-milestone':
        return '💰';
      case 'daily-winners':
      case 'weekly-winners':
        return '👥';
      case 'topping-milestone':
        return '🍕';
      case 'game-stats':
        return '📊';
      default:
        return '📤';
    }
  };

  if (!isSharingAvailable) {
    return (
      <button
        className={`px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed ${className}`}
        disabled
        title="Sharing not available"
      >
        {getIcon()} Share (Unavailable)
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleShare}
        disabled={disabled || isSharing}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isSharing 
            ? 'bg-blue-400 text-white cursor-wait' 
            : disabled 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer hover:scale-105'
          }
          ${className}
        `}
        title={`Share to ${sharingMethod === 'farcaster-kit' ? 'Farcaster' : sharingMethod === 'native-farcaster' ? 'Farcaster' : 'Clipboard'}`}
      >
        {children || (
          <>
            {getIcon()} {getButtonText()}
            {sharingMethod === 'clipboard' && ' 📋'}
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// Quick share buttons for common use cases
export const QuickShareButtons: React.FC<{
  gameId?: string;
  jackpotAmount?: string;
  winnerCount?: number;
  referralCode?: string;
  className?: string;
}> = ({ gameId, jackpotAmount, winnerCount, referralCode, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <ShareButton
        type="game-announcement"
        className="text-sm"
      >
        🍕 Share Game
      </ShareButton>
      
      <ShareButton
        type="game-entry"
        options={{ jackpotAmount, winnerCount }}
        className="text-sm"
      >
        🎮 Share Entry
      </ShareButton>
      
      {referralCode && (
        <ShareButton
          type="referral"
          options={{ referralCode }}
          className="text-sm"
        >
          🎁 Share Referral
        </ShareButton>
      )}
      
      {jackpotAmount && (
        <ShareButton
          type="jackpot-milestone"
          options={{ jackpotAmount, winnerCount }}
          className="text-sm"
        >
          💰 Share Jackpot
        </ShareButton>
      )}
    </div>
  );
};
