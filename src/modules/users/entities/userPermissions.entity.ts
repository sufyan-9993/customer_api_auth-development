import {
  Entity,
  JoinColumn,
  Column,
  OneToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from './user.entity';
import { PermissionAction } from '../../../constants/index';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_permission' })
export class UserPermissions extends BaseAudit {
  @OneToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'simple-json', nullable: false })
  subOrg: PermissionAction[];

  // @Column({ type: 'simple-json', nullable: false })
  // pools: PermissionAction[];

  // @Column({ type: 'simple-json', nullable: false })
  // plans: PermissionAction[];

  @Column({ type: 'simple-json', nullable: false })
  logs: PermissionAction[];

  @Column({ type: 'simple-json', nullable: false })
  users: PermissionAction[];

  @Column({ type: 'simple-json', nullable: false })
  roles: PermissionAction[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeDefaults() {
    this.subOrg = Array.isArray(this.subOrg) ? this.subOrg : [];
    // this.pools = Array.isArray(this.pools) ? this.pools : [];
    // this.plans = Array.isArray(this.plans) ? this.plans : [];
    this.logs = Array.isArray(this.logs) ? this.logs : [];
    this.users = Array.isArray(this.users) ? this.users : [];
    this.roles = Array.isArray(this.roles) ? this.roles : [];
  }
}
