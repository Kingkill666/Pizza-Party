import { useState, useCallback } from 'react';
import { farcasterApp } from '../lib/farcaster-miniapp';

export interface ShareResult {
  type: 'entry' | 'winner' | 'jackpot' | 'referral' | 'leaderboard' | 'milestone';
  amount?: string;
  gameType?: 'daily' | 'weekly';
  toppings?: number;
  referralCode?: string;
  leaderboardType?: 'daily' | 'weekly';
  milestoneAmount?: string;
  milestoneType?: 'daily' | 'weekly';
}

export const useFarcasterShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [lastShareResult, setLastShareResult] = useState<boolean | null>(null);

  // Share game entry
  const shareGameEntry = useCallback(async (toppings?: number) => {
    setIsSharing(true);
    try {
      const result = await farcasterApp.shareGameResult({
        type: 'entry',
        toppings
      });
      setLastShareResult(result);
      return result;
    } catch (error) {
      console.error('Failed to share game entry:', error);
      setLastShareResult(false);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share winner announcement
  const shareWinner = useCallback(async (amount: string, gameType: 'daily' | 'weekly', toppings?: number) => {
    setIsSharing(true);
    try {
      const result = await farcasterApp.shareGameResult({
        type: 'winner',
        amount,
        gameType,
        toppings
      });
      setLastShareResult(result);
      return result;
    } catch (error) {
      console.error('Failed to share winner:', error);
      setLastShareResult(false);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share jackpot update
  const shareJackpot = useCallback(async (amount: string, gameType: 'daily' | 'weekly', toppings?: number) => {
    setIsSharing(true);
    try {
      const result = await farcasterApp.shareGameResult({
        type: 'jackpot',
        amount,
        gameType,
        toppings
      });
      setLastShareResult(result);
      return result;
    } catch (error) {
      console.error('Failed to share jackpot:', error);
      setLastShareResult(false);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share referral code
  const shareReferralCode = useCallback(async (referralCode: string) => {
    setIsSharing(true);
    try {
      const result = await farcasterApp.shareReferralCode(referralCode);
      setLastShareResult(result);
      return result;
    } catch (error) {
      console.error('Failed to share referral code:', error);
      setLastShareResult(false);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share leaderboard
  const shareLeaderboard = useCallback(async (leaderboardType: 'daily' | 'weekly') => {
    setIsSharing(true);
    try {
      const result = await farcasterApp.shareLeaderboard(leaderboardType);
      setLastShareResult(result);
      return result;
    } catch (error) {
      console.error('Failed to share leaderboard:', error);
      setLastShareResult(false);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share jackpot milestone
  const shareJackpotMilestone = useCallback(async (amount: string, type: 'daily' | 'weekly') => {
    setIsSharing(true);
    try {
      const result = await farcasterApp.shareJackpotMilestone(amount, type);
      setLastShareResult(result);
      return result;
    } catch (error) {
      console.error('Failed to share jackpot milestone:', error);
      setLastShareResult(false);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Generic share function
  const shareContent = useCallback(async (content: string, options?: {
    embeds?: string[];
    channelId?: string;
  }) => {
    setIsSharing(true);
    try {
      const result = await farcasterApp.shareOnFarcaster(content, options);
      setLastShareResult(result);
      return result;
    } catch (error) {
      console.error('Failed to share content:', error);
      setLastShareResult(false);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Clear last share result
  const clearShareResult = useCallback(() => {
    setLastShareResult(null);
  }, []);

  return {
    // State
    isSharing,
    lastShareResult,
    
    // Share functions
    shareGameEntry,
    shareWinner,
    shareJackpot,
    shareReferralCode,
    shareLeaderboard,
    shareJackpotMilestone,
    shareContent,
    
    // Utilities
    clearShareResult,
    
    // Helper functions
    isFarcasterEnvironment: farcasterApp.isFarcasterEnvironment()
  };
};
