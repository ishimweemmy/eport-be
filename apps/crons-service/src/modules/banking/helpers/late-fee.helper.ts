import { LATE_FEE } from '../constants/banking.constants';

/**
 * Calculate late fee based on days overdue and amounts
 */
export function calculateLateFee(
  daysOverdue: number,
  dueAmount: number,
  principalAmount: number,
): number {
  if (
    daysOverdue < LATE_FEE.LATE_FEE_START_DAY ||
    daysOverdue >= LATE_FEE.DEFAULT_THRESHOLD_DAYS
  ) {
    return 0;
  }

  const fixedFee = LATE_FEE.FIXED_FEE;
  const percentageFee = dueAmount * LATE_FEE.PERCENTAGE_RATE;
  const maxCap = principalAmount * LATE_FEE.MAX_CAP_PERCENTAGE;

  return Math.min(Math.max(fixedFee, percentageFee), maxCap);
}
