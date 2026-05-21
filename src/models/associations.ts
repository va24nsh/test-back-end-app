/**
 * Model Associations
 * 
 * This file defines all Sequelize model associations to avoid circular dependencies.
 * Import this file after all models are initialized.
 */

import { User } from '@models/user.model';
import { OtpRequest } from '@models/otpRequest.model';
import { UserAuthToken } from '@models/userAuthToken.model';
import { NotificationEvent } from '@models/notificationEvent.model';
import { Notification } from '@models/notification.model';
import { NotificationPreference } from '@models/notificationPreference.model';
import { ClinicalReport } from '@models/clinicalReport.model';
import { ClinicalReportAnalytics } from '@models/clinicalReportAnalytics.model';
import { Doctor } from '@models/doctor.model';
import { ConsentTextVersion } from '@models/consentTextVersion.model';
import { ConsentRequest } from '@models/consentRequest.model';
import { ConsentItem } from '@models/consentItem.model';
import { ConsentItemTimeline } from '@models/consentItemTimeline.model';
import { ConsentAccessLog } from '@models/consentAccessLog.model';
import { ConsentAuditTrail } from '@models/consentAuditTrail.model';
import { UserProfile } from '@models/userProfile.model';
import { Nudge } from '@models/nudge.model';
import { ActivityLog } from '@models/activityLog.model';
import { Visit } from '@models/visit.model';
import { DrugLibrary } from '@models/drugLibrary.model';
import { Subscription } from '@models/subscription.model';
import { UserSubscription } from '@models/userSubscription.model';
import { UserSubscriptionPaymentInfo } from '@models/userSubscriptionPaymentInfo.model';
import { UserSubscriptionInvoice } from '@models/userSubscriptionInvoice.model';
import { UserSubscriptionAuditLog } from '@models/userSubscriptionAuditLog.model';
import { SubscriptionCoupon } from '@models/subscriptionCoupon.model';
import { UserPolicyAcceptance } from '@models/userPolicyAcceptance.model';

