import crypto from 'crypto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl as getAwsSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Storage as GcpStorage } from '@google-cloud/storage';
import { config } from '@config/environment';

export type StorageOperation = 'upload' | 'access';
export type StorageProviderKind = 'aws' | 'gcp' | 'local';

export interface SignedStorageUrlInput {
  fileKey: string;
  contentType?: string;
  expiresInSeconds?: number;
}

export interface StorageArtifact {
  uploadUrl?: string;
  accessUrl?: string;
  fileKey: string;
  fileUrl: string;
  expiresInSeconds: number;
}

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60;
const DEFAULT_BUCKET_REGION = 'us-east-1';
const SUPPORTED_PROVIDER_VALUES: StorageProviderKind[] = ['aws', 'gcp', 'local'];

const normalizeProvider = (value: string): string => value.trim().toLowerCase() || 'local';

const sanitizeSignatureInput = (value: string): string => value.replace(/\s+/g, '');

const normalizePrivateKey = (value: string): string => value.replace(/\\n/g, '\n');

const getLocalFileUrlScheme = (): string => 'local';

const getAwsFileUrlScheme = (): string => 's3';

const getGcpFileUrlScheme = (): string => 'gs';

export class StorageOrchestrator {
  private readonly provider: string;

  private readonly bucketName: string;

  private readonly signingSecret: string;

  private readonly awsClient?: S3Client;

  private readonly gcpStorage?: GcpStorage;

  constructor() {
    this.provider = SUPPORTED_PROVIDER_VALUES.includes(normalizeProvider(config.CLOUD_PROVIDER) as StorageProviderKind)
      ? normalizeProvider(config.CLOUD_PROVIDER)
      : 'local';
    this.bucketName = sanitizeSignatureInput(config.STORAGE_BUCKET_NAME);
    this.signingSecret = config.STORAGE_SIGNING_SECRET;

    if (this.provider === 'aws') {
      this.awsClient = new S3Client({
        region: config.AWS_REGION || DEFAULT_BUCKET_REGION,
        credentials: config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: config.AWS_ACCESS_KEY_ID,
              secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
              sessionToken: config.AWS_SESSION_TOKEN,
            }
          : undefined,
      });
    }

    if (this.provider === 'gcp') {
      this.gcpStorage = new GcpStorage({
        projectId: config.GCP_PROJECT_ID || undefined,
        credentials:
          config.GCP_CLIENT_EMAIL && config.GCP_PRIVATE_KEY
            ? {
                client_email: config.GCP_CLIENT_EMAIL,
                private_key: normalizePrivateKey(config.GCP_PRIVATE_KEY),
              }
            : undefined,
      });
    }
  }

  buildFileUrl(fileKey: string): string {
    if (this.provider === 'aws') {
      return `${getAwsFileUrlScheme()}://${this.bucketName}/${fileKey}`;
    }

    if (this.provider === 'gcp') {
      return `${getGcpFileUrlScheme()}://${this.bucketName}/${fileKey}`;
    }

    return `${getLocalFileUrlScheme()}://${this.bucketName}/${fileKey}`;
  }

  parseFileUrl(fileUrl: string): { provider: string; bucketName: string; fileKey: string } {
    const match = fileUrl.match(/^([a-z0-9_-]+):\/\/([^/]+)\/(.+)$/i);

    if (!match) {
      throw new Error('INVALID_FILE_URL');
    }

    return {
      provider: match[1].toLowerCase(),
      bucketName: match[2],
      fileKey: match[3],
    };
  }

  private async createAwsUploadUrl(input: SignedStorageUrlInput): Promise<string> {
    if (!this.awsClient) {
      throw new Error('AWS_STORAGE_CLIENT_NOT_INITIALIZED');
    }

    return getAwsSignedUrl(
      this.awsClient,
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: input.fileKey,
        ContentType: input.contentType,
      }),
      { expiresIn: input.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS }
    );
  }

  private async createAwsAccessUrl(input: SignedStorageUrlInput): Promise<string> {
    if (!this.awsClient) {
      throw new Error('AWS_STORAGE_CLIENT_NOT_INITIALIZED');
    }

    return getAwsSignedUrl(
      this.awsClient,
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: input.fileKey,
      }),
      { expiresIn: input.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS }
    );
  }

  private async createGcpUploadUrl(input: SignedStorageUrlInput): Promise<string> {
    if (!this.gcpStorage) {
      throw new Error('GCP_STORAGE_CLIENT_NOT_INITIALIZED');
    }

    const file = this.gcpStorage.bucket(this.bucketName).file(input.fileKey);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + (input.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS) * 1000,
      contentType: input.contentType,
    });

    return url;
  }

  private async createGcpAccessUrl(input: SignedStorageUrlInput): Promise<string> {
    if (!this.gcpStorage) {
      throw new Error('GCP_STORAGE_CLIENT_NOT_INITIALIZED');
    }

    const file = this.gcpStorage.bucket(this.bucketName).file(input.fileKey);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + (input.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS) * 1000,
    });

    return url;
  }

  private buildLocalSignedUrl(operation: StorageOperation, input: SignedStorageUrlInput): string {
    const expiresInSeconds = input.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signature = crypto
      .createHmac('sha256', this.signingSecret)
      .update([this.provider, operation, this.bucketName, input.fileKey, input.contentType || '', String(expiresInSeconds)].join('|'))
      .digest('hex');

    const url = new URL(`https://storage.local/${operation}`);
    url.searchParams.set('provider', this.provider);
    url.searchParams.set('bucket', this.bucketName);
    url.searchParams.set('fileKey', input.fileKey);
    url.searchParams.set('expiresAt', String(expiresAt));
    url.searchParams.set('signature', signature);

    if (input.contentType) {
      url.searchParams.set('contentType', input.contentType);
    }

    return url.toString();
  }

  async createUploadUrl(input: SignedStorageUrlInput): Promise<StorageArtifact> {
    const expiresInSeconds = input.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS;
    const uploadUrl =
      this.provider === 'aws'
        ? await this.createAwsUploadUrl(input)
        : this.provider === 'gcp'
          ? await this.createGcpUploadUrl(input)
          : this.buildLocalSignedUrl('upload', input);

    return {
      uploadUrl,
      fileKey: input.fileKey,
      fileUrl: this.buildFileUrl(input.fileKey),
      expiresInSeconds,
    };
  }

  async createAccessUrl(input: SignedStorageUrlInput): Promise<StorageArtifact> {
    const expiresInSeconds = input.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS;
    const accessUrl =
      this.provider === 'aws'
        ? await this.createAwsAccessUrl(input)
        : this.provider === 'gcp'
          ? await this.createGcpAccessUrl(input)
          : this.buildLocalSignedUrl('access', input);

    return {
      accessUrl,
      fileKey: input.fileKey,
      fileUrl: this.buildFileUrl(input.fileKey),
      expiresInSeconds,
    };
  }
}