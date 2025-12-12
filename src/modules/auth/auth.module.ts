import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { PasswordHistory } from './entities/passwordHistroy.entity';
import { UserLoginAttempts } from './entities/user_login_attempts.entity';
import { Otp } from './entities/otp.entity';
import { PasswordResetToken } from './entities/passwordResetToken.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards/jwt.strategy';
import { NotificationModule } from '../notification/notification.module';
import { UsersService } from '../users/users.service';
import { ResponseService } from '../../utils/response.utils';
import { UserPermissions } from '../users/entities/userPermissions.entity';
import { Organization } from '../organization/entities/organization.entity';
import { Role } from '../rbac/entities/role.entity';
import { UserSession } from '../users/entities/userSession.entity';
import { DeviceInfo } from '../common/entities/deviceInfo.entity';
import { DeviceHelper } from '../../utils/devicehelper';
import { AuthGuard } from '../../common/guard/auth.guard';

// @Module({
//   controllers: [AuthController],
//   providers: [AuthService],
// })
// export class AuthModule {}

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60d' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      User,
      PasswordHistory,
      UserLoginAttempts,
      Otp,
      PasswordResetToken,
      UserPermissions,
      Organization,
      Role,
      UserSession,
      DeviceInfo,
    ]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
    ResponseService,
    DeviceHelper,
    AuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
