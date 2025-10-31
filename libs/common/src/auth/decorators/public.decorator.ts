import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@app/common/auth/constants/auth.constants';

/**
 * Marks a route as public (skips authentication)
 * Use on controllers or individual routes
 *
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * async login() { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
