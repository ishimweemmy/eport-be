import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _401 } from '@app/common/constants/errors-constants';
import { IS_PUBLIC_KEY } from '@customer-service/common/constants/all.constants';
import { UserService } from '@customer-service/modules/user/user.service';
import { CoreServiceConfigService } from '@customer-service/configs/customer-service-config.service';
import { handleTokenError } from './helper';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly userService: UserService,
    private readonly confingService: CoreServiceConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token)
      this.exceptionHandler.throwUnauthorized(_401.AUTH_INVALID_TOKEN);

    if (!token.startsWith('Bearer ')) {
      this.exceptionHandler.throwUnauthorized(_401.MALFORMED_TOKEN);
    }
    const tokenValue = token.split(' ')[1];
    try {
      const decodedToken = this.jwtService.verify(tokenValue, {
        secret: this.confingService.jwtSecret,
      });
      const user = await this.userService.findById(decodedToken.id);
      request.user = user;
    } catch (error) {
      handleTokenError(error, this.exceptionHandler);
    }
    return true;
  }
}
