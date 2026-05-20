const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = process.env.SPACES_REGION || 'nyc3';
const BUCKET = process.env.SPACES_BUCKET || 'schoolos-files';
const ENDPOINT = process.env.SPACES_ENDPOINT || `https://${REGION}.digitaloceanspaces.com`;
const CDN_ENDPOINT = process.env.SPACES_CDN_ENDPOINT || `https://${BUCKET}.${REGION}.cdn.digitaloceanspaces.com`;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const ALLOWED_BUCKETS = ['student-photos', 'report-cards', 'documents'];

const BUCKET_LIMITS = {
  'student-photos': { maxSize: 2 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
  'report-cards': { maxSize: 5 * 1024 * 1024, allowedTypes: ['application/pdf'] },
  'documents': { maxSize: 10 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'] },
};

let client = null;
let _isConfigured = false;

function getClient() {
  if (client) return client;
  const key = process.env.SPACES_KEY;
  const secret = process.env.SPACES_SECRET;
  if (!key || !secret) {
    console.warn('SPACES_KEY or SPACES_SECRET not set. DigitalOcean Spaces is disabled.');
    return null;
  }
  client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: { accessKeyId: key, secretAccessKey: secret },
    forcePathStyle: false,
  });
  _isConfigured = true;
  console.log(`DigitalOcean Spaces initialized: ${BUCKET} @ ${ENDPOINT}`);
  return client;
}

function buildKey(schoolId, bucket, entityId, filename) {
  const ext = filename.split('.').pop() || 'bin';
  const id = require('crypto').randomUUID();
  return `${schoolId}/${bucket}/${entityId || 'general'}/${id}.${ext}`;
}

function validateFile(bucket, contentType, fileSize) {
  const limits = BUCKET_LIMITS[bucket];
  if (!limits) return `Bucket "${bucket}" is not allowed.`;
  if (!limits.allowedTypes.includes(contentType)) {
    return `File type "${contentType}" not allowed for ${bucket}. Allowed: ${limits.allowedTypes.join(', ')}`;
  }
  if (fileSize > limits.maxSize) {
    return `File exceeds ${limits.maxSize / 1024 / 1024} MB limit for ${bucket}.`;
  }
  return null;
}

async function generatePresignedPutUrl(bucket, key, contentType) {
  const s3 = getClient();
  if (!s3) throw new Error('Spaces not configured.');

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: 'private',
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 900 });
  return url;
}

async function generatePresignedGetUrl(key, expiresIn = 3600) {
  const s3 = getClient();
  if (!s3) throw new Error('Spaces not configured.');

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}

async function uploadBuffer(bucket, key, buffer, contentType) {
  const s3 = getClient();
  if (!s3) throw new Error('Spaces not configured.');

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'private',
  });

  await s3.send(command);
  return { key, bucket };
}

async function deleteFile(key) {
  const s3 = getClient();
  if (!s3) throw new Error('Spaces not configured.');

  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3.send(command);
}

async function listFiles(prefix) {
  const s3 = getClient();
  if (!s3) throw new Error('Spaces not configured.');

  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  });

  const response = await s3.send(command);
  return (response.Contents || []).map(obj => ({
    key: obj.Key,
    size: obj.Size,
    lastModified: obj.LastModified,
  }));
}

const isConfigured = () => _isConfigured;

module.exports = {
  getClient,
  buildKey,
  validateFile,
  generatePresignedPutUrl,
  generatePresignedGetUrl,
  uploadBuffer,
  deleteFile,
  listFiles,
  isConfigured,
  ALLOWED_BUCKETS,
  ALLOWED_MIME_TYPES,
  BUCKET_LIMITS,
  BUCKET,
  CDN_ENDPOINT,
};
