import { Entity, Column } from 'typeorm';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_group' })
export class UserGroup extends BaseAudit {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 250 })
  description: string;
}
