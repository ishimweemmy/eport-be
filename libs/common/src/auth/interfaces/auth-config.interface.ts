/**
 * Interface for auth configuration
 * Each service should implement this to provide JWT secrets
 */
export interface IAuthConfig {
  /**
   * JWT secret for access tokens
   */
  jwtSecret: string;

  /**
   * JWT secret for refresh tokens (optional)
   */
  jwtRefreshSecret?: string;
}

/**
 * Provider token for auth config
 * Services should provide their ConfigService using this token
 */
export const AUTH_CONFIG = Symbol('AUTH_CONFIG');
