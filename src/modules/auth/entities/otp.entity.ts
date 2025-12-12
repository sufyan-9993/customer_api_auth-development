import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OtpType } from '../../../constants/index';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'otp' })
export class Otp extends BaseAudit {
  @ManyToOne(() => User, (user) => user.otps, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: OtpType })
  type: OtpType;

  @Column({ name: 'value', type: 'varchar' })
  Value: string;

  @Column({ name: 'code', type: 'varchar' })
  code: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_used', type: 'boolean' })
  isUsed: boolean;
}
