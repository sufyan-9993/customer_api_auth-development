import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { PermissionAction } from '../../../constants';

export class UpdateUserDto {
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

  @ApiPropertyOptional({ type: String })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  @IsOptional()
  subOrg?: PermissionAction[];

  // @ApiPropertyOptional({ isArray: true })
  // @IsArray()
  // @ArrayNotEmpty()
  // @IsEnum(PermissionAction, { each: true })
  // @IsOptional()
  // pools?: PermissionAction[];

  // @ApiPropertyOptional({ isArray: true })
  // @IsArray()
  // @ArrayNotEmpty()
  // @IsEnum(PermissionAction, { each: true })
  // @IsOptional()
  // plans?: PermissionAction[];

  @ApiPropertyOptional({ isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  @IsOptional()
  logs?: PermissionAction[];

  @ApiPropertyOptional({ isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  @IsOptional()
  users?: PermissionAction[];

  @ApiPropertyOptional({ isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  @IsOptional()
  roles?: PermissionAction[];
}
