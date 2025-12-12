import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RevokeSessionDto {
  @ApiProperty({
    example: 'session-12345',
    description: 'ID of the session to be revoked',
  })
  @IsString()
  sessionId: string;
}
