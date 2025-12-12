import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from './user.entity';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_org_mapping' })
export class UserOrgMapping extends BaseAudit {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'is_sub_org_admin', type: 'boolean', default: false })
  isSubOrgAdmin: boolean;
}
