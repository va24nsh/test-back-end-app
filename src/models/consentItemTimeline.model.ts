import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface ConsentItemTimelineAttributes {
  id: string;
  consentItemId: string;
  consentRequestId: string;
  eventType: string;
  eventDescription?: string | null;
  actorType: string;
  actorId?: string | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  deviceInfo?: Record<string, unknown> | null;
  geoLocation?: Record<string, unknown> | null;
  eventTimestamp: Date;
  createdAt: Date;
}

export type ConsentItemTimelineCreationAttributes = Optional<ConsentItemTimelineAttributes, 'id' | 'eventDescription' | 'actorId' | 'oldStatus' | 'newStatus' | 'oldValues' | 'newValues' | 'ipAddress' | 'deviceInfo' | 'geoLocation' | 'createdAt'>;

export class ConsentItemTimeline
  extends Model<ConsentItemTimelineAttributes, ConsentItemTimelineCreationAttributes>
  implements ConsentItemTimelineAttributes
{
  public id!: string;
  public consentItemId!: string;
  public consentRequestId!: string;
  public eventType!: string;
  public eventDescription?: string | null;
  public actorType!: string;
  public actorId?: string | null;
  public oldStatus?: string | null;
  public newStatus?: string | null;
  public oldValues?: Record<string, unknown> | null;
  public newValues?: Record<string, unknown> | null;
  public ipAddress?: string | null;
  public deviceInfo?: Record<string, unknown> | null;
  public geoLocation?: Record<string, unknown> | null;
  public eventTimestamp!: Date;
  public readonly createdAt!: Date;
}

ConsentItemTimeline.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    consentItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'consent_item_id',
    },
    consentRequestId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'consent_request_id',
    },
    eventType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'event_type',
    },
    eventDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'event_description',
    },
    actorType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'actor_type',
    },
    actorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'actor_id',
    },
    oldStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'old_status',
    },
    newStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'new_status',
    },
    oldValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'old_values',
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'new_values',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'device_info',
    },
    geoLocation: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'geo_location',
    },
    eventTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'event_timestamp',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'consent_item_timeline',
    timestamps: true,
    updatedAt: false,
    underscored: false,
  }
);
