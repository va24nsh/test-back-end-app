import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@config/database';

export interface ClinicalReportAnalyticsAttributes {
  id: string;
  clinicalReportId: string;
  extractedData?: Record<string, unknown> | null;
  keyFindings?: Record<string, unknown> | null;
  normalRanges?: Record<string, unknown> | null;
  abnormalValues?: Record<string, unknown> | null;
  keyFindingsSummary?: string | null;
  recommendations?: string | null;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  analysisModelVersion?: string | null;
  analysisDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ClinicalReportAnalyticsCreationAttributes = Optional<
  ClinicalReportAnalyticsAttributes,
  | 'id'
  | 'extractedData'
  | 'keyFindings'
  | 'normalRanges'
  | 'abnormalValues'
  | 'keyFindingsSummary'
  | 'recommendations'
  | 'riskLevel'
  | 'analysisModelVersion'
  | 'createdAt'
  | 'updatedAt'
>;

export class ClinicalReportAnalytics
  extends Model<ClinicalReportAnalyticsAttributes, ClinicalReportAnalyticsCreationAttributes>
  implements ClinicalReportAnalyticsAttributes
{
  public id!: string;
  public clinicalReportId!: string;
  public extractedData?: Record<string, unknown> | null;
  public keyFindings?: Record<string, unknown> | null;
  public normalRanges?: Record<string, unknown> | null;
  public abnormalValues?: Record<string, unknown> | null;
  public keyFindingsSummary?: string | null;
  public recommendations?: string | null;
  public riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  public analysisModelVersion?: string | null;
  public analysisDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClinicalReportAnalytics.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    clinicalReportId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'clinical_report_id',
    },
    extractedData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'extracted_data',
    },
    keyFindings: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'key_findings',
    },
    normalRanges: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'normal_ranges',
    },
    abnormalValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'abnormal_values',
    },
    keyFindingsSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'key_findings_summary',
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    riskLevel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'risk_level',
    },
    analysisModelVersion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'analysis_model_version',
    },
    analysisDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'analysis_date',
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
    tableName: 'clinical_report_analytics',
    timestamps: true,
    underscored: false,
  }
);
