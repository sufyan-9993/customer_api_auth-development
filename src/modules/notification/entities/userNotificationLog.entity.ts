import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_notification_log' })
export class UserNotificationLog extends BaseAudit {
  @ManyToOne(() => User, (user) => user.notificationLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  message: string;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType: string;

  @Column({ name: 'is_read', type: 'boolean' })
  isRead: boolean;
}
