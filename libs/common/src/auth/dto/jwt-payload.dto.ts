/**
 * JWT payload structure
 * Represents the data encoded in the access token
 */
export interface JwtPayload {
  id: string;
  role: string;
  customerId?: string; // Optional - only for customers
  [key: string]: any; // Allow additional custom fields
}

/**
 * Refresh token payload structure
 * Minimal data for refresh token validation
 */
export interface RefreshTokenPayload {
  id: string;
  tokenId: string;
}
