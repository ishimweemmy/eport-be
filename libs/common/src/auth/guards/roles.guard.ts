import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _401, _403 } from '@app/common/constants/errors-constants';
import { ROLES_KEY } from '@app/common/auth/constants/auth.constants';
import {
  IAuthConfig,
  AUTH_CONFIG,
} from '@app/common/auth/interfaces/auth-config.interface';
import { handleTokenError } from '@app/common/auth/helpers/token-error.helper';

/**
 * Roles Guard
 * Validates user has required role(s) to access route
 * Used with @PreAuthorize(...roles) decorator
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly exceptionHandler: ExceptionHandler,
    @Inject(AUTH_CONFIG)
    private readonly authConfig: IAuthConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Check for authorization header
    if (!authHeader) {
      this.exceptionHandler.throwUnauthorized(_401.AUTH_INVALID_TOKEN);
    }

    // Validate Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      this.exceptionHandler.throwUnauthorized(_401.MALFORMED_TOKEN);
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify and decode token
      const decodedToken = this.jwtService.verify(token, {
        secret: this.authConfig.jwtSecret,
      });

      // Check if user has required role
      if (requiredRoles.includes(decodedToken.role)) {
        return true;
      }

      // Check for special supervisor flag (if exists)
      if (decodedToken.isUserCoSupervisor) {
        return true;
      }

      // User doesn't have required role
      this.exceptionHandler.throwForbidden(_403.UNAUTHORIZED);
      return false;
    } catch (error) {
      handleTokenError(error, this.exceptionHandler);
    }
  }
}
