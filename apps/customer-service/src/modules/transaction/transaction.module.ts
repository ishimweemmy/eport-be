import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { User } from '../user/entities/user.entity';
import { SavingsAccount } from '../savings/entities/savings-account.entity';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, SavingsAccount]),
    ExceptionModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
