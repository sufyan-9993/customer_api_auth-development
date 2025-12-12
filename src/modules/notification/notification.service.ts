import * as nodemailer from 'nodemailer';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UserNotificationSettings } from './entities/userNotificationSetting.entity';
import { User } from '../users/entities/user.entity';
import { ResponseService } from '../../utils/response.utils';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(UserNotificationSettings)
    private readonly userNotificationSettingsRepository: Repository<UserNotificationSettings>,

    private readonly responseService: ResponseService,
  ) {
    /** Email Transporter Setup */
    const user = this.configService.get<string>('EMAIL_USERNAME');
    const pass = this.configService.get<string>('EMAIL_PASSWORD');

    if (!user || !pass) {
      throw new Error(
        'EMAIL_USERNAME or EMAIL_PASSWORD is not set in environment variables',
      );
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      this.logger.error(`Failed to create transporter: ${message}`);
      throw new Error('Failed to initialize email transporter');
    }
  }

  /** ----------------------------- */
  /**        EMAIL SENDER           */
  /** ----------------------------- */
  async sendEmail(
    subject: string,
    from: string,
    to: string,
    html: string,
    cc = '',
    attachments: any[] = [],
    bcc = '',
  ) {
    try {
      if (!this.configService.get<boolean>('EMAIL_LIVE')) {
        this.logger.warn('EMAIL_LIVE is disabled — Email not sent.');
        return;
      }

      const formattedFrom = `Telesat Support Team <${from}>`;

      await this.transporter.sendMail({
        from: formattedFrom,
        to,
        subject,
        html,
        cc,
        bcc,
        attachments,
      });

      this.logger.verbose('Email sent successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      this.logger.error(`SendEmail Error: ${message}`);
    }
  }

  /** ----------------------------- */
  /**     NOTIFICATION CRUD         */
  /** ----------------------------- */
  create(createNotificationDto: CreateNotificationDto) {
    this.logger.log(
      `Creating Notification: ${JSON.stringify(createNotificationDto)}`,
    );
    return 'This action adds a new notification';
  }

  findOne(id: string) {
    return `This action returns notification #${id}`;
  }

  update(id: string, updateNotificationDto: UpdateNotificationDto) {
    this.logger.log(
      `Updating Notification #${id}: ${JSON.stringify(updateNotificationDto)}`,
    );
    return `This action updates a #${id} notification`;
  }

  remove(id: string) {
    return `This action removes notification #${id}`;
  }

  /** ----------------------------- */
  /**   GET USER NOTIFICATION SETTINGS */
  /** ----------------------------- */
  async getNotificationSettings(userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const existingSettings =
        await this.userNotificationSettingsRepository.findOne({
          where: { user: { id: userId } },
        });

      if (!existingSettings) {
        this.logger.log(`No notification settings found for user #${userId}`);

        return this.responseService.success({
          data: null,
          message: 'No notification settings found for this user',
        });
      }

      this.logger.log(
        `Notification settings retrieved successfully for user #${userId}`,
      );

      return this.responseService.success(existingSettings);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error retrieving notification settings for user #${userId}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /** ----------------------------- */
  /**   UPDATE USER NOTIFICATION SETTINGS */
  /** ----------------------------- */
  async updateNotificationSettings(
    userId: string,
    updateSettingsDto: UpdateNotificationSettingsDto,
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      let settings = await this.userNotificationSettingsRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!settings) {
        settings = this.userNotificationSettingsRepository.create({
          user: { id: userId } as User,
        });
      }

      for (const key of Object.keys(
        updateSettingsDto,
      ) as (keyof UpdateNotificationSettingsDto)[]) {
        const value = updateSettingsDto[key];

        if (
          value !== undefined &&
          Object.prototype.hasOwnProperty.call(settings, key)
        ) {
          (settings as unknown as Record<string, unknown>)[key] = value;
        }
      }

      await this.userNotificationSettingsRepository.save(settings);

      this.logger.log(`Notification settings updated for user #${userId}`);

      return this.responseService.success({
        data: settings,
        message: 'Notification settings updated successfully',
      });
    } catch (error) {
      this.logger.error(
        `Error updating settings for user #${userId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      throw error;
    }
  }
}
