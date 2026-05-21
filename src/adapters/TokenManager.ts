import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError } from '@errors';
import { config } from '@config/environment';

export interface AccessTokenPayload {
  userId: string;
  firebaseUid: string;
}

export interface VerifiedAccessTokenPayload extends AccessTokenPayload {
  iat: number;
  exp: number;
}

export class TokenManager {
  createAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'mutanex-server',
      audience: 'mutanex-patient-app',
    });
  }

  verifyAccessToken(token: string): VerifiedAccessTokenPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        issuer: 'mutanex-server',
        audience: 'mutanex-patient-app',
      });

      const payload = decoded as JwtPayload;
      if (!payload.userId || !payload.firebaseUid || !payload.iat || !payload.exp) {
        throw new UnauthorizedError('Invalid access token payload');
      }

      return {
        userId: String(payload.userId),
        firebaseUid: String(payload.firebaseUid),
        iat: Number(payload.iat),
        exp: Number(payload.exp),
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired access token');
    }
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(48).toString('base64url');
  }

  hashRefreshToken(token: string): string {
    return crypto
      .createHmac('sha256', config.JWT_SECRET)
      .update(token)
      .digest('hex');
  }
}
