import { Entity, Column, OneToMany } from 'typeorm';
import { status } from '../../../constants/index';
import { BaseAudit } from '../../common/entities/base-audit.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'role' })
export class Role extends BaseAudit {
  @Column({ name: 'role_name', type: 'varchar' })
  roleName: string;

  @Column({ name: 'role_description', type: 'varchar' })
  roleDescription: string;

  @Column({ type: 'enum', enum: status, default: 'active' })
  status: string;

  @OneToMany(() => User, (user) => user.role)
  user: User[];
}
