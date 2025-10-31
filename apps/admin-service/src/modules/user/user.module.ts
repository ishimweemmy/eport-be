import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { AdminUserService } from '@admin-service/modules/user/user.service';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ExceptionModule],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
