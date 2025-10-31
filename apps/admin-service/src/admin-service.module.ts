import { AdminConfigModule } from '@admin-service/configs/admin-config.module';
import { AdminConfigService } from '@admin-service/configs/admin-config.service';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/filters/exception.filters';
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/common/logger/logger.module';
import { HealthModule } from '@app/common/health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSourceService } from '@app/common/database/data-source.service';
import { NotificationGrpcModule } from '@admin-service/integrations/notification/notification-grpc.module';
import { AdminActionLogModule } from '@admin-service/modules/admin-action-log/admin-action-log.module';
import { LoanManagementModule } from '@admin-service/modules/loan-management/loan-management.module';
import { CustomerManagementModule } from '@admin-service/modules/customer-management/customer-management.module';
import { TransactionManagementModule } from '@admin-service/modules/transaction-management/transaction-management.module';
import { AnalyticsModule } from '@admin-service/modules/analytics/analytics.module';
import { AdminAuthModule } from '@admin-service/modules/auth/auth.module';
import { AdminUserModule } from '@admin-service/modules/user/user.module';
import { JwtAuthGuard, RolesGuard } from '@app/common/auth';
import { BrainModule } from '@app/common/brain/brain.module';
import { REDIS_CONST } from '@admin-service/common/constants/all.constants';

@Module({
  imports: [
    AdminConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AdminConfigModule],
      inject: [AdminConfigService],
      useFactory: async (appConfigService: AdminConfigService) =>
        appConfigService.getPostgresInfo(),
    }),
    JwtModule.registerAsync({
      imports: [AdminConfigModule],
      inject: [AdminConfigService],
      useFactory: async (configService: AdminConfigService) => ({
        secret: configService.jwtSecretKey,
        signOptions: {
          expiresIn: configService.jwtExpiryTime,
        },
      }),
    }),
    BrainModule.forRootAsync({
      inject: [AdminConfigService],
      useFactory: async (configService: AdminConfigService) => ({
        appPrefix: REDIS_CONST.APP_PREFIX,
        redisConfig: configService.getRedisInfo(),
      }),
    }),
    NotificationGrpcModule,
    AdminAuthModule,
    AdminUserModule,
    AdminActionLogModule,
    LoanManagementModule,
    CustomerManagementModule,
    TransactionManagementModule,
    AnalyticsModule,
    LoggerModule,
    HealthModule,
    ExceptionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    DataSourceService,
    // Register JwtAuthGuard globally (from AdminAuthModule)
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    // Register RolesGuard globally
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AdminServiceModule {}
