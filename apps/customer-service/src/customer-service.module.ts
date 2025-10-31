import { UserModule } from './modules/user/user.module';
import { CoreServiceConfigModule } from './configs/customer-service-config.module';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/filters/exception.filters';
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/common/logger/logger.module';
import { HealthModule } from '@app/common/health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from './integrations/notification/notification.module';
import { MinioClientModule } from './modules/minio-client/minio-client.module';
import { REDIS_CONST } from './common/constants/all.constants';
import { BrainModule } from '@app/common/brain/brain.module';
import { DataSourceService } from '@app/common/database/data-source.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SavingsModule } from './modules/savings/savings.module';
import { CreditModule } from './modules/credit/credit.module';
import { LoanModule } from './modules/loan/loan.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { CoreServiceConfigService } from './configs/customer-service-config.service';
import { JwtAuthGuard, RolesGuard } from '@app/common/auth';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CoreServiceConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [CoreServiceConfigModule],
      inject: [CoreServiceConfigService],
      useFactory: async (appConfigService: CoreServiceConfigService) =>
        appConfigService.getPostgresInfo(),
    }),
    BrainModule.forRootAsync({
      inject: [CoreServiceConfigService],
      useFactory: async (appConfigService: CoreServiceConfigService) => ({
        appPrefix: REDIS_CONST.APP_PREFIX,
        redisConfig: appConfigService.getRedisInfo(),
      }),
    }),
    LoggerModule,
    UserModule,
    HealthModule,
    ExceptionModule,
    AuthModule,
    JwtModule,
    NotificationModule,
    MinioClientModule,
    SavingsModule,
    CreditModule,
    LoanModule,
    TransactionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    DataSourceService,
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class CoreServiceModule {}
