import { DAYS_IN_YEAR } from '../constants/banking.constants';

/**
 * Calculate daily interest for savings account
 */
export function calculateDailyInterest(
  balance: number,
  annualRatePercent: number,
): number {
  const rate = annualRatePercent / 100;
  return (balance * rate) / DAYS_IN_YEAR;
}

/**
 * Calculate average balance from snapshots
 */
export function calculateAverageBalance(balances: number[]): number {
  if (balances.length === 0) return 0;
  return balances.reduce((sum, bal) => sum + bal, 0) / balances.length;
}
