import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironmentVariables } from './config-validation';
import { CoreServiceConfigService } from './customer-service-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironmentVariables,
      envFilePath: './apps/customer-service/.env',
    }),
  ],
  providers: [ConfigService, CoreServiceConfigService],
  exports: [ConfigService, CoreServiceConfigService],
})
export class CoreServiceConfigModule {}
