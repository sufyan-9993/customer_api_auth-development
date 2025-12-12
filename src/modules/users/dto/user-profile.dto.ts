import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  organization: {
    id: string;
    legal_name: string;
    trade_name: string;
  } | null;
  languagePreference: string | null;
  roleId: string | null;
  role: {
    id: string;
    roleName: string;
  } | null;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  countryCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  languagePreference?: string;

  @ApiPropertyOptional({ type: String })
  @IsUUID()
  @IsOptional()
  roleId?: string;
}

export class UserAccountStatusDto {
  id: string;
  status: string;
  createdAt: Date;
  lastActivity: Date | null;
}
