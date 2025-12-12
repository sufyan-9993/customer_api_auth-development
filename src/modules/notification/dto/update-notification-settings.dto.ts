import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({
    description: 'Email system alerts',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  emailSystemAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Email plan changes',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  emailPlanChanges?: boolean;

  @ApiPropertyOptional({
    description: 'Email usage alerts',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  emailUsageAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Email security alerts',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  emailSecurityAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Email newsletter',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  emailNewsletter?: boolean;

  @ApiPropertyOptional({
    description: 'Push system alerts',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  pushSystemAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Push plan changes',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  pushPlanChanges?: boolean;

  @ApiPropertyOptional({
    description: 'Push usage alerts',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  pushUsageAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Push security alerts',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  pushSecurityAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'SMS critical alerts',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  smsCriticalAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'SMS security alerts',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  smsSecurityAlerts?: boolean;
}
