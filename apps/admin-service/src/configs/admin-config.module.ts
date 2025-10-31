import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironmentVariables } from '@admin-service/configs/config-validation';
import { AdminConfigService } from '@admin-service/configs/admin-config.service';
import { CoreServiceConfigService } from '@customer-service/configs/customer-service-config.service';
import { AUTH_CONFIG } from '@app/common/auth';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironmentVariables,
      envFilePath: './apps/admin-service/.env',
    }),
  ],
  providers: [
    ConfigService,
    AdminConfigService,
    {
      provide: CoreServiceConfigService,
      useExisting: AdminConfigService,
    },
    {
      provide: AUTH_CONFIG,
      useExisting: AdminConfigService,
    },
  ],
  exports: [
    ConfigService,
    AdminConfigService,
    CoreServiceConfigService,
    AUTH_CONFIG,
  ],
})
export class AdminConfigModule {}
