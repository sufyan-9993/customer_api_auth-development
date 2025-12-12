import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { LocationMaster } from '../../common/entities/locationMaster.entity';
import { status } from '../../../constants/index';
import { BaseAudit } from '../../common/entities/base-audit.entity';
// import { Plan } from '../../plan/entities/plan.entity';
// import { Pool } from '../../pool/entities/pool.entity';
import { User } from '../../users/entities/user.entity';

@Entity('organizations')
export class Organization extends BaseAudit {
  // ================================
  // MULTI-LEVEL HIERARCHY FIELDS
  // ================================

  @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Organization | null;

  @OneToMany(() => Organization, (org) => org.parent)
  children: Organization[];

  @ManyToOne(() => Organization, (org) => org.root_children, { nullable: true })
  @JoinColumn({ name: 'root_id' })
  root: Organization | null;

  @OneToMany(() => Organization, (org) => org.root)
  root_children: Organization[];

  @Column({ type: 'int', default: 0 })
  level: number;

  // ================================
  // EXISTING ORGANIZATION FIELDS
  // ================================

  @Column({ type: 'varchar', length: 255 })
  legal_name: string;

  @Column({ type: 'varchar', length: 255 })
  trade_name: string;

  @Column({ type: 'varchar', length: 255 })
  customer_type: string;

  @Column({ type: 'varchar', length: 255 })
  msa_number: string;

  @Column({ type: 'varchar', length: 255 })
  organization_type: string;

  @Column({ type: 'varchar', length: 255 })
  business_registration_number: string;

  @ManyToOne(() => LocationMaster, { nullable: true })
  @JoinColumn({ name: 'country_id' })
  country: LocationMaster;

  @ManyToOne(() => LocationMaster, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state: LocationMaster;

  @ManyToOne(() => LocationMaster, { nullable: true })
  @JoinColumn({ name: 'city_id' })
  city: LocationMaster;

  @Column({ type: 'varchar', length: 255 })
  address_line: string;

  @Column({ type: 'enum', enum: status, default: status.ACTIVE })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  activated_at: Date;

  @Column({ type: 'simple-array', nullable: true })
  serviceRegions: string[];

  // ================================
  // RELATIONSHIPS
  // ================================

  // @OneToMany(() => Plan, (plan) => plan.organization)
  // plans: Plan[];

  // @OneToMany(() => Pool, (pool) => pool.organization)
  // pools: Pool[];

  @OneToMany(() => User, (user) => user.organization)
  users: User[];
}
