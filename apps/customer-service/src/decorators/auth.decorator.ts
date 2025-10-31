import { SetMetadata } from '@nestjs/common';
import { CURRENT_USER_KEY } from '@app/common/auth/constants/auth.constants';

// Re-export shared auth decorators
export { PreAuthorize, CurrentUser } from '@app/common/auth';

/**
 * Method decorator to mark routes that require authentication
 * Use on individual routes to ensure user is logged in
 *
 * @deprecated Use @CurrentUser() parameter decorator instead for extracting user
 * This decorator is kept for backward compatibility with existing code
 */
export const AuthUser = () => SetMetadata(CURRENT_USER_KEY, true);
