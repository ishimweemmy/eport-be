import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from '@app/common/auth/services/password.service';
import { TokenService } from '@app/common/auth/services/token.service';

/**
 * Shared Authentication Module
 * Provides common auth utilities (services only - guards are registered per service)
 *
 * Guards (JwtAuthGuard, RolesGuard) are exported as classes but NOT instantiated here.
 * Services must register them with proper USER_LOADER and AUTH_CONFIG providers.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [AuthCommonModule],
 *   providers: [
 *     // Provide dependencies for guards
 *     {
 *       provide: USER_LOADER,
 *       useExisting: UserService,
 *     },
 *     {
 *       provide: AUTH_CONFIG,
 *       useExisting: CoreServiceConfigService,
 *     },
 *     // Register guard as global or controller-level
 *     {
 *       provide: APP_GUARD,
 *       useClass: JwtAuthGuard,
 *     },
 *   ],
 * })
 * export class YourAuthModule {}
 * ```
 */
@Global()
@Module({
  imports: [JwtModule.register({})], // Empty config, services will override
  providers: [
    // Only instantiate services here (they don't need service-specific deps)
    PasswordService,
    TokenService,
  ],
  exports: [
    // Export services
    PasswordService,
    TokenService,
    JwtModule,
    // Note: Guards are exported from index.ts as classes, not instantiated here
  ],
})
export class AuthCommonModule {}
