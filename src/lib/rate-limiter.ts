// src/lib/rate-limiter.ts
// Removed 'use server' directive - this is a server-side utility, not a Server Action module.

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
  warning?: string; // Warning message if limits are close
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
   * Checks if a request is allowed based on current limits and records it if allowed.
   * @returns An object indicating if the request is allowed, a potential warning, and a suggested delay if not allowed.
   */
  public requestPermission(): RequestPermissionResult {
    const now = Date.now();
    this.cleanupTimestamps(now);

    const hourlyCount = this.hourlyRequestTimestamps.length;
    const dailyCount = this.dailyRequestTimestamps.length;

    // Check limits
    if (hourlyCount >= this.hourlyLimit) {
      console.warn(
        `Rate Limit Exceeded: Hourly limit of ${this.hourlyLimit} reached.`
      );
      return {
        allowed: false,
        delayMs: this.calculateDelay('hourly', now),
      };
    }
    if (dailyCount >= this.dailyLimit) {
      console.warn(
        `Rate Limit Exceeded: Daily limit of ${this.dailyLimit} reached.`
      );
      return { allowed: false, delayMs: this.calculateDelay('daily', now) };
    }

    // Check warning thresholds
    let warning: string | undefined;
    if (hourlyCount >= this.warningThresholdHourly) {
      warning = `Rate Limit Warning: Approaching hourly limit (${hourlyCount}/${this.hourlyLimit}).`;
      console.warn(warning);
    }
    if (dailyCount >= this.warningThresholdDaily) {
      const dailyWarning = `Rate Limit Warning: Approaching daily limit (${dailyCount}/${this.dailyLimit}).`;
      console.warn(dailyWarning);
      warning = warning ? `${warning} ${dailyWarning}` : dailyWarning;
    }

    // Allow and record request
    this.hourlyRequestTimestamps.push(now);
    this.dailyRequestTimestamps.push(now);

    console.log(`Rate Limiter: Request allowed. Counts - Hourly: ${hourlyCount + 1}/${this.hourlyLimit}, Daily: ${dailyCount + 1}/${this.dailyLimit}`);


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

             if (permission.warning) {
                console.warn("Rate Limiter Warning:", permission.warning);
                // Optionally handle the warning further if needed (e.g., slow down subsequent requests proactively)
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
