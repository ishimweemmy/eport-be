import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsAccount } from './entities/savings-account.entity';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';
import { User } from '../user/entities/user.entity';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { TransactionModule } from '../transaction/transaction.module';
import { NotificationModule } from '../../integrations/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavingsAccount, User]),
    ExceptionModule,
    forwardRef(() => TransactionModule),
    NotificationModule,
  ],
  controllers: [SavingsController],
  providers: [SavingsService],
  exports: [SavingsService],
})
export class SavingsModule {}
