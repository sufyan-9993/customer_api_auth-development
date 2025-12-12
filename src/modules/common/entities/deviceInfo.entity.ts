import { Entity, Column } from 'typeorm';
import { BaseAudit } from './base-audit.entity';

@Entity({ name: 'device_info' })
export class DeviceInfo extends BaseAudit {
  @Column({ name: 'ip_address', type: 'varchar' })
  ipAddress: string;

  @Column({ name: 'device_type', type: 'varchar' })
  deviceType: string;

  @Column({ name: 'os_type', type: 'varchar' })
  osType: string;

  @Column({ type: 'varchar' })
  browser: string;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude: number | null;
}
