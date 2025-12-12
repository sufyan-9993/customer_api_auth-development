import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from './role.entity';
import { status } from '../../../constants/index';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_role_mapping' })
export class UserRoleMapping extends BaseAudit {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'enum', enum: status, default: 'active' })
  status: string;
}
