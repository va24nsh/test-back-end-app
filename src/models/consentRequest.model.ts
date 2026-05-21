import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type ConsentRequestSource = 'REQUEST' | 'SELF';
export type ConsentRequestAccessType = 'REPORTS' | 'PROFILE' | 'BOTH';
export type ConsentRequestType = 'FULL_REPORT' | 'DATE_RANGE' | 'SPECIFIC' | 'FULL_PROFILE' | 'SPECIFIC_SECTIONS';
export type ConsentRequestStatus = 'PENDING' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export interface ConsentRequestAttributes {
  id: string;
  doctorId: string;
  externalDoctorId?: string | null;
  userId: string;
  source: ConsentRequestSource;
  requestedAccessType: ConsentRequestAccessType;
  requestType: ConsentRequestType;
  requestScope?: Record<string, unknown> | null;
  requestMessage?: string | null;
  status: ConsentRequestStatus;
  grantedScope?: Record<string, unknown> | null;
  careProcessingConsent: boolean;
  trainingConsent: boolean;
  consentTextVersionId?: string | null;
  consentTextVersion?: string | null;
  consentTextCare?: string | null;
  consentTextTraining?: string | null;
  userConsentTimestamp?: Date | null;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
  revokedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ConsentRequestCreationAttributes = Optional<
  ConsentRequestAttributes,
  | 'id'
  | 'externalDoctorId'
  | 'requestScope'
  | 'requestMessage'
  | 'status'
  | 'grantedScope'
  | 'consentTextVersionId'
  | 'consentTextVersion'
  | 'consentTextCare'
  | 'consentTextTraining'
  | 'userConsentTimestamp'
  | 'expiresAt'
  | 'revokedAt'
  | 'revokedBy'
  | 'createdAt'
  | 'updatedAt'
>;

export class ConsentRequest
  extends Model<ConsentRequestAttributes, ConsentRequestCreationAttributes>
  implements ConsentRequestAttributes
{
  public id!: string;
  public doctorId!: string;
  public externalDoctorId?: string | null;
  public userId!: string;
  public source!: ConsentRequestSource;
  public requestedAccessType!: ConsentRequestAccessType;
  public requestType!: ConsentRequestType;
  public requestScope?: Record<string, unknown> | null;
  public requestMessage?: string | null;
  public status!: ConsentRequestStatus;
  public grantedScope?: Record<string, unknown> | null;
  public careProcessingConsent!: boolean;
  public trainingConsent!: boolean;
  public consentTextVersionId?: string | null;
  public consentTextVersion?: string | null;
  public consentTextCare?: string | null;
  public consentTextTraining?: string | null;
  public userConsentTimestamp?: Date | null;
  public expiresAt?: Date | null;
  public revokedAt?: Date | null;
  public revokedBy?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsentRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'doctor_id',
    },
    externalDoctorId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'external_doctor_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    source: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    requestedAccessType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'requested_access_type',
    },
    requestType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'request_type',
    },
    requestScope: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'request_scope',
    },
    requestMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'request_message',
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    grantedScope: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'granted_scope',
    },
    careProcessingConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'care_processing_consent',
    },
    trainingConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'training_consent',
    },
    consentTextVersionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'consent_text_version_id',
    },
    consentTextVersion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'consent_text_version',
    },
    consentTextCare: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'consent_text_care',
    },
    consentTextTraining: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'consent_text_training',
    },
    userConsentTimestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'user_consent_timestamp',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at',
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'revoked_at',
    },
    revokedBy: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'revoked_by',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'consent_requests',
    timestamps: true,
    underscored: false,
  }
);
