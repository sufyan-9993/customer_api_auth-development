import { Entity, Column } from 'typeorm';
import { PermissionAction, status } from '../../../constants/index';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'permission_module' })
export class PermissionModule extends BaseAudit {
  @Column({ name: 'module_name', type: 'varchar' })
  moduleName: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: PermissionAction })
  action: PermissionAction;

  @Column({ type: 'enum', enum: status, default: 'active' })
  status: string;
}
