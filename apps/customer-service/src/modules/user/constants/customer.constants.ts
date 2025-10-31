/**
 * Customer-related constants for Credit Jambo
 */

export const CUSTOMER_DEFAULTS = {
  /**
   * Initial credit score for new customers
   * Range: 200-850 (typical credit scoring range)
   * 300 = Neutral starting point
   */
  INITIAL_CREDIT_SCORE: 300,

  /**
   * Initial credit limit for new customers (in RWF)
   * Provides basic borrowing capacity for new users
   */
  INITIAL_CREDIT_LIMIT: 50000, // 50,000 RWF

  /**
   * Minimum credit score allowed in the system
   */
  MIN_CREDIT_SCORE: 200,

  /**
   * Maximum credit score allowed in the system
   */
  MAX_CREDIT_SCORE: 850,
} as const;

export const CREDIT_SCORE_RANGES = {
  POOR: { min: 200, max: 299 },
  FAIR: { min: 300, max: 499 },
  GOOD: { min: 500, max: 699 },
  EXCELLENT: { min: 700, max: 850 },
} as const;
