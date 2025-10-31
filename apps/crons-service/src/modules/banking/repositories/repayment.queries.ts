import { Repository, LessThan } from 'typeorm';
import { Repayment } from '@customer-service/modules/loan/entities/repayment.entity';
import { ERepaymentStatus } from '@customer-service/modules/loan/enums/repayment-status.enum';

export class RepaymentQueries {
  constructor(private readonly repaymentRepository: Repository<Repayment>) {}

  async findOverdueRepayments(today: Date): Promise<Repayment[]> {
    return this.repaymentRepository.find({
      where: {
        status: ERepaymentStatus.SCHEDULED,
        dueDate: LessThan(today),
      },
      relations: ['loan', 'loan.user'],
    });
  }

  async findOverdueRepaymentsWithStatus(): Promise<Repayment[]> {
    return this.repaymentRepository.find({
      where: { status: ERepaymentStatus.OVERDUE },
      relations: ['loan', 'loan.user'],
    });
  }

  async findUpcomingRepayments(targetDate: Date): Promise<Repayment[]> {
    return this.repaymentRepository
      .createQueryBuilder('repayment')
      .leftJoinAndSelect('repayment.loan', 'loan')
      .leftJoinAndSelect('loan.user', 'user')
      .leftJoinAndSelect('loan.savingsAccount', 'savingsAccount')
      .where('repayment.status = :status', {
        status: ERepaymentStatus.SCHEDULED,
      })
      .andWhere('DATE(repayment.dueDate) = DATE(:targetDate)', {
        targetDate: targetDate.toISOString().split('T')[0],
      })
      .getMany();
  }
}
