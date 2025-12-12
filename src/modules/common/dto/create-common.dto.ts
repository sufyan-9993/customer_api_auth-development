import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { LocationType } from '../../../constants';

export class CreateCommonDto {}

export class CreateLocationDto {
  @ApiProperty({
    example: LocationType.COUNTRY,
    description: 'Type of location (COUNTRY / STATE / CITY)',
  })
  @IsEnum(LocationType)
  type: LocationType;

  @ApiProperty({
    example: 'India',
    description: 'Name of the country/state/city',
  })
  @IsString()
  value: string;

  @ApiProperty({
    example: 'c2bfc35f-8fd3-4f70-a6df-588b3a07c67e',
    description:
      'Parent ID (Required only when creating STATE or CITY). For STATE → parent is COUNTRY. For CITY → parent is STATE.',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateLocationDto {
  @ApiProperty({
    example: LocationType.STATE,
    description: 'Updated location type',
    required: false,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiProperty({
    example: 'Tamil Nadu',
    description: 'Updated value for the location',
    required: false,
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({
    example: 'c2bfc35f-8fd3-4f70-a6df-588b3a07c67e',
    description: 'Updated parent ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class GetStatesDto {
  @ApiProperty({
    example: 'c2bfc35f-8fd3-4f70-a6df-588b3a07c67e',
    description: 'Country ID for which states need to be fetched',
  })
  @IsUUID()
  countryId: string;
}

export class GetCitiesDto {
  @ApiProperty({
    example: '6e5d7e2d-9b0d-4b59-9cf9-7a3e1d0b5a88',
    description: 'State ID for which cities need to be fetched',
  })
  @IsUUID()
  stateId: string;
}
