import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/filters/exception.filters';
import { LoggerModule } from '@app/common/logger/logger.module';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { CronsConfigModule } from '@crons-service/configs/crons-config.module';
import { CronsConfigService } from '@crons-service/configs/crons-config.service';
import { HealthModule } from '@app/common/health/health.module';
import { BankingModule } from '@crons-service/modules/banking/banking.module';
import { NotificationModule } from '@crons-service/integrations/notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CronsConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [CronsConfigModule],
      inject: [CronsConfigService],
      useFactory: async (configService: CronsConfigService) =>
        configService.getPostgresInfo(),
    }),
    LoggerModule,
    HealthModule,
    ExceptionModule,
    NotificationModule,
    BankingModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class CronsModule {}
