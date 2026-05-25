/**
 * Report Types Constants
 * 
 * This file contains all report type constants used throughout the application.
 */

export const REPORT_TYPES = {
  '2D_ECHOCARDIOGRAPHY': '2D Echocardiography',
  'AFB_SMEAR_AND_CULTURE': 'AFB Smear and Culture',
  'ARTERIAL_BLOOD_GAS': 'Arterial Blood Gas (ABG)',
  'ARTERIAL_DOPPLER': 'Arterial Doppler',
  'ASCITIC_FLUID_ANALYSIS': 'Ascitic Fluid Analysis',
  'BIOPSY_REPORT_HISTOPATHOLOGY': 'Biopsy Report (Histopathology)',
  'BLOOD_CULTURE': 'Blood Culture',
  'BONE_MARROW_ASPIRATION': 'Bone Marrow Aspiration',
  'BONE_MARROW_BIOPSY': 'Bone Marrow Biopsy',
  'BONE_SCAN': 'Bone Scan',
  'BREAST_MRI': 'Breast MRI',
  'BREAST_ULTRASOUND': 'Breast Ultrasound',
  'C_REACTIVE_PROTEIN': 'C-Reactive Protein',
  'CSF_ANALYSIS': 'CSF Analysis',
  'CT_ANGIOGRAPHY': 'CT Angiography',
  'CT_PERFUSION': 'CT Perfusion',
  'CT_SCAN': 'CT Scan',
  'CARDIAC_BIOMARKERS': 'Cardiac Biomarkers',
  'CARDIAC_CT': 'Cardiac CT',
  'CARDIAC_MRI': 'Cardiac MRI',
  'OTHER': 'Other',
} as const;

export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES];

// Array of all report types
export const ALL_REPORT_TYPES = Object.values(REPORT_TYPES);

// Array of report type keys
export const ALL_REPORT_TYPE_KEYS = Object.keys(REPORT_TYPES) as Array<keyof typeof REPORT_TYPES>;

// Validation helper
export const IS_VALID_REPORT_TYPE = (reportType: string): reportType is ReportType => {
  return Object.values(REPORT_TYPES).includes(reportType as ReportType);
};

// Get report type by key
export const GET_REPORT_TYPE_BY_KEY = (key: keyof typeof REPORT_TYPES): ReportType => {
  return REPORT_TYPES[key];
};

// Get report type key by value
export const GET_REPORT_TYPE_KEY = (value: ReportType): keyof typeof REPORT_TYPES | undefined => {
  const entry = Object.entries(REPORT_TYPES).find(([_, v]) => v === value);
  return entry ? (entry[0] as keyof typeof REPORT_TYPES) : undefined;
};

