import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '@app/common/auth/constants/auth.constants';

/**
 * Restricts route access to specific roles
 * Used with RolesGuard for role-based access control
 *
 * @param roles - Array of allowed roles
 *
 * @example
 * ```typescript
 * @PreAuthorize(EUserRole.ADMIN, EUserRole.SUPER_ADMIN)
 * @Get('admin/dashboard')
 * async getDashboard() { ... }
 * ```
 */
export const PreAuthorize = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
