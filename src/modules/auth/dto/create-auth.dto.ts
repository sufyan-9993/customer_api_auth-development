export class CreateAuthDto {}
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class SendEmailOtpDto {
  @ApiProperty({ example: 'john@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'john@gmail.com' })
  @IsString()
  @IsNotEmpty()
  value: string; // email or mobile
  @ApiProperty({ example: '888444' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;
}

export class VerifymfaOtpDto {
  @ApiProperty({ example: 'gjgjrirtk55trgg' })
  @IsString()
  @IsNotEmpty()
  secret: string;
  @ApiProperty({ example: '888444' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  token: string;
}

export class CreatePasswordDto {
  @ApiProperty({ example: 'john@gmail.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 'password@123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password@123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class VerifyMfaDto {
  @ApiProperty({ example: 'uuid66666' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '999555' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
