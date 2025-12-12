import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { BaseAudit } from '../../common/entities/base-audit.entity';
import { UserMfa } from './userMfa.entity';
import { UserSession } from './userSession.entity';
import { Otp } from '../../auth/entities/otp.entity';
import { PasswordHistory } from '../../auth/entities/passwordHistroy.entity';
import { PasswordResetToken } from '../../auth/entities/passwordResetToken.entity';
import { UserActivityLog } from '../../audit/entities/userActivityLog.entity';
import { UserNotificationLog } from '../../notification/entities/userNotificationLog.entity';
import { UserNotificationSettings } from '../../notification/entities/userNotificationSetting.entity';
import { UserLoginAttempts } from '../../auth/entities/user_login_attempts.entity';
import { Role } from '../../rbac/entities/role.entity';
import { UserPermissions } from './userPermissions.entity';
import { status } from '../../../constants/index';

@Entity({ name: 'users' })
export class User extends BaseAudit {
  @Column({ type: 'varchar', length: 150, default: '' })
  username: string;

  @Column({ type: 'varchar', length: 200 })
  @Index({ unique: true })
  email: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'country_code', type: 'varchar', length: 10, nullable: true })
  countryCode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  title: string;

  @ManyToOne(() => Role, (role) => role.id, {
    cascade: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'enum', enum: status })
  status: status;

  @Column({ name: 'profile_image_url', type: 'varchar', nullable: true })
  profileImageUrl?: string;

  @Column({ name: 'language_preference_id', type: 'uuid', nullable: true })
  languagePreference?: string;

  @Column({ name: 'mfa_enabled', type: 'boolean', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'is_strong_password', type: 'boolean', default: false })
  isStrongPassword: boolean;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'is_telesat_user', type: 'boolean', default: true })
  isTelesatUser: boolean;

  @OneToOne(() => UserMfa, (userMfa) => userMfa.user)
  userMfa: UserMfa;

  @OneToOne(() => UserPermissions, (perm) => perm.user)
  permissions: UserPermissions;

  @Column({ type: 'varchar', nullable: true })
  mfa_secret: string;

  @OneToMany(() => UserSession, (userSession) => userSession.user)
  @JoinColumn({ name: 'user_session_id' })
  userSession: UserSession[];

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @OneToMany(() => PasswordHistory, (ph) => ph.user)
  passwordHistories: PasswordHistory[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  resetTokens: PasswordResetToken[];

  @OneToMany(() => UserActivityLog, (log) => log.user)
  activityLogs: UserActivityLog[];

  @OneToMany(() => UserNotificationLog, (logs) => logs.user)
  notificationLogs: UserNotificationLog[];

  @OneToMany(() => UserNotificationSettings, (settings) => settings.user)
  notificationSettings: UserNotificationSettings[];

  @OneToMany(() => UserLoginAttempts, (attempts) => attempts.user)
  loginAttempts: UserLoginAttempts[];
}
