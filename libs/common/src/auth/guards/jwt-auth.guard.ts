import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _401 } from '@app/common/constants/errors-constants';
import { IS_PUBLIC_KEY } from '@app/common/auth/constants/auth.constants';
import {
  IUserLoader,
  USER_LOADER,
} from '@app/common/auth/interfaces/user-loader.interface';
import {
  IAuthConfig,
  AUTH_CONFIG,
} from '@app/common/auth/interfaces/auth-config.interface';
import { handleTokenError } from '@app/common/auth/helpers/token-error.helper';

/**
 * JWT Authentication Guard
 * Validates JWT tokens and attaches authenticated user to request
 * Skips routes marked with @Public() decorator
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly exceptionHandler: ExceptionHandler,
    @Inject(USER_LOADER)
    private readonly userLoader: IUserLoader,
    @Inject(AUTH_CONFIG)
    private readonly authConfig: IAuthConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
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
      // Verify JWT token
      const decodedToken = this.jwtService.verify(token, {
        secret: this.authConfig.jwtSecret,
      });

      // Load user from database
      const user = await this.userLoader.findById(decodedToken.id);

      // Attach user to request
      request.user = user;

      return true;
    } catch (error) {
      handleTokenError(error, this.exceptionHandler);
    }
  }
}
