import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { CoreServiceConfigModule } from '@customer-service/configs/customer-service-config.module';
import { CoreServiceConfigService } from '@customer-service/configs/customer-service-config.service';
import {
  AuthCommonModule,
  JwtAuthGuard,
  USER_LOADER,
  AUTH_CONFIG,
} from '@app/common/auth';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [CoreServiceConfigModule],
      inject: [CoreServiceConfigService],
      useFactory: async (configService: CoreServiceConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: configService.jwtExpiresIn,
        },
      }),
    }),
    AuthCommonModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Provide USER_LOADER for shared guards
    {
      provide: USER_LOADER,
      useExisting: UserService,
    },
    // Provide AUTH_CONFIG for shared guards
    {
      provide: AUTH_CONFIG,
      useExisting: CoreServiceConfigService,
    },
    // Instantiate and register shared JwtAuthGuard
    JwtAuthGuard,
  ],
  exports: [AuthService, USER_LOADER, AUTH_CONFIG, JwtAuthGuard],
})
export class AuthModule {}
