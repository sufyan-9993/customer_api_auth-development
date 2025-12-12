import { Controller, Post, Body, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import {
  SendEmailOtpDto,
  VerifyOtpDto,
  CreatePasswordDto,
  LoginDto,
  VerifymfaOtpDto,
  VerifyMfaDto,
} from './dto/create-auth.dto';

import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtRequest } from './guards/JwtRequest ';
import { AuthGuard } from '../../common/guard/auth.guard';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Create user profile',
    description: 'Registers a new user and sends OTP to the email provided.',
  })
  @Post()
  create(@Body() dto: SendEmailOtpDto) {
    this.logger.log('In Auth controller - send signup OTP');
    return this.authService.sendSignupOtp(dto);
  }

  @ApiOperation({
    summary: 'Verify signup OTP',
    description: 'Validates the OTP sent during the signup process.',
  })
  @Post('verify-signup-otp')
  verifySignupOtp(@Body() dto: VerifyOtpDto) {
    this.logger.log('In Auth controller - verify signup OTP');
    return this.authService.verifySignupOtp(dto);
  }

  @ApiOperation({
    summary: 'Set first-time password',
    description:
      'Allows newly registered users to set their initial password after OTP verification.',
  })
  @Post('set-password')
  setPassword(@Body() dto: CreatePasswordDto) {
    this.logger.log('In Auth controller - set password');
    return this.authService.createPassword(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email + password → OTP sent' })
  login(@Req() req, @Body() dto: LoginDto) {
    this.logger.log(`Login attempt for email: ${dto.email}`);
    return this.authService.login(req, dto);
  }

  @Post('verify-signin-otp')
  @ApiOperation({ summary: 'Verify login OTP ' })
  verifyLoginOtp(@Body() dto: VerifymfaOtpDto) {
    this.logger.log('In Auth controller - verify login OTP');
    return this.authService.verifyLoginOtp(dto);
  }

  @Post('verify-MFA-token')
  @ApiOperation({ summary: 'Verify MFA token' })
  verify(@Body() dto: VerifyMfaDto) {
    this.logger.log('In Auth controller - verify MFA token');
    return this.authService.verifyMfa(dto);
  }

  @Post('forgot-password-email')
  @ApiOperation({ summary: 'Send password reset token' })
  forgot(@Body() dto: SendEmailOtpDto) {
    this.logger.log('In Auth controller - send forgot password OTP');
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-forgot-password-otp')
  @ApiOperation({ summary: 'Verify forgot-password OTP' })
  verifyForgotpasswordOtp(@Body() dto: VerifyOtpDto) {
    this.logger.log('In Auth controller - verify forgot password OTP');
    return this.authService.verifyForgotpasswordOtp(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reset password using token' })
  @Post('forgot-password-change')
  resetPassword(@Req() req: JwtRequest, @Body() dto: CreatePasswordDto) {
    this.logger.log('In Auth controller - reset password');
    return this.authService.resetPassword(req, dto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Change password',
    description: 'Change the password for the authenticated user',
  })
  async changePassword(
    @Req() req: Request & { user?: User },
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = req.user?.id as string;
    this.logger.log(`Change password request for user: ${userId}`);
    return this.authService.changePassword(userId, dto);
  }
}
