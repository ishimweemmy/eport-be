export const CRON_JOBS = {
  INTEREST_ACCRUAL: {
    schedule: '1 0 * * *',
    name: 'interest-accrual',
    timeZone: 'Africa/Kigali',
  },
  LOAN_OVERDUE_CHECK: {
    schedule: '30 0 * * *',
    name: 'loan-overdue-check',
    timeZone: 'Africa/Kigali',
  },
  LATE_FEE_APPLICATION: {
    schedule: '0 1 * * *',
    name: 'late-fee-application',
    timeZone: 'Africa/Kigali',
  },
  LOAN_DEFAULTING: {
    schedule: '0 2 * * *',
    name: 'loan-defaulting',
    timeZone: 'Africa/Kigali',
  },
  TIER_UPGRADE_EVALUATION: {
    schedule: '0 3 1 * *',
    name: 'tier-upgrade-evaluation',
    timeZone: 'Africa/Kigali',
  },
  REPAYMENT_REMINDER: {
    schedule: '0 9 * * *',
    name: 'repayment-reminder',
    timeZone: 'Africa/Kigali',
  },
};
