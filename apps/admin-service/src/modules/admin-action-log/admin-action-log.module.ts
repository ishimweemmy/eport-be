import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminActionLog } from '@admin-service/modules/admin-action-log/entities/admin-action-log.entity';
import { AdminActionLogService } from '@admin-service/modules/admin-action-log/admin-action-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminActionLog])],
  providers: [AdminActionLogService],
  exports: [AdminActionLogService],
})
export class AdminActionLogModule {}
