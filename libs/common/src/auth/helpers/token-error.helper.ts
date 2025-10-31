import { _401 } from '@app/common/constants/errors-constants';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';

/**
 * Handle JWT token validation errors
 * Throws appropriate exceptions based on error type
 */
export function handleTokenError(
  error: any,
  exceptionHandler: ExceptionHandler,
): never {
  if (error.name === 'TokenExpiredError') {
    throw exceptionHandler.throwUnauthorized(_401.TOKEN_EXPIRED);
  } else if (error.name === 'JsonWebTokenError') {
    throw exceptionHandler.throwUnauthorized(_401.MALFORMED_TOKEN);
  } else {
    throw exceptionHandler.throwUnauthorized(_401.AUTH_INVALID_TOKEN);
  }
}
