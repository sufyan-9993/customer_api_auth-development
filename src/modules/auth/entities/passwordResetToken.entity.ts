import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseAudit } from '../../common/entities/base-audit.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'password_reset_token' })
export class PasswordResetToken extends BaseAudit {
  @ManyToOne(() => User, (user) => user.resetTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar' })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_used', type: 'boolean' })
  isUsed: boolean;
}
