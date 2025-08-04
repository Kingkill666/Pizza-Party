// Monitoring and Analytics System for Pizza Party dApp

interface MonitoringEvent {
  type: string;
  timestamp: number;
  data: any;
  userId?: string;
  sessionId: string;
}

interface ErrorEvent {
  error: string;
  stack?: string;
  context: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
}

class MonitoringService {
  private events: MonitoringEvent[] = [];
  private errors: ErrorEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring() {
    // Track page views
    if (typeof window !== "undefined") {
      this.trackEvent("page_view", {
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      });

      // Track wallet connections
      this.trackWalletEvents();
      
      // Track game interactions
      this.trackGameEvents();
      
      // Track errors
      this.trackErrors();
    }
  }

  private trackWalletEvents() {
    // Monitor wallet connection attempts
    const originalConnect = window.ethereum?.request;
    if (originalConnect) {
      window.ethereum.request = async (...args: any[]) => {
        try {
          const result = await originalConnect.apply(window.ethereum, args);
          this.trackEvent("wallet_connection_success", {
            method: args[0]?.method,
            timestamp: Date.now()
          });
          return result;
        } catch (error) {
          this.trackEvent("wallet_connection_error", {
            method: args[0]?.method,
            error: error.message,
            timestamp: Date.now()
          });
          throw error;
        }
      };
    }
  }

  private trackGameEvents() {
    // Monitor game entry attempts
    if (typeof window !== "undefined") {
      const originalFetch = window.fetch;
      window.fetch = async (...args: any[]) => {
        const url = args[0];
        if (typeof url === "string" && url.includes("/api/game")) {
          this.trackEvent("game_interaction", {
            url,
            timestamp: Date.now()
          });
        }
        return originalFetch.apply(window, args);
      };
    }
  }

  private trackErrors() {
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        this.trackError("javascript_error", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack
        });
      });

      window.addEventListener("unhandledrejection", (event) => {
        this.trackError("unhandled_promise_rejection", {
          reason: event.reason,
          promise: event.promise
        });
      });
    }
  }

  public trackEvent(type: string, data: any, userId?: string) {
    const event: MonitoringEvent = {
      type,
      timestamp: Date.now(),
      data,
      userId,
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  public trackError(context: string, errorData: any, userId?: string) {
    const error: ErrorEvent = {
      error: errorData.message || "Unknown error",
      stack: errorData.stack,
      context,
      userId,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    this.errors.push(error);
    this.sendToErrorTracking(error);
  }

  public trackGameEntry(userId: string, gameType: "daily" | "weekly", referralCode?: string) {
    this.trackEvent("game_entry", {
      gameType,
      referralCode,
      timestamp: Date.now()
    }, userId);
  }

  public trackWalletConnection(walletType: string, success: boolean, error?: string) {
    this.trackEvent("wallet_connection", {
      walletType,
      success,
      error,
      timestamp: Date.now()
    });
  }

  public trackReferralCreation(userId: string, referralCode: string) {
    this.trackEvent("referral_created", {
      referralCode,
      timestamp: Date.now()
    }, userId);
  }

  public trackReferralUsage(referrerId: string, newUserId: string, referralCode: string) {
    this.trackEvent("referral_used", {
      referrerId,
      newUserId,
      referralCode,
      timestamp: Date.now()
    });
  }

  public trackAdminAction(action: string, adminId: string, details: any) {
    this.trackEvent("admin_action", {
      action,
      details,
      timestamp: Date.now()
    }, adminId);
  }

  private async sendToAnalytics(event: MonitoringEvent) {
    try {
      // Send to analytics service (Sentry, Google Analytics, etc.)
      if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.error("Failed to send analytics:", error);
    }
  }

  private async sendToErrorTracking(error: ErrorEvent) {
    try {
      // Send to error tracking service (Sentry, etc.)
      if (process.env.NEXT_PUBLIC_ERROR_TRACKING_URL) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_TRACKING_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(error),
        });
      }
    } catch (error) {
      console.error("Failed to send error tracking:", error);
    }
  }

  public getMetrics() {
    return {
      totalEvents: this.events.length,
      totalErrors: this.errors.length,
      sessionId: this.sessionId,
      events: this.events.slice(-10), // Last 10 events
      errors: this.errors.slice(-5), // Last 5 errors
    };
  }

  public generateReport() {
    const eventTypes = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorTypes = this.errors.reduce((acc, error) => {
      acc[error.context] = (acc[error.context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.events[0]?.timestamp || 0,
      eventTypes,
      errorTypes,
      totalEvents: this.events.length,
      totalErrors: this.errors.length,
    };
  }
}

// Onchain Analytics
export class OnchainAnalytics {
  private provider: any;

  constructor(provider: any) {
    this.provider = provider;
  }

  public async trackContractInteraction(
    contractAddress: string,
    method: string,
    gasUsed: number,
    success: boolean,
    error?: string
  ) {
    const event = {
      type: "contract_interaction",
      contractAddress,
      method,
      gasUsed,
      success,
      error,
      timestamp: Date.now(),
      blockNumber: await this.provider.getBlockNumber(),
    };

    // Send to onchain analytics
    console.log("📊 Onchain Analytics:", event);
  }

  public async trackGasUsage(method: string, gasUsed: number, gasPrice: number) {
    const cost = gasUsed * gasPrice;
    const event = {
      type: "gas_usage",
      method,
      gasUsed,
      gasPrice,
      cost,
      timestamp: Date.now(),
    };

    console.log("⛽ Gas Usage:", event);
  }

  public async trackJackpotUpdate(dailyJackpot: number, weeklyJackpot: number) {
    const event = {
      type: "jackpot_update",
      dailyJackpot,
      weeklyJackpot,
      timestamp: Date.now(),
    };

    console.log("💰 Jackpot Update:", event);
  }
}

// Initialize monitoring service
export const monitoringService = new MonitoringService();

// Export for use in components
export const trackEvent = (type: string, data: any, userId?: string) => {
  monitoringService.trackEvent(type, data, userId);
};

export const trackError = (context: string, errorData: any, userId?: string) => {
  monitoringService.trackError(context, errorData, userId);
};

export const trackGameEntry = (userId: string, gameType: "daily" | "weekly", referralCode?: string) => {
  monitoringService.trackGameEntry(userId, gameType, referralCode);
};

export const trackWalletConnection = (walletType: string, success: boolean, error?: string) => {
  monitoringService.trackWalletConnection(walletType, success, error);
};

export const getMetrics = () => monitoringService.getMetrics();
export const generateReport = () => monitoringService.generateReport(); 