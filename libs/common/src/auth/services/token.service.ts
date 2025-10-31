import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload,
  RefreshTokenPayload,
} from '@app/common/auth/dto/jwt-payload.dto';
import * as crypto from 'crypto';

/**
 * Generic token service
 * Provides JWT token generation and verification utilities
 * Services should inject their own config for secrets and expiry
 */
@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate access token
   * @param payload - JWT payload data
   * @param secret - JWT secret key
   * @param expiresIn - Token expiration time
   * @returns Signed JWT token
   */
  async generateAccessToken(
    payload: JwtPayload,
    secret: string,
    expiresIn: string,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  /**
   * Generate refresh token
   * @param userId - User ID
   * @param secret - Refresh token secret
   * @param expiresIn - Refresh token expiration time
   * @returns Object with refresh token and token ID
   */
  async generateRefreshToken(
    userId: string,
    secret: string,
    expiresIn: string,
  ): Promise<{ refreshToken: string; tokenId: string }> {
    const tokenId = crypto.randomUUID();
    const payload: RefreshTokenPayload = {
      id: userId,
      tokenId,
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });

    return { refreshToken, tokenId };
  }

  /**
   * Verify and decode JWT token
   * @param token - JWT token to verify
   * @param secret - JWT secret key
   * @returns Decoded JWT payload
   */
  async verifyToken(token: string, secret: string): Promise<any> {
    return this.jwtService.verifyAsync(token, { secret });
  }

  /**
   * Decode JWT token without verification
   * @param token - JWT token to decode
   * @returns Decoded JWT payload
   */
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
