import { ClinicalReport, ClinicalReportAnalytics } from '@models';

export type ReportWithAnalytics = ClinicalReport & { analytics?: ClinicalReportAnalytics | null };

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OverallStatus = 'NO_DATA' | 'ANALYZING' | 'NORMAL' | 'WATCHLIST' | 'NEED_ATTENTION' | 'URGENT';

export interface MetricValue {
  value: number | string | null;
  unit: string | null;
}

export interface MetricRange {
  min: number | null;
  max: number | null;
  unit: string | null;
}

export interface TrendPoint {
  reportDate: string;
  value: number | null;
}

export interface DerivedInsight {
  id: string;
  severity: SeverityLevel;
  metricName: string;
  reportId: string;
  reportType: string;
  description: string | null;
  reportDate: string;
  current: MetricValue;
  expectedRange: MetricRange | null;
  previous: (MetricValue & { reportDate: string | null }) | null;
  delta: { absolute: number | null; percent: number | null } | null;
  trend: { points: TrendPoint[] };
}

export interface DerivedAbnormalItem {
  id: string;
  metricName: string;
  reportId: string;
  reportType: string;
  description: string | null;
  reportDate: string;
  current: MetricValue;
  expectedRange: MetricRange | null;
  riskLevel: SeverityLevel;
  previous: (MetricValue & { reportDate: string | null }) | null;
}

export interface HealthSummaryData {
  uploadedReportsCount: number;
  analyzedReportsCount: number;
  analyzedReportTypesCount: number;
  lastAnalyzedAt: string | null;
  overallStatus: OverallStatus;
  topInsights: DerivedInsight[];
  insights: DerivedInsight[];
  abnormalItems: DerivedAbnormalItem[];
}

const severityRank: Record<SeverityLevel, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const coerceString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const coerceNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const buildMetricId = (reportId: string, metricName: string): string => `${reportId}:${metricName}`;

const extractEntries = (source: unknown): Array<{ metricName: string; raw: Record<string, unknown> }> => {
  if (!source || typeof source !== 'object') {
    return [];
  }

  if (Array.isArray(source)) {
    return source.flatMap((item, index) => {
      if (!item || typeof item !== 'object') {
        return [];
      }

      const raw = item as Record<string, unknown>;
      const metricName = coerceString(raw.metricName) || coerceString(raw.name) || coerceString(raw.label) || `metric-${index + 1}`;
      return [{ metricName, raw }];
    });
  }

  return Object.entries(source).map(([metricName, rawValue]) => {
    if (rawValue && typeof rawValue === 'object') {
      return { metricName, raw: rawValue as Record<string, unknown> };
    }

    return { metricName, raw: { currentValue: rawValue } };
  });
};

const extractMetricValue = (raw: Record<string, unknown>): MetricValue => {
  if (raw.current && typeof raw.current === 'object') {
    const current = raw.current as Record<string, unknown>;
    const value = coerceNumber(current.value);
    return {
      value: value ?? coerceString(current.value),
      unit: coerceString(current.unit),
    };
  }

  const value =
    coerceNumber(raw.currentValue) ??
    coerceNumber(raw.value) ??
    coerceNumber(raw.resultValue) ??
    coerceNumber(raw.metricValue);

  return {
    value: value ?? coerceString(raw.currentValue) ?? coerceString(raw.value) ?? coerceString(raw.resultValue) ?? coerceString(raw.metricValue),
    unit: coerceString(raw.unit) || coerceString(raw.currentUnit) || coerceString(raw.resultUnit),
  };
};

const extractExpectedRange = (raw: Record<string, unknown>): MetricRange | null => {
  const rangeSource =
    raw.expectedRange && typeof raw.expectedRange === 'object'
      ? (raw.expectedRange as Record<string, unknown>)
      : raw.range && typeof raw.range === 'object'
        ? (raw.range as Record<string, unknown>)
        : raw.referenceRange && typeof raw.referenceRange === 'object'
          ? (raw.referenceRange as Record<string, unknown>)
          : null;

  if (!rangeSource) {
    return null;
  }

  return {
    min: coerceNumber(rangeSource.min) ?? coerceNumber(rangeSource.low) ?? coerceNumber(rangeSource.from),
    max: coerceNumber(rangeSource.max) ?? coerceNumber(rangeSource.high) ?? coerceNumber(rangeSource.to),
    unit: coerceString(rangeSource.unit) || coerceString(rangeSource.valueUnit),
  };
};

