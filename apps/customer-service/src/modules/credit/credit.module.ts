import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditAccount } from './entities/credit-account.entity';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { User } from '../user/entities/user.entity';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([CreditAccount, User]), ExceptionModule],
  controllers: [CreditController],
  providers: [CreditService],
  exports: [CreditService],
})
export class CreditModule {}
