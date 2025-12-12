import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Organization } from '../entities/organization.entity';

class UserDto {
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

  roleId?: string;
}

// class PoolDto {
//   @ApiProperty()
//   @IsString()
//   name: string;

//   @ApiProperty()
//   @IsString()
//   description: string;
// }

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Legal name of the organization',
    example: 'ABC Corp',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  legal_name: string;

  @ApiProperty({
    description: 'Trade name of the organization',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  trade_name?: string;

  @ApiProperty({
    description: 'Type of customer',
    example: 'enterprise',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  customer_type?: string;

  @ApiProperty({
    description: 'MSA number of the organization',
    example: 'MSA123456',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  msa_number?: string;

  @ApiProperty({
    description: 'Type of organization',
    example: 'subsidiary',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  organization_type: string;

  @ApiProperty({
    description: 'Business registration number',
    example: 'BRN789012',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  business_registration_number: string;

  @ApiProperty({
    description: 'Building number and street name',
    example: '123 Main St',
    type: String,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  address_line: string;

  @ApiProperty({
    required: true,
    description: 'Country',
    type: String,
    example: 'USA',
  })
  country: string;

  @ApiProperty({
    required: true,
    description: 'State',
    type: String,
    example: 'California',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    required: true,
    description: 'City',
    type: String,
    example: 'Los Angeles',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    required: true,
    description: 'Service Region',
    type: String,
    example: 'West Coast',
  })
  @IsString()
  @IsNotEmpty()
  serviceRegion: string;

  @ApiProperty({
    description: 'User details for the organization admin',
    type: UserDto,
    required: true,
  })
  @IsObject()
  @IsNotEmpty()
  user: UserDto;

  created_by?: string;
  created_at?: Date;
  status?: string;
  level?: number;
  parent?: Organization;
  root?: Organization;
}
