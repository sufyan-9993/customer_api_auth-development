import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DeviceInfo } from '../../common/entities/deviceInfo.entity';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_activity_log' })
export class UserActivityLog extends BaseAudit {
  @ManyToOne(() => User, (user) => user.activityLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType: string;

  @Column({ name: 'event_description', type: 'varchar' })
  eventDescription: string;

  @ManyToOne(() => DeviceInfo)
  @JoinColumn({ name: 'device_info_id' })
  deviceInfo: DeviceInfo;
}
