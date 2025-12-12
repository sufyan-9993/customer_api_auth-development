import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { LocationType, status } from '../../../constants/index';
import { BaseAudit } from './base-audit.entity';

@Entity({ name: 'location_master' })
export class LocationMaster extends BaseAudit {
  @Column({ type: 'enum', enum: LocationType })
  type: LocationType;

  @Column({ type: 'varchar' })
  value: string;

  @Column({ type: 'enum', enum: status, default: 'active' })
  status: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @ManyToOne(() => LocationMaster, (parent) => parent.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: LocationMaster | null;

  @OneToMany(() => LocationMaster, (child) => child.parent)
  children: LocationMaster[];
}
export { LocationType };
