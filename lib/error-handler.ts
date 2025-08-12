// Centralized error handling system
export interface ErrorLog {
  timestamp: number;
  error: string;
  stack?: string;
  context: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userAgent?: string;
  url?: string;
  metadata?: any;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorLog[] = [];
  private maxLogSize = 1000; // Prevent memory leaks

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error, context: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'): string {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context,
      severity,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    this.errorLog.push(errorLog);
    
    // Prevent memory leaks
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    this.logToMonitoring(errorLog);
    
    // Return user-friendly message based on severity
    return this.getUserFriendlyMessage(error, severity);
  }

  private getUserFriendlyMessage(error: Error, severity: string): string {
    const errorMessages = {
      'INSUFFICIENT_FUNDS': 'Insufficient balance. Please add more ETH to your wallet.',
      'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
      'WALLET_CONNECTION_FAILED': 'Wallet connection failed. Please try again.',
      'CONTRACT_ERROR': 'Smart contract error. Please try again later.',
      'VALIDATION_ERROR': 'Invalid input. Please check your data and try again.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
      'USER_REJECTED': 'Transaction was cancelled by user.',
      'CHAIN_NOT_FOUND': 'Please add Base Mainnet network to your wallet.',
      'DEFAULT': 'An unexpected error occurred. Please try again.'
    };

    // Map error types to user-friendly messages
    for (const [key, message] of Object.entries(errorMessages)) {
      if (error.message.includes(key) || error.message.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }

    return errorMessages.DEFAULT;
  }

  private logToMonitoring(errorLog: ErrorLog) {
    // Send to monitoring service (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined') {
      // Client-side logging
      console.error('Error logged:', errorLog);
      
      // Send to external monitoring if configured
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Sentry integration would go here
        console.log('Sending to Sentry:', errorLog);
      }
    } else {
      // Server-side logging
      console.error('Server error logged:', errorLog);
    }
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.errorLog]; // Return copy to prevent external modification
  }

  clearErrorLogs(): void {
    this.errorLog = [];
  }

  getErrorStats(): { total: number; bySeverity: Record<string, number> } {
    const bySeverity: Record<string, number> = {};
    
    this.errorLog.forEach(log => {
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      bySeverity
    };
  }
} 