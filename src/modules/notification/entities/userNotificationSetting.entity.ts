import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BaseAudit } from '../../common/entities/base-audit.entity';

@Entity({ name: 'user_notification_settings' })
export class UserNotificationSettings extends BaseAudit {
  @ManyToOne(() => User, (user) => user.notificationSettings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'email_system_alerts', type: 'boolean' })
  emailSystemAlerts: boolean;

  @Column({ name: 'email_plan_changes', type: 'boolean' })
  emailPlanChanges: boolean;

  @Column({ name: 'email_usage_alerts', type: 'boolean' })
  emailUsageAlerts: boolean;

  @Column({ name: 'email_security_alerts', type: 'boolean' })
  emailSecurityAlerts: boolean;

  @Column({ name: 'email_newsletter', type: 'boolean' })
  emailNewsletter: boolean;

  @Column({ name: 'push_system_alerts', type: 'boolean' })
  pushSystemAlerts: boolean;

  @Column({ name: 'push_plan_changes', type: 'boolean' })
  pushPlanChanges: boolean;

  @Column({ name: 'push_usage_alerts', type: 'boolean' })
  pushUsageAlerts: boolean;

  @Column({ name: 'push_security_alerts', type: 'boolean' })
  pushSecurityAlerts: boolean;

  @Column({ name: 'sms_critical_alerts', type: 'boolean' })
  smsCriticalAlerts: boolean;

  @Column({ name: 'sms_security_alerts', type: 'boolean' })
  smsSecurityAlerts: boolean;
}
