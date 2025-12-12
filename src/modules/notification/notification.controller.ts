import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { AuthGuard } from '../../common/guard/auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('settings')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification settings for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSettings(@Request() req: Request & { user?: User }) {
    const userId = req.user?.id as string;
    return this.notificationService.getNotificationSettings(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Put('settings')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update notification settings for authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateSettings(
    @Request() req: Request & { user?: User },
    @Body() updateNotificationSettingsDto: UpdateNotificationSettingsDto,
  ) {
    const userId = req.user?.id as string;
    return this.notificationService.updateNotificationSettings(
      userId,
      updateNotificationSettingsDto,
    );
  }
}
