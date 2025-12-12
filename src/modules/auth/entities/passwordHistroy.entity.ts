import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'password_history' })
export class PasswordHistory extends BaseAudit {
  @ManyToOne(() => User, (user) => user.passwordHistories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ name: 'is_current', type: 'boolean' })
  isCurrent: boolean;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
  expiredAt: Date;
}
