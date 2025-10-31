import { Module, forwardRef } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { SavingsModule } from '../savings/savings.module';
import { CreditModule } from '../credit/credit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => SavingsModule),
    forwardRef(() => CreditModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService, ExceptionHandler],
  exports: [UserService],
})
export class UserModule {}
