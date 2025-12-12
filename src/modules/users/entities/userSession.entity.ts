import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DeviceInfo } from '../../common/entities/deviceInfo.entity';
import { status } from '../../../constants/index';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_session' })
export class UserSession extends BaseAudit {
  @ManyToOne(() => User, (user) => user.userSession)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DeviceInfo)
  @JoinColumn({ name: 'device_info_id' })
  deviceInfo: DeviceInfo;

  @Column({ type: 'enum', enum: status, default: status.ACTIVE })
  status: status;

  @Column({ name: 'is_current', type: 'boolean' })
  isCurrent: boolean;

  @Column({ name: 'last_activity', type: 'timestamp' })
  lastActivity: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date;
}
