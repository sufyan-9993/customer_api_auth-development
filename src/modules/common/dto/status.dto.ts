// status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { status } from '../../../constants';

export class StatusQueryDto {
  @ApiProperty()
  @IsEnum(status)
  status: status;
}
