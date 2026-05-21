/**
 * Models Index
 * 
 * This module exports all Sequelize models and provides a centralized db object.
 */

/**
 * Models Index
 * 
 * This module exports all Sequelize models and provides a centralized db object.
 */

import { Sequelize } from 'sequelize';
import sequelize from '@config/database';
import { User } from '@models/user.model';
import { OtpRequest } from '@models/otpRequest.model';
import { OtpAttempt } from '@models/otpAttempt.model';
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
import { defineAssociations } from '@models/associations';

interface DatabaseModels {
  sequelize: typeof sequelize;
  Sequelize: typeof Sequelize;
  User: typeof User;
  OtpRequest: typeof OtpRequest;
  OtpAttempt: typeof OtpAttempt;
  UserAuthToken: typeof UserAuthToken;
  NotificationEvent: typeof NotificationEvent;
  Notification: typeof Notification;
  NotificationPreference: typeof NotificationPreference;
  ClinicalReport: typeof ClinicalReport;
  ClinicalReportAnalytics: typeof ClinicalReportAnalytics;
  Doctor: typeof Doctor;
  ConsentTextVersion: typeof ConsentTextVersion;
  ConsentRequest: typeof ConsentRequest;
  ConsentItem: typeof ConsentItem;
  ConsentItemTimeline: typeof ConsentItemTimeline;
  ConsentAccessLog: typeof ConsentAccessLog;
  ConsentAuditTrail: typeof ConsentAuditTrail;
  UserProfile: typeof UserProfile;
  Nudge: typeof Nudge;
  ActivityLog: typeof ActivityLog;
  Visit: typeof Visit;
  DrugLibrary: typeof DrugLibrary;
  Subscription: typeof Subscription;
  UserSubscription: typeof UserSubscription;
  UserSubscriptionPaymentInfo: typeof UserSubscriptionPaymentInfo;
  UserSubscriptionInvoice: typeof UserSubscriptionInvoice;
  UserSubscriptionAuditLog: typeof UserSubscriptionAuditLog;
  SubscriptionCoupon: typeof SubscriptionCoupon;
  UserPolicyAcceptance: typeof UserPolicyAcceptance;
}

const db: DatabaseModels = {} as DatabaseModels;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Load models
db.User = User;
db.OtpRequest = OtpRequest;
db.OtpAttempt = OtpAttempt;
db.UserAuthToken = UserAuthToken;
db.NotificationEvent = NotificationEvent;
db.Notification = Notification;
db.NotificationPreference = NotificationPreference;
db.ClinicalReport = ClinicalReport;
db.ClinicalReportAnalytics = ClinicalReportAnalytics;
db.Doctor = Doctor;
db.ConsentTextVersion = ConsentTextVersion;
db.ConsentRequest = ConsentRequest;
db.ConsentItem = ConsentItem;
db.ConsentItemTimeline = ConsentItemTimeline;
db.ConsentAccessLog = ConsentAccessLog;
db.ConsentAuditTrail = ConsentAuditTrail;
db.UserProfile = UserProfile;
db.Nudge = Nudge;
db.ActivityLog = ActivityLog;
db.Visit = Visit;
db.DrugLibrary = DrugLibrary;
db.Subscription = Subscription;
db.UserSubscription = UserSubscription;
db.UserSubscriptionPaymentInfo = UserSubscriptionPaymentInfo;
db.UserSubscriptionInvoice = UserSubscriptionInvoice;
db.UserSubscriptionAuditLog = UserSubscriptionAuditLog;
db.SubscriptionCoupon = SubscriptionCoupon;
db.UserPolicyAcceptance = UserPolicyAcceptance;

// Define associations after all models are loaded
defineAssociations();

export default db;
export { User } from '@models/user.model';
export { OtpRequest } from '@models/otpRequest.model';
export { OtpAttempt } from '@models/otpAttempt.model';
export { UserAuthToken } from '@models/userAuthToken.model';
export { NotificationEvent } from '@models/notificationEvent.model';
export { Notification } from '@models/notification.model';
export { NotificationPreference } from '@models/notificationPreference.model';
export { ClinicalReport } from '@models/clinicalReport.model';
export { ClinicalReportAnalytics } from '@models/clinicalReportAnalytics.model';
export { Doctor } from '@models/doctor.model';
export { ConsentTextVersion } from '@models/consentTextVersion.model';
export { ConsentRequest } from '@models/consentRequest.model';
export { ConsentItem } from '@models/consentItem.model';
export { ConsentItemTimeline } from '@models/consentItemTimeline.model';
export { ConsentAccessLog } from '@models/consentAccessLog.model';
export { UserProfile } from '@models/userProfile.model';
export { Nudge } from '@models/nudge.model';
export { sequelize } from '@config/database';
