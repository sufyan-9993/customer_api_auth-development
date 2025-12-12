import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWT } from '../constants';

@Injectable()
export class JwtConfigService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return (
      this.configService.get<string>('JWT_SECRET') ||
      'your-secret-key-change-in-production'
    );
  }

  get accessTokenExpiry(): string {
    return (
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY') ||
      JWT.ACCESS_TOKEN_EXPIRY
    );
  }

  get refreshTokenExpiry(): string {
    return (
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY') ||
      JWT.REFRESH_TOKEN_EXPIRY
    );
  }

  get issuer(): string {
    return (
      this.configService.get<string>('JWT_ISSUER') || 'customer-portal-api'
    );
  }

  get audience(): string {
    return (
      this.configService.get<string>('JWT_AUDIENCE') || 'customer-portal-app'
    );
  }
}
