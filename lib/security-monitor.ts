// Enhanced security monitoring system
export interface SecurityEvent {
  timestamp: number;
  action: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SuspiciousActivity {
  userId: string;
  reason: string;
  timestamp: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventCount: number;
  details: any;
}

export interface UserAction {
  type: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private securityEvents: SecurityEvent[] = [];
  private suspiciousActivities: SuspiciousActivity[] = [];
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();
  private maxEvents = 10000; // Prevent memory leaks
  private maxSuspiciousActivities = 1000;

  // Rate limiting configuration
  private readonly RATE_LIMITS = {
    GAME_ENTRY: { max: 10, window: 24 * 60 * 60 * 1000 }, // 10 per day
    WALLET_CONNECTION: { max: 5, window: 60 * 1000 }, // 5 per minute
    API_CALL: { max: 100, window: 60 * 1000 }, // 100 per minute
    REFERRAL_CREATION: { max: 3, window: 24 * 60 * 60 * 1000 }, // 3 per day
    PRIZE_CLAIM: { max: 5, window: 60 * 60 * 1000 } // 5 per hour
  };

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  trackUserAction(action: UserAction): void {
    const event: SecurityEvent = {
      timestamp: Date.now(),
      action: action.type,
      userId: action.userId,
      ipAddress: action.ipAddress,
      userAgent: action.userAgent,
      metadata: action.metadata,
      severity: this.calculateSeverity(action)
    };

    this.securityEvents.push(event);
    
    // Prevent memory leaks
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxEvents);
    }

