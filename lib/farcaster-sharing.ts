import { FarcasterKit } from '@farcasterkit/react';

export interface ShareOptions {
  text?: string;
  imageUrl?: string;
  gameId?: string;
  jackpotAmount?: string;
  winnerCount?: number;
  referralCode?: string;
}

export interface ShareTemplate {
  id: string;
  name: string;
  description: string;
  template: (options: ShareOptions) => string;
  imageUrl?: string;
}

export class FarcasterSharingService {
  private farcasterKit: FarcasterKit | null = null;

  constructor() {
    // Initialize Farcaster Kit if available
    if (typeof window !== 'undefined' && window.farcasterKit) {
      this.farcasterKit = window.farcasterKit;
    }
  }

  /**
   * Share a basic game announcement
   */
  async shareGameAnnouncement(options: ShareOptions = {}) {
    const text = options.text || this.getDefaultGameAnnouncement(options);
    
    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-share.png'
    });
  }

  /**
   * Share when user enters the game
   */
  async shareGameEntry(options: ShareOptions = {}) {
    const text = `🍕 Just entered Pizza Party! 🎮\n\n` +
      `💰 Daily Jackpot: ${options.jackpotAmount || 'Loading...'} VMF\n` +
      `👥 Players: ${options.winnerCount || 0}/8 spots filled\n\n` +
      `🎯 Join me and win some VMF! 🚀\n` +
      `#PizzaParty #Base #VMF #Gaming`;

    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-entry.png'
    });
  }

  /**
   * Share when user wins
   */
  async shareWinnerAnnouncement(options: ShareOptions = {}) {
    const text = `🏆 I JUST WON PIZZA PARTY! 🎉\n\n` +
      `💰 Won: ${options.jackpotAmount || 'Loading...'} VMF\n` +
      `🎮 Game ID: #${options.gameId || 'Unknown'}\n\n` +
      `🍕 Join the fun and win too! 🚀\n` +
      `#PizzaParty #Winner #Base #VMF`;

    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-winner.png'
    });
  }

  /**
   * Share referral code
   */
  async shareReferralCode(options: ShareOptions = {}) {
    const text = `🎁 FREE PIZZA PARTY REFERRAL! 🍕\n\n` +
      `🔗 Use my code: ${options.referralCode || 'PIZZA123'}\n` +
      `🎯 Get 2 bonus toppings when you join\n` +
      `💰 Daily & Weekly jackpots to win!\n\n` +
      `🚀 Join the fun: Pizza Party on Base\n` +
      `#PizzaParty #Referral #Base #VMF`;

    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-referral.png'
    });
  }

  /**
   * Share jackpot milestone
   */
  async shareJackpotMilestone(options: ShareOptions = {}) {
    const text = `💰 MASSIVE JACKPOT ALERT! 🚨\n\n` +
      `🏆 Weekly Jackpot: ${options.jackpotAmount || 'Loading...'} VMF\n` +
      `🍕 Total Toppings: ${options.winnerCount || 0}\n` +
      `🎯 10 winners will split this! 💰\n\n` +
      `🍕 Don't miss out - join Pizza Party now!\n` +
      `#PizzaParty #Jackpot #Base #VMF`;

    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-jackpot.png'
    });
  }

  /**
   * Share daily winner announcement
   */
  async shareDailyWinners(options: ShareOptions = {}) {
    const text = `🏆 DAILY WINNERS ANNOUNCED! 🎉\n\n` +
      `💰 Jackpot: ${options.jackpotAmount || 'Loading...'} VMF\n` +
      `👥 ${options.winnerCount || 8} lucky winners\n` +
      `🎮 Game ID: #${options.gameId || 'Unknown'}\n\n` +
      `🍕 Tomorrow could be your day! 🚀\n` +
      `#PizzaParty #Winners #Base #VMF`;

    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-daily-winners.png'
    });
  }

  /**
   * Share weekly winner announcement
   */
  async shareWeeklyWinners(options: ShareOptions = {}) {
    const text = `🏆 WEEKLY WINNERS ANNOUNCED! 🎉\n\n` +
      `💰 Jackpot: ${options.jackpotAmount || 'Loading...'} VMF\n` +
      `👥 10 lucky winners\n` +
      `🍕 Based on ${options.winnerCount || 0} total toppings\n\n` +
      `🎯 Start earning toppings for next week!\n` +
      `#PizzaParty #WeeklyWinners #Base #VMF`;

    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-weekly-winners.png'
    });
  }

  /**
   * Share topping milestone
   */
  async shareToppingMilestone(options: ShareOptions = {}) {
    const text = `🍕 TOPPING MILESTONE! 🎯\n\n` +
      `🎮 I earned ${options.winnerCount || 0} toppings this week!\n` +
      `💰 Contributing to ${options.jackpotAmount || 'Loading...'} VMF jackpot\n` +
      `🎯 Join me and earn toppings too!\n\n` +
      `🚀 Daily play + Referrals + VMF holdings\n` +
      `#PizzaParty #Toppings #Base #VMF`;

    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-toppings.png'
    });
  }

  /**
   * Share game statistics
   */
  async shareGameStats(options: ShareOptions = {}) {
    const text = `📊 PIZZA PARTY STATS! 📈\n\n` +
      `👥 Total Players: ${options.winnerCount || 0}\n` +
      `💰 Weekly Jackpot: ${options.jackpotAmount || 'Loading...'} VMF\n` +
      `🍕 Total Toppings: ${options.gameId || 0}\n` +
      `🎯 Winners this week: 10\n\n` +
      `🚀 Join the fastest growing game on Base!\n` +
      `#PizzaParty #Stats #Base #VMF`;

    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || '/images/pizza-party-stats.png'
    });
  }

  /**
   * Get available share templates
   */
  getShareTemplates(): ShareTemplate[] {
    return [
      {
        id: 'game-announcement',
        name: 'Game Announcement',
        description: 'Basic game introduction',
        template: (options) => this.getDefaultGameAnnouncement(options)
      },
      {
        id: 'game-entry',
        name: 'Game Entry',
        description: 'Share when entering the game',
        template: (options) => `🍕 Just entered Pizza Party! 🎮\n\n💰 Daily Jackpot: ${options.jackpotAmount || 'Loading...'} VMF\n👥 Players: ${options.winnerCount || 0}/8 spots filled\n\n🎯 Join me and win some VMF! 🚀\n#PizzaParty #Base #VMF #Gaming`
      },
      {
        id: 'winner',
        name: 'Winner Announcement',
        description: 'Share when you win',
        template: (options) => `🏆 I JUST WON PIZZA PARTY! 🎉\n\n💰 Won: ${options.jackpotAmount || 'Loading...'} VMF\n🎮 Game ID: #${options.gameId || 'Unknown'}\n\n🍕 Join the fun and win too! 🚀\n#PizzaParty #Winner #Base #VMF`
      },
      {
        id: 'referral',
        name: 'Referral Code',
        description: 'Share your referral code',
        template: (options) => `🎁 FREE PIZZA PARTY REFERRAL! 🍕\n\n🔗 Use my code: ${options.referralCode || 'PIZZA123'}\n🎯 Get 2 bonus toppings when you join\n💰 Daily & Weekly jackpots to win!\n\n🚀 Join the fun: Pizza Party on Base\n#PizzaParty #Referral #Base #VMF`
      },
      {
        id: 'jackpot-milestone',
        name: 'Jackpot Milestone',
        description: 'Share jackpot milestones',
        template: (options) => `💰 MASSIVE JACKPOT ALERT! 🚨\n\n🏆 Weekly Jackpot: ${options.jackpotAmount || 'Loading...'} VMF\n🍕 Total Toppings: ${options.winnerCount || 0}\n🎯 10 winners will split this! 💰\n\n🍕 Don't miss out - join Pizza Party now!\n#PizzaParty #Jackpot #Base #VMF`
      }
    ];
  }

  /**
   * Share using a specific template
   */
  async shareWithTemplate(templateId: string, options: ShareOptions = {}) {
    const templates = this.getShareTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const text = template.template(options);
    return await this.shareToFarcaster({
      text,
      imageUrl: options.imageUrl || template.imageUrl
    });
  }

  /**
   * Core sharing function
   */
  private async shareToFarcaster({ text, imageUrl }: { text: string; imageUrl?: string }) {
    try {
      if (this.farcasterKit) {
        // Use Farcaster Kit if available
        return await this.farcasterKit.share({
          text,
          imageUrl
        });
      } else if (typeof window !== 'undefined' && window.farcaster) {
        // Use native Farcaster API if available
        return await window.farcaster.share({
          text,
          imageUrl
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(text);
        return { success: true, method: 'clipboard' };
      }
    } catch (error) {
      console.error('Failed to share to Farcaster:', error);
      
      // Fallback to clipboard copy
      try {
        await navigator.clipboard.writeText(text);
        return { success: true, method: 'clipboard' };
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
        throw new Error('Sharing not available');
      }
    }
  }

  /**
   * Get default game announcement text
   */
  private getDefaultGameAnnouncement(options: ShareOptions): string {
    return `🍕 PIZZA PARTY IS LIVE! 🎮\n\n` +
      `💰 Daily Jackpots: 8 winners every day\n` +
      `🏆 Weekly Jackpots: 10 winners every Monday\n` +
      `🎯 Earn toppings: Play daily, refer friends, hold VMF\n\n` +
      `🚀 Join the hottest game on Base! 🔥\n` +
      `#PizzaParty #Base #VMF #Gaming #Web3`;
  }

  /**
   * Check if Farcaster sharing is available
   */
  isSharingAvailable(): boolean {
    return !!(this.farcasterKit || (typeof window !== 'undefined' && window.farcaster));
  }

  /**
   * Get sharing method
   */
  getSharingMethod(): 'farcaster-kit' | 'native-farcaster' | 'clipboard' | 'unavailable' {
    if (this.farcasterKit) return 'farcaster-kit';
    if (typeof window !== 'undefined' && window.farcaster) return 'native-farcaster';
    if (typeof window !== 'undefined' && navigator.clipboard) return 'clipboard';
    return 'unavailable';
  }
}

// Export singleton instance
export const farcasterSharing = new FarcasterSharingService();

// Type declarations for global objects
declare global {
  interface Window {
    farcasterKit?: any;
    farcaster?: {
      share: (options: { text: string; imageUrl?: string }) => Promise<any>;
    };
  }
}