const extractSeverity = (raw: Record<string, unknown>, fallback: SeverityLevel): SeverityLevel => {
  const severity = coerceString(raw.riskLevel) || coerceString(raw.severity);
  if (severity === 'CRITICAL' || severity === 'HIGH' || severity === 'MEDIUM' || severity === 'LOW') {
    return severity;
  }

  return fallback;
};

const buildReportMetricLookup = (report: ReportWithAnalytics) => {
  const lookup = new Map<string, Record<string, unknown>>();

  [report.analytics?.keyFindings, report.analytics?.abnormalValues, report.analytics?.extractedData].forEach((source) => {
    extractEntries(source).forEach(({ metricName, raw }) => {
      if (!lookup.has(metricName)) {
        lookup.set(metricName, raw);
      }
    });
  });

  return lookup;
};

const buildMetricHistory = (reports: ReportWithAnalytics[], metricName: string) => {
  return reports.flatMap((report) => {
    const metric = buildReportMetricLookup(report).get(metricName);
    if (!metric) {
      return [];
    }

    const value = extractMetricValue(metric);
    const numericValue = coerceNumber(value.value);
    if (numericValue === null) {
      return [];
    }

    return [{ reportDate: String(report.dataValues.reportDate), value: numericValue }];
  });
};

const buildPreviousPoint = (
  reports: ReportWithAnalytics[],
  currentIndex: number,
  metricName: string
): { value: number | string | null; unit: string | null; reportDate: string | null } | null => {
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const metric = buildReportMetricLookup(reports[index]).get(metricName);
    if (!metric) {
      continue;
    }

    const value = extractMetricValue(metric);
    if (value.value === null) {
      continue;
    }

    return {
      value: value.value,
      unit: value.unit,
      reportDate: String(reports[index].dataValues.reportDate),
    };
  }

  return null;
};

const buildInsightFromEntry = (
  reportsForType: ReportWithAnalytics[],
  currentIndex: number,
  entry: { metricName: string; raw: Record<string, unknown> },
  report: ReportWithAnalytics
): DerivedInsight => {
  const current = extractMetricValue(entry.raw);
  const previous = buildPreviousPoint(reportsForType, currentIndex, entry.metricName);
  const currentNumber = coerceNumber(current.value);
  const previousNumber = previous ? coerceNumber(previous.value) : null;

  return {
    id: buildMetricId(report.dataValues.id, entry.metricName),
    severity: extractSeverity(entry.raw, (report.analytics?.riskLevel as SeverityLevel) || 'LOW'),
    metricName: entry.metricName,
    reportId: report.dataValues.id,
    reportType: report.dataValues.reportType,
    description: report.dataValues.description || null,
    reportDate: String(report.dataValues.reportDate),
    current,
    expectedRange: extractExpectedRange(entry.raw),
    previous,
    delta:
      currentNumber !== null && previousNumber !== null
        ? {
            absolute: Number((currentNumber - previousNumber).toFixed(2)),
            percent: previousNumber === 0 ? null : Number((((currentNumber - previousNumber) / previousNumber) * 100).toFixed(1)),
          }
        : null,
    trend: {
      points: buildMetricHistory(reportsForType, entry.metricName).slice(-6),
    },
  };
};

const buildAbnormalItemFromEntry = (
  reportsForType: ReportWithAnalytics[],
  currentIndex: number,
  entry: { metricName: string; raw: Record<string, unknown> },
  report: ReportWithAnalytics
): DerivedAbnormalItem => {
  const current = extractMetricValue(entry.raw);
  const previous = buildPreviousPoint(reportsForType, currentIndex, entry.metricName);

  return {
    id: buildMetricId(report.dataValues.id, entry.metricName),
    metricName: entry.metricName,
    reportId: report.dataValues.id,
    reportType: report.dataValues.reportType,
    description: report.dataValues.description || null,
    reportDate: String(report.dataValues.reportDate),
    current,
    expectedRange: extractExpectedRange(entry.raw),
    riskLevel: extractSeverity(entry.raw, (report.analytics?.riskLevel as SeverityLevel) || 'LOW'),
    previous,
  };
};

