import { TIME } from '../constants/banking.constants';

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(
  fromDate: Date,
  toDate: Date = new Date(),
): number {
  return Math.floor((toDate.getTime() - fromDate.getTime()) / TIME.MS_PER_DAY);
}

/**
 * Calculate months between two dates
 */
export function calculateMonthsBetween(
  fromDate: Date,
  toDate: Date = new Date(),
): number {
  return Math.floor(
    (toDate.getTime() - fromDate.getTime()) / TIME.MS_PER_MONTH,
  );
}

/**
 * Check if date is last day of month
 */
export function isLastDayOfMonth(date: Date): boolean {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.getDate() === 1;
}

/**
 * Calculate duration in seconds
 */
export function calculateDurationSeconds(startTime: number): string {
  return ((Date.now() - startTime) / TIME.MS_PER_SECOND).toFixed(1);
}

/**
 * Get month name from date
 */
export function getMonthName(date: Date): string {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
