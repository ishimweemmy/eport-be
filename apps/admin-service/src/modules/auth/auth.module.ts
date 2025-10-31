import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from '@admin-service/modules/auth/auth.controller';
import { AdminAuthService } from '@admin-service/modules/auth/auth.service';
import { AdminUserModule } from '@admin-service/modules/user/user.module';
import { AdminUserService } from '@admin-service/modules/user/user.service';
import { AdminConfigModule } from '@admin-service/configs/admin-config.module';
import { AdminConfigService } from '@admin-service/configs/admin-config.service';
import {
  AuthCommonModule,
  JwtAuthGuard,
  USER_LOADER,
  AUTH_CONFIG,
} from '@app/common/auth';

@Module({
  imports: [
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
    AuthCommonModule,
    forwardRef(() => AdminUserModule),
  ],
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    // Provide USER_LOADER for shared guards
    {
      provide: USER_LOADER,
      useExisting: AdminUserService,
    },
    // Provide AUTH_CONFIG for shared guards
    {
      provide: AUTH_CONFIG,
      useExisting: AdminConfigService,
    },
    // Instantiate shared JwtAuthGuard
    JwtAuthGuard,
  ],
  exports: [AdminAuthService, USER_LOADER, AUTH_CONFIG, JwtAuthGuard],
})
export class AdminAuthModule {}