    this.analyzeForSuspiciousActivity(event);
    this.checkRateLimits(action);
  }

  private calculateSeverity(action: UserAction): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const highRiskActions = ['GAME_ENTRY', 'PRIZE_CLAIM', 'WALLET_CONNECTION'];
    const criticalActions = ['ADMIN_ACTION', 'EMERGENCY_PAUSE'];
    
    if (criticalActions.includes(action.type)) {
      return 'CRITICAL';
    } else if (highRiskActions.includes(action.type)) {
      return 'HIGH';
    } else if (action.type.includes('ERROR') || action.type.includes('FAILED')) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  private analyzeForSuspiciousActivity(event: SecurityEvent): void {
    const userId = event.userId;
    const now = Date.now();
    const timeWindow = 60 * 60 * 1000; // 1 hour

    // Get recent events for this user
    const recentEvents = this.securityEvents.filter(
      e => e.userId === userId && e.timestamp > now - timeWindow
    );

    // Check for rate limiting violations
    if (recentEvents.length > 50) {
      this.flagSuspiciousActivity(userId, 'HIGH_ACTIVITY_VOLUME', {
        eventCount: recentEvents.length,
        timeWindow: '1 hour'
      });
    }

    // Check for unusual patterns
    const errorEvents = recentEvents.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL');
    if (errorEvents.length > 10) {
      this.flagSuspiciousActivity(userId, 'HIGH_ERROR_RATE', {
        errorCount: errorEvents.length,
        totalEvents: recentEvents.length
      });
    }

    // Check for rapid wallet connections
    const walletConnections = recentEvents.filter(e => e.action === 'WALLET_CONNECTION');
    if (walletConnections.length > 5) {
      this.flagSuspiciousActivity(userId, 'RAPID_WALLET_CONNECTIONS', {
        connectionCount: walletConnections.length,
        timeWindow: '1 hour'
      });
    }

    // Check for multiple game entries
    const gameEntries = recentEvents.filter(e => e.action === 'GAME_ENTRY');
    if (gameEntries.length > 15) {
      this.flagSuspiciousActivity(userId, 'EXCESSIVE_GAME_ENTRIES', {
        entryCount: gameEntries.length,
        timeWindow: '1 hour'
      });
    }
  }

  private checkRateLimits(action: UserAction): boolean {
    const key = `${action.userId}:${action.type}`;
    const now = Date.now();
    const limit = this.RATE_LIMITS[action.type as keyof typeof this.RATE_LIMITS];

    if (!limit) {
      return true; // No limit for this action type
    }

    const current = this.rateLimitMap.get(key);
    
    if (!current || now > current.resetTime) {
      // Reset or create new rate limit entry
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + limit.window
      });
      return true;
    }

    if (current.count >= limit.max) {
      // Rate limit exceeded
      this.flagSuspiciousActivity(action.userId, 'RATE_LIMIT_EXCEEDED', {
        actionType: action.type,
        limit: limit.max,
        window: limit.window
      });
      return false;
    }

    // Increment count
    current.count++;
    return true;
  }

  private flagSuspiciousActivity(userId: string, reason: string, details: any): void {
    const now = Date.now();
    
    // Check if we already have a recent suspicious activity for this user
    const existingActivity = this.suspiciousActivities.find(
      activity => activity.userId === userId && 
                 activity.reason === reason &&
                 now - activity.timestamp < 24 * 60 * 60 * 1000 // 24 hours
    );

    if (existingActivity) {
      // Update existing activity
      existingActivity.eventCount++;
      existingActivity.details = { ...existingActivity.details, ...details };
      existingActivity.timestamp = now;
    } else {
      // Create new suspicious activity
      const activity: SuspiciousActivity = {
        userId,
        reason,
        timestamp: now,
        severity: this.calculateSuspiciousSeverity(reason),
        eventCount: 1,
        details
      };

      this.suspiciousActivities.push(activity);
    }

    // Prevent memory leaks
    if (this.suspiciousActivities.length > this.maxSuspiciousActivities) {
      this.suspiciousActivities = this.suspiciousActivities.slice(-this.maxSuspiciousActivities);
    }

    this.alertSecurityTeam(userId, reason, details);
  }

  private calculateSuspiciousSeverity(reason: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalReasons = ['RATE_LIMIT_EXCEEDED', 'HIGH_ERROR_RATE'];
    const highReasons = ['HIGH_ACTIVITY_VOLUME', 'EXCESSIVE_GAME_ENTRIES'];
    const mediumReasons = ['RAPID_WALLET_CONNECTIONS'];

    if (criticalReasons.includes(reason)) {
      return 'CRITICAL';
    } else if (highReasons.includes(reason)) {
      return 'HIGH';
    } else if (mediumReasons.includes(reason)) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private alertSecurityTeam(userId: string, reason: string, details: any): void {
    const alert = {
      timestamp: Date.now(),
      userId,
      reason,
      details,
      severity: this.calculateSuspiciousSeverity(reason)
    };

    console.warn('🚨 SECURITY ALERT:', alert);
    
    // Send to external security monitoring if configured
    if (process.env.NEXT_PUBLIC_SECURITY_WEBHOOK) {
      // Send to webhook
      fetch(process.env.NEXT_PUBLIC_SECURITY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      }).catch(error => {
        console.error('Failed to send security alert:', error);
      });
    }
  }

  // Public methods for monitoring
  getSecurityStats(): {
    totalEvents: number;
    suspiciousActivities: number;
    bySeverity: Record<string, number>;
    recentAlerts: SuspiciousActivity[];
  } {
    const bySeverity: Record<string, number> = {};
    
    this.securityEvents.forEach(event => {
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    });

    const recentAlerts = this.suspiciousActivities
      .filter(activity => Date.now() - activity.timestamp < 24 * 60 * 60 * 1000)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      totalEvents: this.securityEvents.length,
      suspiciousActivities: this.suspiciousActivities.length,
      bySeverity,
      recentAlerts
    };
  }

  isUserFlagged(userId: string): boolean {
    const recentSuspicious = this.suspiciousActivities.filter(
      activity => activity.userId === userId &&
                 Date.now() - activity.timestamp < 24 * 60 * 60 * 1000
    );

    return recentSuspicious.some(activity => 
      activity.severity === 'HIGH' || activity.severity === 'CRITICAL'
    );
  }

  getRateLimitStatus(userId: string, actionType: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const key = `${userId}:${actionType}`;
    const limit = this.RATE_LIMITS[actionType as keyof typeof this.RATE_LIMITS];
    
    if (!limit) {
      return { allowed: true, remaining: -1, resetTime: 0 };
    }

    const current = this.rateLimitMap.get(key);
    const now = Date.now();

    if (!current || now > current.resetTime) {
      return { allowed: true, remaining: limit.max, resetTime: now + limit.window };
    }

    return {
      allowed: current.count < limit.max,
      remaining: Math.max(0, limit.max - current.count),
      resetTime: current.resetTime
    };
  }

  clearOldData(): void {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    this.securityEvents = this.securityEvents.filter(
      event => now - event.timestamp < maxAge
    );

    this.suspiciousActivities = this.suspiciousActivities.filter(
      activity => now - activity.timestamp < maxAge
    );

    // Clear old rate limit entries
    for (const [key, value] of this.rateLimitMap.entries()) {
      if (now > value.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
} 