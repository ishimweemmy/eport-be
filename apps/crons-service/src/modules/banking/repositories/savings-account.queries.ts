import { Repository } from 'typeorm';
import { SavingsAccount } from '@customer-service/modules/savings/entities/savings-account.entity';
import { EAccountStatus } from '@customer-service/modules/savings/enums/account-status.enum';

export class SavingsAccountQueries {
  constructor(
    private readonly savingsAccountRepository: Repository<SavingsAccount>,
  ) {}

  async findActiveSavingsAccounts(): Promise<SavingsAccount[]> {
    return this.savingsAccountRepository.find({
      where: { status: EAccountStatus.ACTIVE },
      relations: ['user'],
    });
  }
}
