// src/lib/rate-limiter.ts

/**
 * @fileOverview In-memory rate limiter to manage API call frequency.
 * Tracks request timestamps to enforce hourly and daily limits.
 */

interface RateLimiterOptions {
  requestsPerHour: number;
  requestsPerDay: number;
  warningThresholdPercent?: number; // Percentage (0-1) of limit remaining to trigger warning
}

interface RequestPermissionResult {
  allowed: boolean;
  delayMs?: number; // Suggested delay in milliseconds if not allowed
  warning?: string; // Warning message if limits are close (generated *before* the request)
}

const DEFAULT_WARNING_THRESHOLD = 0.1; // Warn if less than 10% quota remaining

class RateLimiter {
  private hourlyLimit: number;
  private dailyLimit: number;
  private warningThresholdHourly: number;
  private warningThresholdDaily: number;

  private hourlyRequestTimestamps: number[] = [];
  private dailyRequestTimestamps: number[] = [];

  constructor(options: RateLimiterOptions) {
    this.hourlyLimit = options.requestsPerHour;
    this.dailyLimit = options.requestsPerDay;

    const warningThreshold =
      options.warningThresholdPercent ?? DEFAULT_WARNING_THRESHOLD;
    // Calculate the count at which to start warning (e.g., 90% of limit)
    this.warningThresholdHourly = this.hourlyLimit * (1 - warningThreshold);
    this.warningThresholdDaily = this.dailyLimit * (1 - warningThreshold);
  }

  /**
   * Cleans up outdated timestamps from the tracking arrays.
   * @param now Current timestamp in milliseconds.
   */
  private cleanupTimestamps(now: number): void {
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    this.hourlyRequestTimestamps = this.hourlyRequestTimestamps.filter(
      (ts) => ts > oneHourAgo
    );
    this.dailyRequestTimestamps = this.dailyRequestTimestamps.filter(
      (ts) => ts > oneDayAgo
    );
  }

  /**
   * Calculates the time until the oldest request expires for a given limit type.
   * @param limitType 'hourly' or 'daily'.
   * @param now Current timestamp in milliseconds.
   * @returns Delay in milliseconds.
   */
  private calculateDelay(limitType: 'hourly' | 'daily', now: number): number {
    const timestamps =
      limitType === 'hourly'
        ? this.hourlyRequestTimestamps
        : this.dailyRequestTimestamps;
    const expiryTime =
      limitType === 'hourly' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    if (timestamps.length === 0) {
      return 0; // Should not happen if called after exceeding limit, but safe fallback
    }

    const oldestTimestamp = timestamps[0];
    const timeUntilExpiry = oldestTimestamp + expiryTime - now;
    return Math.max(0, timeUntilExpiry) + 100; // Add a small buffer
  }

   /**
   * Checks if current usage is near or exceeding limits and returns a warning message.
   * This does NOT consume a request quota.
   * @returns A warning message string if thresholds are met, otherwise undefined.
   */
  public checkThresholds(): string | undefined {
    const now = Date.now();
    this.cleanupTimestamps(now);

    const hourlyCount = this.hourlyRequestTimestamps.length;
    const dailyCount = this.dailyRequestTimestamps.length;
    let warning: string | undefined;

    if (hourlyCount >= this.hourlyLimit) {
       warning = `Hourly rate limit exceeded (${hourlyCount}/${this.hourlyLimit}).`;
    } else if (hourlyCount >= this.warningThresholdHourly) {
       warning = `Approaching hourly rate limit (${hourlyCount}/${this.hourlyLimit}).`;
    }

    if (dailyCount >= this.dailyLimit) {
        const dailyWarning = `Daily rate limit exceeded (${dailyCount}/${this.dailyLimit}).`;
         warning = warning ? `${warning} ${dailyWarning}` : dailyWarning;
    } else if (dailyCount >= this.warningThresholdDaily) {
       const dailyWarning = `Approaching daily rate limit (${dailyCount}/${this.dailyLimit}).`;
       warning = warning ? `${warning} ${dailyWarning}` : dailyWarning;
    }

     if (warning) {
        console.warn("Rate Limit Check:", warning);
     }

    return warning;
  }


  /**
   * Checks if a request is allowed based on current limits and records it if allowed.
   * @returns An object indicating if the request is allowed, a potential warning, and a suggested delay if not allowed.
   */
  public requestPermission(): RequestPermissionResult {
    const now = Date.now();
    this.cleanupTimestamps(now);

    const hourlyCount = this.hourlyRequestTimestamps.length;
    const dailyCount = this.dailyRequestTimestamps.length;

    // Check limits first
    if (hourlyCount >= this.hourlyLimit) {
      console.warn(
        `Rate Limit Exceeded: Hourly limit of ${this.hourlyLimit} reached.`
      );
      return {
        allowed: false,
        delayMs: this.calculateDelay('hourly', now),
        warning: `Hourly rate limit exceeded (${hourlyCount}/${this.hourlyLimit}).` // Add warning here too
      };
    }
    if (dailyCount >= this.dailyLimit) {
      console.warn(
        `Rate Limit Exceeded: Daily limit of ${this.dailyLimit} reached.`
      );
      return {
        allowed: false,
        delayMs: this.calculateDelay('daily', now),
        warning: `Daily rate limit exceeded (${dailyCount}/${this.dailyLimit}).` // Add warning here too
       };
    }

    // Check warning thresholds *before* adding the new request
    let warning = this.checkThresholds(); // Use the dedicated check method

    // Allow and record request
    this.hourlyRequestTimestamps.push(now);
    this.dailyRequestTimestamps.push(now);

    console.log(`Rate Limiter: Request allowed. Counts - Hourly: ${hourlyCount + 1}/${this.hourlyLimit}, Daily: ${dailyCount + 1}/${this.dailyLimit}`);

    // Return allowed status and any *pre-request* warning
    return { allowed: true, warning };
  }

   /**
    * Decorator function to wrap an async function with rate limiting.
    * Checks permission *before* executing the function. If rate limited, it waits.
    * @param fn The async function to rate limit.
    * @returns A new async function that respects rate limits.
    */
    public wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T): T {
        const rateLimitedFn = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
            let permission = this.requestPermission();

            while (!permission.allowed) {
                const delayTime = permission.delayMs || 1000; // Default delay if calculation fails
                console.log(`Rate Limiter: Delaying request for ${delayTime}ms due to rate limit.`);
                await delay(delayTime); // Use the exported delay function
                permission = this.requestPermission(); // Re-check after delay
            }

             // Log the warning if one was generated just before this request was allowed
             if (permission.warning) {
                console.warn("Rate Limiter Pre-Request Warning:", permission.warning);
                // Note: This warning is captured *before* the successful request is made.
                // The check after the loop in optimizePortfolio provides the *post-request* status.
             }

             // Permission granted (or obtained after delay), execute the function
            return fn(...args);
        };
        // Casting to T preserves the original function's signature for the caller
        return rateLimitedFn as T;
    }
}

// Initialize a rate limiter instance with yfinance-like limits
// This instance can be imported and used across the application server-side.
const yfinanceRateLimiter = new RateLimiter({
  requestsPerHour: 2000,
  requestsPerDay: 48000,
  warningThresholdPercent: 0.1, // Warn when 10% or less quota remains
});

/**
 * Delays execution for a specified number of milliseconds.
 * @param ms Milliseconds to delay.
 * @returns A promise that resolves after the delay.
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));


export { yfinanceRateLimiter, delay };
export type { RequestPermissionResult };
