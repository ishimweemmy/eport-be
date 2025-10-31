import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injects the authenticated user into the route handler
 * User is attached to request by AuthGuard
 *
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
