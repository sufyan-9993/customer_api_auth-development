import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { PermissionAction } from '../../../constants';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiProperty({ type: String })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  subOrg: PermissionAction[];

  // @ApiProperty()
  // @IsArray()
  // @ArrayNotEmpty()
  // @IsEnum(PermissionAction, { each: true })
  // pools: PermissionAction[];

  // @ApiProperty()
  // @IsArray()
  // @ArrayNotEmpty()
  // @IsEnum(PermissionAction, { each: true })
  // plans: PermissionAction[];

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  logs: PermissionAction[];

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  users: PermissionAction[];

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionAction, { each: true })
  roles: PermissionAction[];
}