export const sortBySeverityAndDate = <T extends { riskLevel?: SeverityLevel; severity?: SeverityLevel; reportDate: string }>(items: T[]): T[] => {
  return [...items].sort((left, right) => {
    const leftSeverity = left.riskLevel || left.severity || 'LOW';
    const rightSeverity = right.riskLevel || right.severity || 'LOW';
    const severityDelta = (severityRank[leftSeverity] ?? 99) - (severityRank[rightSeverity] ?? 99);
    if (severityDelta !== 0) {
      return severityDelta;
    }

    return new Date(right.reportDate).getTime() - new Date(left.reportDate).getTime();
  });
};

export const buildHealthSummaryData = (reports: ReportWithAnalytics[]): HealthSummaryData => {
  const uploadedReportsCount = reports.length;
  const analyzedReports = reports.filter((report) => report.dataValues.analysisStatus === 'COMPLETED' && report.analytics);
  const analyzedReportsCount = analyzedReports.length;
  const analyzedReportTypesCount = new Set(analyzedReports.map((report) => report.dataValues.reportType)).size;
  const lastAnalyzedAt = analyzedReports
    .map((report) => report.analytics?.analysisDate)
    .filter((date): date is Date => Boolean(date))
    .sort((left, right) => right.getTime() - left.getTime())[0];

  if (uploadedReportsCount === 0) {
    return {
      uploadedReportsCount,
      analyzedReportsCount,
      analyzedReportTypesCount,
      lastAnalyzedAt: null,
      overallStatus: 'NO_DATA',
      topInsights: [],
      insights: [],
      abnormalItems: [],
    };
  }

  if (analyzedReportsCount === 0) {
    return {
      uploadedReportsCount,
      analyzedReportsCount,
      analyzedReportTypesCount,
      lastAnalyzedAt: null,
      overallStatus: 'ANALYZING',
      topInsights: [],
      insights: [],
      abnormalItems: [],
    };
  }

  const reportsByType = new Map<string, ReportWithAnalytics[]>();
  analyzedReports.forEach((report) => {
    const list = reportsByType.get(report.dataValues.reportType) || [];
    list.push(report);
    reportsByType.set(report.dataValues.reportType, list);
  });

  const latestByType = [...reportsByType.values()].map((group) => {
    return [...group].sort((left, right) => {
      const leftAnalysis = left.analytics?.analysisDate ? new Date(left.analytics.analysisDate).getTime() : 0;
      const rightAnalysis = right.analytics?.analysisDate ? new Date(right.analytics.analysisDate).getTime() : 0;
      if (rightAnalysis !== leftAnalysis) {
        return rightAnalysis - leftAnalysis;
      }

      const leftReportDate = new Date(left.reportDate).getTime();
      const rightReportDate = new Date(right.reportDate).getTime();
      return rightReportDate - leftReportDate;
    })[0];
  });

  const insights = latestByType.flatMap((report) => {
    const reportsForType = reportsByType.get(report.dataValues.reportType) || [];
    const currentIndex = reportsForType.indexOf(report);
    return extractEntries(report.analytics?.keyFindings || report.analytics?.abnormalValues || report.analytics?.extractedData).map((entry) =>
      buildInsightFromEntry(reportsForType, currentIndex, entry, report)
    );
  });

  const abnormalItems = analyzedReports.flatMap((report) => {
    const reportsForType = reportsByType.get(report.dataValues.reportType) || [];
    const currentIndex = reportsForType.indexOf(report);
    return extractEntries(report.analytics?.abnormalValues || report.analytics?.keyFindings).map((entry) =>
      buildAbnormalItemFromEntry(reportsForType, currentIndex, entry, report)
    );
  });

  const sortedInsights = sortBySeverityAndDate(insights).slice(0, 5);
  const sortedAbnormalItems = sortBySeverityAndDate(abnormalItems);
  const highestSeverity = sortedInsights[0]?.severity || sortedAbnormalItems[0]?.riskLevel || 'LOW';

  const overallStatus: OverallStatus =
    highestSeverity === 'CRITICAL'
      ? 'URGENT'
      : highestSeverity === 'HIGH'
        ? 'NEED_ATTENTION'
        : highestSeverity === 'MEDIUM' || highestSeverity === 'LOW'
          ? 'WATCHLIST'
          : 'NORMAL';

  return {
    uploadedReportsCount,
    analyzedReportsCount,
    analyzedReportTypesCount,
    lastAnalyzedAt: lastAnalyzedAt ? lastAnalyzedAt.toISOString() : null,
    overallStatus,
    topInsights: sortedInsights.slice(0, 2),
    insights: sortedInsights,
    abnormalItems: sortedAbnormalItems,
  };
};
