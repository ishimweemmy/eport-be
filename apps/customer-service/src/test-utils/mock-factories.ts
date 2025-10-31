import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { Repayment } from '@customer-service/modules/loan/entities/repayment.entity';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { EKYCStatus } from '@customer-service/modules/user/enums/kyc-status.enum';
import { EAccountStatus } from '@customer-service/modules/savings/enums/account-status.enum';
import { ESavingsAccountType } from '@customer-service/modules/savings/enums/savings-account-type.enum';
import { EAccountTier } from '@customer-service/modules/savings/enums/account-tier.enum';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { EApprovalStatus } from '@customer-service/modules/loan/enums/approval-status.enum';
import { ERepaymentStatus } from '@customer-service/modules/loan/enums/repayment-status.enum';

/**
 * Type-safe mock factory for User entity
 */
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test@example.com',
  password: 'hashedPassword',
  phoneNumber: '+250788000000',
  status: EUserStatus.ACTIVE,
  role: EUserRole.CUSTOMER,
  lastLogin: null,
  customerId: 'CJ-2025-00001',
  kycStatus: EKYCStatus.VERIFIED,
  kycVerifiedAt: new Date(),
  creditScore: 750,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

/**
 * Type-safe mock factory for CreditAccount entity
 */
export const createMockCreditAccount = (
  overrides?: Partial<CreditAccount>,
): CreditAccount => {
  const defaultUser = createMockUser();
  return {
    id: 'credit-123',
    user: defaultUser,
    accountNumber: 'CA000001',
    creditLimit: 500000,
    availableCredit: 500000,
    totalBorrowed: 0,
    totalRepaid: 0,
    outstandingBalance: 0,
    status: EAccountStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as CreditAccount;
};

/**
 * Type-safe mock factory for SavingsAccount entity
 */
export const createMockSavingsAccount = (
  overrides?: Partial<SavingsAccount>,
): SavingsAccount => {
  const defaultUser = createMockUser();
  return {
    id: 'savings-123',
    accountNumber: 'SA000001',
    accountType: ESavingsAccountType.REGULAR,
    tier: EAccountTier.BASIC,
    user: defaultUser,
    balance: 100000,
    accruedInterest: 0,
    interestRate: 5.0,
    status: EAccountStatus.ACTIVE,
    currency: 'RWF',
    lastInterestCalculationDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as SavingsAccount;
};

/**
 * Type-safe mock factory for Loan entity
 */
export const createMockLoan = (overrides?: Partial<Loan>): Loan => {
  const mockUser = overrides?.user || createMockUser();
  return {
    id: 'loan-123',
    loanNumber: 'LN000001',
    user: mockUser,
    creditAccount:
      overrides?.creditAccount || createMockCreditAccount({ user: mockUser }),
    savingsAccount:
      overrides?.savingsAccount || createMockSavingsAccount({ user: mockUser }),
    principalAmount: 100000,
    interestRate: 8.0,
    tenorMonths: 6,
    totalAmount: 108000,
    outstandingAmount: 108000,
    status: ELoanStatus.PENDING,
    approvalStatus: EApprovalStatus.PENDING_REVIEW,
    requestedAt: new Date(),
    approvedAt: null,
    approvedBy: null,
    rejectionReason: null,
    disbursedAt: null,
    dueDate: null,
    purpose: 'Business expansion',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as Loan;
};

/**
 * Type-safe mock factory for Repayment entity
 */
export const createMockRepayment = (
  overrides?: Partial<Repayment>,
): Repayment => {
  const defaultLoan = createMockLoan();
  return {
    id: 'repayment-123',
    loan: defaultLoan,
    savingsAccount: null,
    transaction: null,
    scheduleNumber: 1,
    dueDate: new Date(),
    dueAmount: 18000,
    amountPaid: 18000,
    status: ERepaymentStatus.PAID,
    paidAt: new Date(),
    lateFee: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as Repayment;
};
