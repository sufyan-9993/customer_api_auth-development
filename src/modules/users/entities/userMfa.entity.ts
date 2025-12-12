import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_mfa' })
export class UserMfa extends BaseAudit {
  @OneToOne(() => User, (user) => user.userMfa)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar' })
  method: string;
}
