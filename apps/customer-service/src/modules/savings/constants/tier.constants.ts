import { EAccountTier } from '../enums/account-tier.enum';

export const TIER_LIMITS = {
  [EAccountTier.BASIC]: {
    dailyWithdrawal: 50000,
    monthlyWithdrawal: 500000,
    dailyDeposit: 100000,
    interestRate: 5.0,
  },
  [EAccountTier.SILVER]: {
    dailyWithdrawal: 200000,
    monthlyWithdrawal: 2000000,
    dailyDeposit: 500000,
    interestRate: 5.5,
  },
  [EAccountTier.GOLD]: {
    dailyWithdrawal: 1000000,
    monthlyWithdrawal: 10000000,
    dailyDeposit: 2000000,
    interestRate: 6.0,
  },
  [EAccountTier.PLATINUM]: {
    dailyWithdrawal: 5000000,
    monthlyWithdrawal: 50000000,
    dailyDeposit: 10000000,
    interestRate: 7.0,
  },
};
