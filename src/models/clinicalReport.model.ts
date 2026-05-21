import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export type ClinicalReportAnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ClinicalReportAttributes {
  id: string;
  userId: string;
  reportType: string;
  description?: string | null;
  reportDate: Date;
  uploadedDate: Date;
  fileUrl: string;
  fileSizeBytes?: string | number | null;
  fileMimeType?: string | null;
  labName?: string | null;
  doctorName?: string | null;
  isAnalyzed: boolean;
  analysisStatus?: ClinicalReportAnalysisStatus | null;
  tags?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type ClinicalReportCreationAttributes = Optional<
  ClinicalReportAttributes,
  | 'id'
  | 'description'
  | 'fileSizeBytes'
  | 'fileMimeType'
  | 'labName'
  | 'doctorName'
  | 'isAnalyzed'
  | 'analysisStatus'
  | 'tags'
  | 'metadata'
  | 'createdAt'
  | 'updatedAt'
>;

export class ClinicalReport
  extends Model<ClinicalReportAttributes, ClinicalReportCreationAttributes>
  implements ClinicalReportAttributes
{
  public id!: string;
  public userId!: string;
  public reportType!: string;
  public description?: string | null;
  public reportDate!: Date;
  public uploadedDate!: Date;
  public fileUrl!: string;
  public fileSizeBytes?: string | number | null;
  public fileMimeType?: string | null;
  public labName?: string | null;
  public doctorName?: string | null;
  public isAnalyzed!: boolean;
  public analysisStatus?: ClinicalReportAnalysisStatus | null;
  public tags?: Record<string, unknown> | null;
  public metadata?: Record<string, unknown> | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public deletedAt?: Date | null;
}

ClinicalReport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    reportType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'report_type',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reportDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'report_date',
    },
    uploadedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'uploaded_date',
    },
    fileUrl: {
      type: DataTypes.STRING(2000),
      allowNull: false,
      field: 'file_url',
    },
    fileSizeBytes: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'file_size_bytes',
    },
    fileMimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'file_mime_type',
    },
    labName: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'lab_name',
    },
    doctorName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'doctor_name',
    },
    isAnalyzed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_analyzed',
    },
    analysisStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'analysis_status',
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'clinical_reports',
    timestamps: true,
    underscored: false,
  }
);
