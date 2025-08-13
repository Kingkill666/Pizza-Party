import { useState, useCallback } from 'react';
import { farcasterSharing, ShareOptions } from '../lib/farcaster-sharing';

export const useFarcasterSharing = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [lastShareResult, setLastShareResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if sharing is available
  const isSharingAvailable = farcasterSharing.isSharingAvailable();
  const sharingMethod = farcasterSharing.getSharingMethod();

  // Share game announcement
  const shareGameAnnouncement = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareGameAnnouncement(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share game entry
  const shareGameEntry = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareGameEntry(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share winner announcement
  const shareWinnerAnnouncement = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareWinnerAnnouncement(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share referral code
  const shareReferralCode = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareReferralCode(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share jackpot milestone
  const shareJackpotMilestone = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareJackpotMilestone(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share daily winners
  const shareDailyWinners = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareDailyWinners(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share weekly winners
  const shareWeeklyWinners = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareWeeklyWinners(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share topping milestone
  const shareToppingMilestone = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareToppingMilestone(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share game stats
  const shareGameStats = useCallback(async (options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareGameStats(options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Share with template
  const shareWithTemplate = useCallback(async (templateId: string, options: ShareOptions = {}) => {
    setIsSharing(true);
    setError(null);
    
    try {
      const result = await farcasterSharing.shareWithTemplate(templateId, options);
      setLastShareResult(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsSharing(false);
    }
  }, []);

  // Get available templates
  const getShareTemplates = useCallback(() => {
    return farcasterSharing.getShareTemplates();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isSharing,
    isSharingAvailable,
    sharingMethod,
    lastShareResult,
    error,
    
    // Actions
    shareGameAnnouncement,
    shareGameEntry,
    shareWinnerAnnouncement,
    shareReferralCode,
    shareJackpotMilestone,
    shareDailyWinners,
    shareWeeklyWinners,
    shareToppingMilestone,
    shareGameStats,
    shareWithTemplate,
    getShareTemplates,
    clearError
  };
};
