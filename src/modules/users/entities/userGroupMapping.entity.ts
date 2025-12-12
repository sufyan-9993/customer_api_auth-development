import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { UserGroup } from './userGroup.entity';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_group_mapping' })
export class UserGroupMapping extends BaseAudit {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => UserGroup)
  @JoinColumn({ name: 'group_id' })
  group: UserGroup;
}
