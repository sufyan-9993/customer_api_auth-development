import {
  HttpException,
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PasswordHistory } from './entities/passwordHistroy.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { Otp } from './entities/otp.entity';
import { UserLoginAttempts } from './entities/user_login_attempts.entity';
import { PasswordResetToken } from './entities/passwordResetToken.entity';
import { NotificationService } from '../notification/notification.service';
import { generateOtpEmailTemplate } from '../../utils/templete';
import { HTTP_STATUS, OtpType, status } from '../../constants';
import { ConfigService } from '@nestjs/config';
import {
  SendEmailOtpDto,
  VerifyOtpDto,
  CreatePasswordDto,
  LoginDto,
  VerifymfaOtpDto,
  VerifyMfaDto,
} from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { ApiResponse, ResponseService } from '../../utils/response.utils';
import { JwtRequest } from './guards/JwtRequest ';
import { DeviceInfo } from '../common/entities/deviceInfo.entity';
import { DeviceHelper } from '../../utils/devicehelper';
import { UserSession } from '../users/entities/userSession.entity';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,

    @InjectRepository(PasswordHistory)
    private readonly phRepo: Repository<PasswordHistory>,

    @InjectRepository(UserLoginAttempts)
    private readonly attemptsRepo: Repository<UserLoginAttempts>,

    @InjectRepository(DeviceInfo)
    private readonly deviceInfoRepo: Repository<DeviceInfo>,

    @InjectRepository(UserSession)
    private readonly userSessionRepo: Repository<UserSession>,

    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,

    private readonly notifyService: NotificationService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly response: ResponseService,
    private users: UsersService,
    private DeviceHelper: DeviceHelper,
  ) {}

  private generateOtp(): string {
    return Math.floor(Math.random() * 900000 + 100000).toString();
  }

  private otpExpiryMs(): number {
    return 1 * 60 * 1000;
  }

  private async sendOtpEmail(
    value: string,
    otpCode: string,
    subject = 'Your OTP Code',
  ) {
    const template = generateOtpEmailTemplate(value, otpCode);
    const from =
      this.configService.get<string>('MAIL_FROM') || 'no-reply@example.com';
    await this.notifyService.sendEmail(subject, from, value, template);
  }

  private async saveOtpRecord(value: string, code: string, user?: User) {
    const expiry = new Date(Date.now() + this.otpExpiryMs());
    const otp = this.otpRepo.create({
      Value: value,
      code,
      type: OtpType.EMAIL,
      expiresAt: expiry,
      isUsed: false,
      user,
    });
    return this.otpRepo.save(otp);
  }

  private async verifyOtp(value: string, code: string): Promise<Otp | null> {
    const otp = await this.otpRepo.findOne({
      where: { Value: value, code, isUsed: false },
      relations: ['user'],
    });

    if (!otp || otp.expiresAt < new Date()) return null;

    otp.isUsed = true;
    await this.otpRepo.save(otp);
    return otp;
  }

  private createJwt(user: User): string {
    return this.jwtService.sign({ id: user.id, email: user.email });
  }

  private async isPasswordValid(
    userId: string,
    plain: string,
  ): Promise<boolean> {
    const record = await this.phRepo.findOne({
      where: { user: { id: userId }, isCurrent: true },
    });
    if (!record) return false;

    // explicitly await and type as boolean
    const isValid: boolean = await bcrypt.compare(plain, record.passwordHash);
    return isValid;
  }

  async handleFailedAttempt(userId: string): Promise<UserLoginAttempts | void> {
    try {
      let record = await this.attemptsRepo.findOne({
        where: { user_id: userId },
      });

      // No existing record → create new
      if (!record) {
        record = this.attemptsRepo.create({
          user_id: userId,
          failed_attempts: 1,
          last_attempt_at: new Date(),
        });

        return await this.attemptsRepo.save(record);
      }

      // Update existing record
      record.failed_attempts += 1;
      record.last_attempt_at = new Date();

      // Lock account after 5 attempts
      if (record.failed_attempts >= 5) {
        record.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
      }

      await this.attemptsRepo.save(record);
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      this.logger.error(
        `Failed to update login attempts for user ${userId}: ${message}`,
      );
    }
  }

  async resetAttempts(userId: string): Promise<void> {
    try {
      await this.attemptsRepo.update(
        { user_id: userId },
        { failed_attempts: 0, locked_until: null },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      this.logger.error(
        `Failed to reset login attempts for user ${userId}: ${message}`,
      );
    }
  }

  async sendSignupOtp(dto: SendEmailOtpDto): Promise<ApiResponse<null>> {
    try {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) return this.response.error(404, 'User already exists');

      const otp = this.generateOtp();
      await this.saveOtpRecord(dto.email, otp);
      await this.sendOtpEmail(dto.email, otp, 'Signup OTP');

      return this.response.success(null, 'Signup OTP sent');
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Failed to send signup OTP');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifySignupOtp(dto: VerifyOtpDto): Promise<ApiResponse<null>> {
    try {
      const otp = await this.verifyOtp(dto.value, dto.otp);
      if (!otp) return this.response.error(404, 'Invalid or expired OTP');

      return this.response.success(null, 'OTP verified Successfully');
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Failed to verify OTP');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPassword(
    dto: CreatePasswordDto,
  ): Promise<
    ApiResponse<{ secret: string; qrCode: string; userId: string } | null>
  > {
    try {
      const otp = await this.otpRepo.findOne({
        where: { Value: dto.email, isUsed: true },
      });
      if (!otp) return this.response.error(404, 'OTP not verified');

      const exist = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (exist) return this.response.error(404, 'User already exists');

      const user = await this.userRepo.save(
        this.userRepo.create({ email: dto.email }),
      );

      const hash = await bcrypt.hash(dto.password, 10);

      const ph = this.phRepo.create({
        user,
        passwordHash: hash,
        isCurrent: true,
      });
      await this.phRepo.save(ph);

      const secret = speakeasy.generateSecret({
        name: `Telesat-MFA (${user.email})`,
      });

      user.mfa_secret = secret.base32;
      await this.users.save(user);

      if (!secret.otpauth_url) {
        return this.response.error(404, 'Failed to generate MFA secret');
      }

      const qr = await QRCode.toDataURL(secret.otpauth_url);

      return this.response.success(
        { secret: secret.base32, qrCode: qr, userId: user.id },
        'Password created Successfully',
      );
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Failed to create password');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyMfa(
    dto: VerifyMfaDto,
  ): Promise<ApiResponse<{ token: string; user: User } | null>> {
    try {
      console.log('dto.userId', dto.userId);
      const user = await this.users.findById(dto.userId);
      if (!user) return this.response.error(404, 'Invalid user');
      console.log('user.mfa_secret', user.mfa_secret);

      const ok = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token: dto.token,
        window: 1,
      });

      if (!ok) return this.response.error(404, 'Invalid OTP');

      const apiToken = this.createJwt(user);

      user.mfaEnabled = true;
      await this.users.save(user);

      return this.response.success(
        { token: apiToken, user },
        'MFA verified successfully',
      );
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Failed to verify MFA');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(
    req: any,
    dto: LoginDto,
  ): Promise<ApiResponse<{ email: string } | null>> {
    try {
      const user = await this.userRepo.findOne({ where: { email: dto.email } });
      if (!user) return this.response.error(404, 'Invalid credentials');

      const attempt = await this.attemptsRepo.findOne({
        where: { user_id: user.id },
      });

      if (attempt?.locked_until && attempt.locked_until > new Date()) {
        return this.response.error(
          404,
          `Account locked until ${attempt.locked_until.toISOString()}`,
        );
      }

      const valid = await this.isPasswordValid(user.id, dto.password);
      await this.handleFailedAttempt(user.id);
      if (!valid) return this.response.error(404, 'Invalid credentials');
      await this.resetAttempts(user.id);

      const deviceInfo = await this.DeviceHelper.extractDeviceInfo(req);

      const deviceEntity = this.deviceInfoRepo.create(deviceInfo);
      await this.deviceInfoRepo.save(deviceEntity);

      await this.userSessionRepo.update(
        { user: { id: user.id }, isCurrent: true },
        { isCurrent: false },
      );

      const session = this.userSessionRepo.create({
        user,
        deviceInfo: deviceEntity,
        status: status.ACTIVE,
        isCurrent: true,
        lastActivity: new Date(),
      });
      await this.userSessionRepo.save(session);

      return this.response.success(
        { email: user.email, mfa_secret: user.mfa_secret },
        'OTP sent',
      );
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Login failed');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async verifyLoginOtp(
    dto: VerifymfaOtpDto,
  ): Promise<ApiResponse<{ token: string; user: User } | null>> {
    try {
      const isValid = speakeasy.totp.verify({
        secret: dto.secret,
        encoding: 'base32',
        token: dto.token,
        window: 1,
      });

      if (!isValid) return this.response.error(404, 'Invalid or expired OTP');

      const user = await this.userRepo.findOne({
        where: { mfa_secret: dto.secret },
      });

      if (!user) return this.response.error(404, 'Invalid user');

      const token = this.createJwt(user);

      return this.response.success({ token, user }, 'Login successful');
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Failed to verify login OTP');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async forgotPassword(dto: SendEmailOtpDto): Promise<ApiResponse<null>> {
    try {
      const user = await this.userRepo.findOne({ where: { email: dto.email } });
      if (!user) return this.response.error(404, 'Email not found');

      const otp = this.generateOtp();
      await this.saveOtpRecord(dto.email, otp, user);
      await this.sendOtpEmail(dto.email, otp, 'Reset Password OTP');

      return this.response.success(null, 'Reset OTP sent');
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Failed to process request');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyForgotpasswordOtp(
    dto: VerifyOtpDto,
  ): Promise<ApiResponse<{ token: string; user: User } | null>> {
    try {
      const otp = await this.verifyOtp(dto.value, dto.otp);
      if (!otp) return this.response.error(404, 'Invalid or expired OTP');

      const user = otp.user;
      const token = this.createJwt(user);

      return this.response.success(
        { token, user },
        'OTP verified Successfully',
      );
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Failed to verify login OTP');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(
    req: JwtRequest,
    dto: CreatePasswordDto,
  ): Promise<ApiResponse<null>> {
    try {
      const userId = req?.user.id; // use sub as ID
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) return this.response.error(404, 'User not found');

      await this.phRepo
        .createQueryBuilder()
        .update()
        .set({ isCurrent: false, expiredAt: new Date() })
        .where('user_id = :id', { id: userId })
        .andWhere('isCurrent = true')
        .execute();

      const hash = await bcrypt.hash(dto.password, 10);
      const ph = this.phRepo.create({
        user,
        passwordHash: hash,
        isCurrent: true,
      });
      await this.phRepo.save(ph);
      await this.resetAttempts(userId);

      return this.response.success(null, 'Password changed Successfully');
    } catch (err) {
      if (err instanceof HttpException) {
        this.logger.log('Failed to reset password');
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);

      throw new HttpException(
        this.response.error(HTTP_STATUS.INTERNAL_SERVER_ERROR, message),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    try {
      // Validate passwords match
      if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
        throw new BadRequestException(
          'New password and confirm password do not match',
        );
      }

      // Validate new password is different from current
      if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }

      // Fetch user
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Fetch last 3 password histories for this user
      const lastPasswords = await this.phRepo.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
        take: 3,
      });

      // Verify current password matches the most recent one
      if (lastPasswords.length === 0) {
        throw new UnauthorizedException(
          'No password history found. Please reset your password.',
        );
      }

      const currentPasswordHash = lastPasswords[0].passwordHash;
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        currentPasswordHash,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Check if new password was used in last 3 times
      for (const passwordHistory of lastPasswords) {
        const isPasswordUsed = await bcrypt.compare(
          changePasswordDto.newPassword,
          passwordHistory.passwordHash,
        );

        if (isPasswordUsed) {
          throw new BadRequestException(
            'New password cannot be same as one of the last 3 passwords for security reasons',
          );
        }
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(
        changePasswordDto.newPassword,
        salt,
      );

      // Mark previous password as expired
      await this.phRepo.update(
        { user: { id: userId }, isCurrent: true },
        { isCurrent: false, expiredAt: new Date() },
      );

      // Create new password history entry
      const newPasswordHistory = this.phRepo.create({
        user,
        passwordHash: newPasswordHash,
        isCurrent: true,
      });

      await this.phRepo.save(newPasswordHistory);

      this.logger.log(`Password changed successfully for user: ${userId}`);

      return this.response.success(null, 'Password updated successfully');
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
      ) {
        this.logger.warn(
          `Password change failed for user ${userId}: ${err.message}`,
        );
        throw err;
      }

      this.logger.error(
        `Error changing password for user ${userId}:`,
        (err as Error).message,
      );
      throw new HttpException(
        this.response.error(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          'Failed to change password',
        ),
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
