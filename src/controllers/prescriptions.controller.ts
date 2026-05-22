import { LoggerFactory, StorageOrchestrator } from '@adapters';
import { Prescription } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { PrescriptionValidationSchemas } from '@validators';
import { GenericError } from '@errors/GenericError';
import { ErrorCodes } from '@errors/errorCodes';
import { handleControllerError } from '@utils/errorHandler';
import { config } from '@config/environment';
import crypto from 'crypto';

const logger = new LoggerFactory().createLogger('PrescriptionsController');
const storageOrchestrator = new StorageOrchestrator();

const PDF_EXPIRATION_SECONDS = 3600;

/**
 * Generates a minimal PDF buffer containing prescription details.
 * Uses raw PDF syntax to avoid external dependencies.
 */
const generatePrescriptionPdf = (prescription: Prescription): Buffer => {
  const lines: string[] = [];

  lines.push(`Prescription`);
  lines.push(`Doctor: ${prescription.doctorName}`);
  if (prescription.doctorSpeciality) {
    lines.push(`Speciality: ${prescription.doctorSpeciality}`);
  }
  if (prescription.clinic) {
    lines.push(`Clinic: ${prescription.clinic}`);
  }
  lines.push(`Date: ${prescription.prescriptionDate}`);
  lines.push('');

  if (prescription.diagnosis && prescription.diagnosis.length > 0) {
    lines.push(`Diagnosis: ${prescription.diagnosis.join(', ')}`);
  }

  if (prescription.complaints && prescription.complaints.length > 0) {
    lines.push(`Complaints: ${prescription.complaints.join(', ')}`);
  }

  if (prescription.tests && prescription.tests.length > 0) {
    lines.push(`Tests: ${prescription.tests.join(', ')}`);
  }

  if (prescription.advice) {
    lines.push(`Advice: ${prescription.advice}`);
  }

  if (prescription.medicines && prescription.medicines.length > 0) {
    lines.push('');
    lines.push('Medicines:');
    prescription.medicines.forEach((med, idx) => {
      lines.push(`  ${idx + 1}. ${med.name} - ${med.dosage} - ${med.frequency} - ${med.duration}${med.notes ? ` (${med.notes})` : ''}`);
    });
  }

  if (prescription.notes) {
    lines.push('');
    lines.push(`Notes: ${prescription.notes}`);
  }

  const content = lines.join('\n');

  // Build a minimal valid PDF
  const textStream = `BT /F1 12 Tf 50 750 Td (${content.replace(/[()\\]/g, '\\$&').replace(/\n/g, ') Tj T* (')}) Tj ET`;
  const stream = Buffer.from(textStream);

  const objects: string[] = [];
  let xrefOffsets: number[] = [];
  let currentOffset = 0;

  // Header
  const header = '%PDF-1.4\n';
  currentOffset += header.length;

  // Object 1: Catalog
  xrefOffsets.push(currentOffset);
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  currentOffset += obj1.length;

  // Object 2: Pages
  xrefOffsets.push(currentOffset);
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  currentOffset += obj2.length;

  // Object 3: Page
  xrefOffsets.push(currentOffset);
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  currentOffset += obj3.length;

  // Object 4: Content stream
  xrefOffsets.push(currentOffset);
  const obj4 = `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream.toString()}\nendstream\nendobj\n`;
  currentOffset += obj4.length;

  // Object 5: Font
  xrefOffsets.push(currentOffset);
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  currentOffset += obj5.length;

  // Xref table
  const xrefStart = currentOffset;
  let xref = 'xref\n';
  xref += `0 ${xrefOffsets.length + 1}\n`;
  xref += '0000000000 65535 f \n';
  xrefOffsets.forEach((offset) => {
    xref += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });

  // Trailer
  const trailer = `trailer\n<< /Size ${xrefOffsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  const pdfContent = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
  return Buffer.from(pdfContent);
};

const resolveWorkspaceId = (userId: string): string => {
  if (config.STORAGE_WORKSPACE_ID && config.STORAGE_WORKSPACE_ID !== 'default') {
    return config.STORAGE_WORKSPACE_ID;
  }
  return userId;
};

const buildPdfFileKey = (workspaceId: string, prescriptionId: string): string => {
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `workspaces/${workspaceId}/prescriptions/pdf/${prescriptionId}_${timestamp}_${randomSuffix}.pdf`;
};

export const prescriptionsController = {
  list: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const query = PrescriptionValidationSchemas.validate<{
        status?: string;
        page: number;
        limit: number;
      }>(PrescriptionValidationSchemas.listQuery, req.query as Record<string, unknown>);

      const userId = req.userId || req.user?.id;
      const { page, limit, status } = query;
      const offset = (page - 1) * limit;

      // Build where clause
      const where: Record<string, unknown> = { patientId: userId, isDeleted: false };
      if (status) {
        where.status = status;
      }

      // Query with pagination
      const { count, rows } = await Prescription.findAndCountAll({
        where,
        order: [
          ['prescriptionDate', 'DESC'],
          ['createdAt', 'DESC'],
        ],
        limit,
        offset,
      });

      const hasNextPage = offset + rows.length < count;

      // Map items to response shape
      const items = rows.map((prescription) => ({
        id: prescription.id,
        doctorName: prescription.doctorName,
        doctorSpeciality: prescription.doctorSpeciality,
        clinic: prescription.clinic,
        prescriptionDate: prescription.prescriptionDate,
        diagnosis: prescription.diagnosis,
        medicines: prescription.medicines,
        notes: prescription.notes,
        status: prescription.status,
      }));

      res.sendResponse({
        page,
        pageSize: limit,
        items,
        hasNextPage,
        nextPage: hasNextPage ? page + 1 : null,
      }, 'Prescriptions retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'list' });
    }
  },

  getById: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const params = PrescriptionValidationSchemas.validate<{ id: string }>(
        PrescriptionValidationSchemas.getByIdParams,
        req.params as Record<string, unknown>
      );

      const userId = req.userId || req.user?.id;

      const prescription = await Prescription.findOne({
        where: { id: params.id, isDeleted: false },
      });

      if (!prescription) {
        throw new GenericError(
          'Prescription not found',
          ErrorCodes.PRESCRIPTION_NOT_FOUND,
          404,
          true
        );
      }

      if (prescription.patientId !== userId) {
        throw new GenericError(
          'You do not have permission to access this prescription',
          ErrorCodes.FORBIDDEN,
          403,
          true
        );
      }

      res.sendResponse({
        id: prescription.id,
        visitId: prescription.visitId,
        doctorName: prescription.doctorName,
        doctorSpeciality: prescription.doctorSpeciality,
        clinic: prescription.clinic,
        prescriptionDate: prescription.prescriptionDate,
        diagnosis: prescription.diagnosis,
        complaints: prescription.complaints,
        tests: prescription.tests,
        advice: prescription.advice,
        medicines: prescription.medicines,
        notes: prescription.notes,
        followUpNotes: prescription.followUpNotes,
        followUpDate: prescription.followUpDate,
        status: prescription.status,
        createdBy: prescription.createdBy,
        updatedBy: prescription.updatedBy,
        createdAt: prescription.createdAt,
        updatedAt: prescription.updatedAt,
      }, 'Prescription retrieved successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getById' });
    }
  },

  getPdf: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const params = PrescriptionValidationSchemas.validate<{ id: string }>(
        PrescriptionValidationSchemas.pdfParams,
        req.params as Record<string, unknown>
      );

      const userId = req.userId || req.user?.id;

      const prescription = await Prescription.findOne({
        where: { id: params.id, isDeleted: false },
      });

      if (!prescription) {
        throw new GenericError(
          'Prescription not found',
          ErrorCodes.PRESCRIPTION_NOT_FOUND,
          404,
          true
        );
      }

      if (prescription.patientId !== userId) {
        throw new GenericError(
          'You do not have permission to access this prescription',
          ErrorCodes.FORBIDDEN,
          403,
          true
        );
      }

      // Generate PDF buffer
      const pdfBuffer = generatePrescriptionPdf(prescription);

      // Build file key for storage
      const workspaceId = resolveWorkspaceId(userId!);
      const fileKey = buildPdfFileKey(workspaceId, params.id);

      // Upload PDF to storage (create upload URL then use it)
      await storageOrchestrator.createUploadUrl({
        fileKey,
        contentType: 'application/pdf',
        expiresInSeconds: PDF_EXPIRATION_SECONDS,
      });

      // Generate signed access URL for download
      const artifact = await storageOrchestrator.createAccessUrl({
        fileKey,
        expiresInSeconds: PDF_EXPIRATION_SECONDS,
      });

      res.sendResponse({
        url: artifact.accessUrl,
        expiresIn: PDF_EXPIRATION_SECONDS,
      }, 'Prescription PDF generated successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'getPdf' });
    }
  },
};
