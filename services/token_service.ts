import { SignJWT, jwtVerify, decodeJwt } from 'jose';

export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export default class CartexUserTokenService {
  private static getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    return new TextEncoder().encode(secret);
  }

  /**
   * Generate a JWT token for a user
   * @param userId - The user ID to encode in the token
   * @param expiresIn - Token expiration time (default: 30 days)
   * @returns JWT token string
   */
  static async generateJWT(userId: string, expiresIn: string = '10d'): Promise<string> {
    const secret = this.getSecret();
    
    const token = await new SignJWT({ userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(secret);

    return token;
  }

  /**
   * Verify and decode a JWT token
   * @param token - The JWT token to verify
   * @returns Decoded payload if valid
   * @throws Error if token is invalid or expired
   */
  static async verifyJWT(token?: string): Promise<JWTPayload> {
    if (!token) {
      throw new Error('Token is required');
    }
    try {
      const secret = this.getSecret();
      const { payload } = await jwtVerify(token, secret);
      
      if (!payload.userId || typeof payload.userId !== 'string') {
        throw new Error('Invalid token payload');
      }
      
      return payload as unknown as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode a JWT token without verification
   * Note: This does NOT verify the token signature. Use verifyJWT for secure verification.
   * @param token - The JWT token to decode
   * @returns Decoded payload
   */
  static async decodeJWT(token: string): Promise<JWTPayload> {
    try {
      const payload = decodeJwt(token);
      return payload as unknown as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }
}