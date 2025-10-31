import { User } from '@customer-service/modules/user/entities/user.entity';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { EKYCStatus } from '@customer-service/modules/user/enums/kyc-status.enum';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { EApprovalStatus } from '@customer-service/modules/loan/enums/approval-status.enum';
import { ESavingsAccountType } from '@customer-service/modules/savings/enums/savings-account-type.enum';
import { EAccountStatus } from '@customer-service/modules/savings/enums/account-status.enum';
import { EAccountTier } from '@customer-service/modules/savings/enums/account-tier.enum';

export const createMockAdmin = (overrides?: Partial<User>): User => ({
  id: 'admin-123',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@creditjambo.com',
  password: 'hashedPassword123',
  phoneNumber: '+250788000000',
  status: EUserStatus.ACTIVE,
  role: EUserRole.ADMIN,
  lastLogin: null,
  customerId: null,
  kycStatus: EKYCStatus.VERIFIED,
  kycVerifiedAt: new Date(),
  creditScore: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

export const createMockCustomer = (overrides?: Partial<User>): User => ({
  id: 'customer-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'customer@example.com',
  password: 'hashedPassword',
  phoneNumber: '+250788111111',
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

export const createMockCreditAccount = (
  overrides?: Partial<CreditAccount>,
): CreditAccount => ({
  id: 'credit-123',
  user: createMockCustomer(),
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
  lastLogin: null,
  ...overrides,
});

export const createMockSavingsAccount = (
  overrides?: Partial<SavingsAccount>,
): SavingsAccount => ({
  id: 'savings-123',
  accountNumber: 'SA000001',
  accountType: ESavingsAccountType.REGULAR,
  tier: EAccountTier.BASIC,
  user: createMockCustomer(),
  balance: 100000,
  accruedInterest: 0,
  interestRate: 5.0,
  status: EAccountStatus.ACTIVE,
  currency: 'RWF',
  lastInterestCalculationDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  lastLogin: null,
  ...overrides,
});

export const createMockLoan = (overrides?: Partial<Loan>): Loan => ({
  id: 'loan-123',
  loanNumber: 'LN000001',
  user: createMockCustomer(),
  creditAccount: createMockCreditAccount(),
  savingsAccount: createMockSavingsAccount(),
  principalAmount: 100000,
  interestRate: 8.0,
  totalAmount: 108000,
  tenorMonths: 6,
  status: ELoanStatus.PENDING,
  approvalStatus: EApprovalStatus.PENDING_REVIEW,
  outstandingAmount: 108000,
  requestedAt: new Date(),
  approvedAt: null,
  disbursedAt: null,
  dueDate: new Date(),
  approvedBy: null,
  purpose: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  lastLogin: null,
  ...overrides,
});