// Define associations
export const defineAssociations = () => {
  User.hasMany(OtpRequest, {
    foreignKey: 'userId',
    as: 'otpRequests',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  OtpRequest.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  User.hasMany(UserAuthToken, {
    foreignKey: 'userId',
    as: 'authTokens',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  UserAuthToken.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  UserAuthToken.belongsTo(UserAuthToken, {
    foreignKey: 'replacedByTokenId',
    as: 'replacedByToken',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  User.hasMany(Notification, {
    foreignKey: 'userId',
    as: 'notifications',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  Notification.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  NotificationEvent.hasMany(Notification, {
    foreignKey: 'notificationEventId',
    as: 'notifications',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  Notification.belongsTo(NotificationEvent, {
    foreignKey: 'notificationEventId',
    as: 'event',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  User.hasMany(NotificationPreference, {
    foreignKey: 'userId',
    as: 'notificationPreferences',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  NotificationPreference.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  NotificationEvent.hasMany(NotificationPreference, {
    foreignKey: 'notificationEventId',
    as: 'notificationPreferences',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  NotificationPreference.belongsTo(NotificationEvent, {
    foreignKey: 'notificationEventId',
    as: 'event',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  User.hasMany(ClinicalReport, {
    foreignKey: 'userId',
    as: 'clinicalReports',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ClinicalReport.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  ClinicalReport.hasOne(ClinicalReportAnalytics, {
    foreignKey: 'clinicalReportId',
    as: 'analytics',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ClinicalReportAnalytics.belongsTo(ClinicalReport, {
    foreignKey: 'clinicalReportId',
    as: 'report',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Doctor.hasMany(ConsentRequest, {
    foreignKey: 'doctorId',
    as: 'consentRequests',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ConsentRequest.belongsTo(Doctor, {
    foreignKey: 'doctorId',
    as: 'doctor',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  ConsentTextVersion.hasMany(ConsentRequest, {
    foreignKey: 'consentTextVersionId',
    as: 'consentRequests',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  ConsentRequest.belongsTo(ConsentTextVersion, {
    foreignKey: 'consentTextVersionId',
    as: 'consentTextVersionRecord',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  ConsentRequest.hasMany(ConsentItem, {
    foreignKey: 'consentRequestId',
    as: 'items',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ConsentItem.belongsTo(ConsentRequest, {
    foreignKey: 'consentRequestId',
    as: 'request',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  ConsentItem.hasMany(ConsentItemTimeline, {
    foreignKey: 'consentItemId',
    as: 'timeline',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ConsentItemTimeline.belongsTo(ConsentItem, {
    foreignKey: 'consentItemId',
    as: 'item',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  ConsentRequest.hasMany(ConsentItemTimeline, {
    foreignKey: 'consentRequestId',
    as: 'timeline',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ConsentItemTimeline.belongsTo(ConsentRequest, {
    foreignKey: 'consentRequestId',
    as: 'request',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Doctor.hasMany(ConsentAccessLog, {
    foreignKey: 'doctorId',
    as: 'accessLogs',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  ConsentAccessLog.belongsTo(Doctor, {
    foreignKey: 'doctorId',
    as: 'doctor',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  ConsentRequest.hasMany(ConsentAccessLog, {
    foreignKey: 'consentRequestId',
    as: 'accessLogs',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  ConsentAccessLog.belongsTo(ConsentRequest, {
    foreignKey: 'consentRequestId',
    as: 'request',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  ConsentItem.hasMany(ConsentAccessLog, {
    foreignKey: 'consentItemId',
    as: 'accessLogs',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  ConsentAccessLog.belongsTo(ConsentItem, {
    foreignKey: 'consentItemId',
    as: 'item',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  User.hasOne(UserProfile, {
    foreignKey: 'userId',
    as: 'profile',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  UserProfile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  // Nudges
  User.hasMany(Nudge, {
    foreignKey: 'userId',
    as: 'nudges',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  Nudge.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Doctor.hasMany(Nudge, {
    foreignKey: 'nudgedByDoctorId',
    as: 'nudges',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  Nudge.belongsTo(Doctor, {
    foreignKey: 'nudgedByDoctorId',
    as: 'nudgedByDoctor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // Activity Logs
  User.hasMany(ActivityLog, {
    foreignKey: 'userId',
    as: 'activityLogs',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  ActivityLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // Visits
  User.hasMany(Visit, {
    foreignKey: 'userId',
    as: 'visits',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  Visit.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  Doctor.hasMany(Visit, {
    foreignKey: 'doctorId',
    as: 'visits',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  Visit.belongsTo(Doctor, {
    foreignKey: 'doctorId',
    as: 'doctor',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // Subscriptions
  Subscription.hasMany(UserSubscription, {
    foreignKey: 'subscriptionId',
    as: 'userSubscriptions',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
  UserSubscription.belongsTo(Subscription, {
    foreignKey: 'subscriptionId',
    as: 'subscription',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  User.hasMany(UserSubscription, {
    foreignKey: 'userId',
    as: 'userSubscriptions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  UserSubscription.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  // Subscription Payment Info
  User.hasMany(UserSubscriptionPaymentInfo, {
    foreignKey: 'userId',
    as: 'paymentInfo',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  UserSubscriptionPaymentInfo.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  // Subscription Invoices
  UserSubscription.hasMany(UserSubscriptionInvoice, {
    foreignKey: 'userSubscriptionId',
    as: 'invoices',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  UserSubscriptionInvoice.belongsTo(UserSubscription, {
    foreignKey: 'userSubscriptionId',
    as: 'userSubscription',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  // Subscription Audit Logs
  User.hasMany(UserSubscriptionAuditLog, {
    foreignKey: 'userId',
    as: 'subscriptionAuditLogs',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  UserSubscriptionAuditLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });

  UserSubscription.hasMany(UserSubscriptionAuditLog, {
    foreignKey: 'userSubscriptionId',
    as: 'auditLogs',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  UserSubscriptionAuditLog.belongsTo(UserSubscription, {
    foreignKey: 'userSubscriptionId',
    as: 'userSubscription',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // Consent Audit Trail
  ConsentRequest.hasMany(ConsentAuditTrail, {
    foreignKey: 'consentRequestId',
    as: 'auditTrail',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
  ConsentAuditTrail.belongsTo(ConsentRequest, {
    foreignKey: 'consentRequestId',
    as: 'consentRequest',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // User Policy Acceptance
  User.hasMany(UserPolicyAcceptance, {
    foreignKey: 'userId',
    as: 'policyAcceptances',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
  UserPolicyAcceptance.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

