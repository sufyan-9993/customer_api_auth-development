import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { logger } from '../../utils/logger';
import { UsersService } from '../../modules/users/users.service';
import { status } from '../../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: Record<string, unknown> }>();

    const accessToken = this.extractTokenFromHeaders(request);
    if (!accessToken) {
      throw new UnauthorizedException('Invalid or missing access token');
    }

    const payload = this.verifyToken(accessToken);
    const userId = payload?.id as string;

    if (!payload || !userId) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersService.getUserById(userId);
    if (!user) {
      logger.warn(`User not found for ID: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== status.ACTIVE) {
      throw new UnauthorizedException(
        'User is inactive or deleted, please contact admin',
      );
    }

    request.user = user as unknown as Record<string, unknown>;
    return true;
  }

  private verifyToken(token: string): Record<string, any> | null {
    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') ??
        'your-secret-key-change-in-production';

      const payload = this.jwtService.verify<Record<string, any>>(token, {
        secret,
      });

      return payload;
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'TokenExpiredError') {
          logger.warn('AuthGuard.verifyToken: Access token expired');
        } else {
          logger.error(`AuthGuard.verifyToken: Invalid token - ${err.message}`);
        }
      }
      return null;
    }
  }

  private extractTokenFromHeaders(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    logger.warn(
      'AuthGuard.extractTokenFromHeaders: Token not found in headers',
    );
    return null;
  }
}
