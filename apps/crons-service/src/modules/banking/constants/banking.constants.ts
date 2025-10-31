// Re-export TIER_LIMITS from customer-service to avoid duplication
export { TIER_LIMITS } from '@customer-service/modules/savings/constants/tier.constants';

// Interest calculation
export const DAYS_IN_YEAR = 365;

// Late fee calculation
export const LATE_FEE = {
  GRACE_PERIOD_DAYS: 7,
  LATE_FEE_START_DAY: 8,
  DEFAULT_THRESHOLD_DAYS: 31,
  FIXED_FEE: 1000,
  PERCENTAGE_RATE: 0.02,
  MAX_CAP_PERCENTAGE: 0.05,
};

// Credit score
export const CREDIT_SCORE = {
  DEFAULT_PENALTY: 50,
  MIN_SCORE: 0,
};

// Tier upgrade thresholds
export const TIER_UPGRADE = {
  EVALUATION_PERIOD_DAYS: 90,
  SILVER: {
    MIN_BALANCE: 500000,
    MIN_ACCOUNT_AGE_MONTHS: 0,
  },
  GOLD: {
    MIN_BALANCE: 2000000,
    MIN_ACCOUNT_AGE_MONTHS: 6,
  },
  PLATINUM: {
    MIN_BALANCE: 10000000,
    MIN_ACCOUNT_AGE_MONTHS: 12,
  },
};

// Repayment reminder
export const REPAYMENT_REMINDER = {
  DAYS_BEFORE_DUE: 3,
};

// Date/time conversion constants
export const TIME = {
  MS_PER_SECOND: 1000,
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  MS_PER_MONTH: 1000 * 60 * 60 * 24 * 30,
};
