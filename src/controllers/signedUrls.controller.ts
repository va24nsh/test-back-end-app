import crypto from 'crypto';
import { config } from '@config/environment';
import { LoggerFactory, StorageOrchestrator } from '@adapters';
import { BadRequestError, ForbiddenError, NotFoundError, ValidationError } from '@errors';
import { ClinicalReport, User } from '@models';
import { ExtendedRequest, ExtendedResponse } from '@types';
import { handleControllerError } from '@utils/errorHandler';
import { SignedUrlValidationSchemas } from '@validators';

const logger = new LoggerFactory().createLogger('SignedUrlsController');
const storageOrchestrator = new StorageOrchestrator();
const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60;

const allowedPublicContentTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const allowedPrivateUploadContentTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);

type SignedUploadInput = {
  fileName: string;
  contentType: string;
  featureName: 'user' | 'clinical_report';
  featureId: string;
  event: 'profile' | 'upload';
};

type SignedDownloadInput = {
  fileUrl: string;
};

const sanitizeFileName = (fileName: string): string => {
  const trimmed = fileName.trim();
  const safeName = trimmed
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');

  if (!safeName) {
    throw new BadRequestError('INVALID_FILE_NAME');
  }

  return safeName;
};

const getFileExtension = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > -1 ? fileName.slice(dotIndex).toLowerCase() : '';
};

const buildFileKey = (workspaceId: string, input: SignedUploadInput): string => {
  const extension = getFileExtension(input.fileName);
  const baseName = sanitizeFileName(input.fileName).replace(/\.[^.]+$/, '');
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  return `workspaces/${workspaceId}/${input.featureName}/${input.featureId}/${input.event}/${baseName}_${timestamp}_${randomSuffix}${extension}`;
};

const getCurrentUserByFirebaseUid = async (firebaseUid?: string) => {
  if (!firebaseUid) {
    throw new ValidationError('Firebase user identity is required');
  }

  const user = await User.findOne({ where: { firebaseUserId: firebaseUid } });
  if (!user || !user.dataValues.isActive) {
    throw new NotFoundError('User not found');
  }

  return user;
};

const ensureFeatureCombination = (input: SignedUploadInput, privateRoute: boolean): void => {
  if (!privateRoute) {
    if (input.featureName !== 'user' || input.event !== 'profile') {
      throw new BadRequestError('INVALID_UPLOAD_INTENT');
    }

    return;
  }

  if (input.featureName === 'user' && input.event === 'profile') {
    return;
  }

  if (input.featureName === 'clinical_report' && input.event === 'upload') {
    return;
  }

  throw new BadRequestError('INVALID_UPLOAD_INTENT');
};

const ensureContentType = (contentType: string, privateRoute: boolean): void => {
  const isAllowed = privateRoute
    ? allowedPrivateUploadContentTypes.has(contentType)
    : allowedPublicContentTypes.has(contentType);

  if (!isAllowed) {
    throw new BadRequestError('UNSUPPORTED_CONTENT_TYPE');
  }
};

const resolveWorkspaceId = (userId: string): string => {
  if (config.STORAGE_WORKSPACE_ID && config.STORAGE_WORKSPACE_ID !== 'default') {
    return config.STORAGE_WORKSPACE_ID;
  }

  return userId;
};

const findOwnedFile = async (userId: string, fileUrl: string): Promise<string> => {
  const profilePicture = await User.findOne({
    where: { id: userId, profilePicture: fileUrl },
    attributes: ['id'],
  });

  if (profilePicture) {
    return fileUrl;
  }

  const clinicalReport = await ClinicalReport.findOne({
    where: { userId, fileUrl },
    attributes: ['id'],
  });

  if (clinicalReport) {
    return fileUrl;
  }

  throw new ForbiddenError('FILE_NOT_OWNED_BY_USER');
};

export const signedUrlsController = {
  publicUpload: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const input = SignedUrlValidationSchemas.validate<SignedUploadInput>(
        SignedUrlValidationSchemas.publicUpload,
        req.body
      );

      ensureContentType(input.contentType, false);
      ensureFeatureCombination(input, false);

      const user = await getCurrentUserByFirebaseUid(req.firebaseUser?.uid);
      const workspaceId = resolveWorkspaceId(user.dataValues.id);
      const fileKey = buildFileKey(workspaceId, input);
      const artifact = await storageOrchestrator.createUploadUrl({
        fileKey,
        contentType: input.contentType,
        expiresInSeconds: DEFAULT_EXPIRES_IN_SECONDS,
      });

      const response = {
        uploadUrl: artifact.uploadUrl,
        fileKey: artifact.fileKey,
        fileUrl: artifact.fileUrl,
        expiresInSeconds: artifact.expiresInSeconds,
      };

      res.sendResponse(response, 'Signed upload URL generated successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'publicUpload' });
    }
  },

  privateSignedUrl: async (req: ExtendedRequest, res: ExtendedResponse) => {
    try {
      const validated = SignedUrlValidationSchemas.validate<
        SignedUploadInput | SignedDownloadInput
      >(
        SignedUrlValidationSchemas.privateSignedUrl,
        req.body
      );

      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      if ('fileUrl' in validated) {
        let parsed;

        try {
          parsed = storageOrchestrator.parseFileUrl(validated.fileUrl);
        } catch (error) {
          throw new BadRequestError('INVALID_FILE_URL');
        }

        const fileUrl = await findOwnedFile(userId, validated.fileUrl);
        const artifact = await storageOrchestrator.createAccessUrl({
          fileKey: parsed.fileKey,
          expiresInSeconds: DEFAULT_EXPIRES_IN_SECONDS,
        });

        const response = {
          accessUrl: artifact.accessUrl,
          fileKey: artifact.fileKey,
          fileUrl,
          expiresInSeconds: artifact.expiresInSeconds,
        };

        res.sendResponse(response, 'Signed access URL generated successfully');
        return;
      }

      ensureContentType(validated.contentType, true);
      ensureFeatureCombination(validated, true);

      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const workspaceId = resolveWorkspaceId(user.dataValues.id);
      const fileKey = buildFileKey(workspaceId, validated);
      const artifact = await storageOrchestrator.createUploadUrl({
        fileKey,
        contentType: validated.contentType,
        expiresInSeconds: DEFAULT_EXPIRES_IN_SECONDS,
      });

      const response = {
        uploadUrl: artifact.uploadUrl,
        fileKey: artifact.fileKey,
        fileUrl: artifact.fileUrl,
        expiresInSeconds: artifact.expiresInSeconds,
      };

      res.sendResponse(response, 'Signed upload URL generated successfully');
    } catch (error) {
      handleControllerError(error, res, logger, { method: 'privateSignedUrl' });
    }
  },
};