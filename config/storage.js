const crypto = require('crypto');
const supabase = require('./db');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_BUCKETS = ['student-photos', 'report-cards', 'documents'];

const validateFile = (file) => {
  if (!file) return 'No file provided.';
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) return `File type "${file.mimetype}" is not allowed. Only images and PDFs are accepted.`;
  if (file.size > MAX_FILE_SIZE) return `File exceeds the 5 MB limit.`;
  return null;
};

const buildPath = (bucket, schoolId, fileName) => {
  const ext = fileName.split('.').pop() || 'bin';
  const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${schoolId}/${id}.${ext}`;
};

async function uploadFile(bucket, file, schoolId) {
  const validationError = validateFile(file);
  if (validationError) throw new Error(validationError);
  if (!ALLOWED_BUCKETS.includes(bucket)) throw new Error(`Bucket "${bucket}" is not allowed.`);

  const filePath = buildPath(bucket, schoolId, file.originalname);

  const { error } = await supabase.storage.from(bucket).upload(filePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { path: filePath, url: publicUrl };
}

async function deleteFile(bucket, filePath) {
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

async function generateSignedUrl(bucket, filePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresIn);
  if (error) throw new Error(`Signed URL generation failed: ${error.message}`);
  return data.signedUrl;
}

async function listFiles(bucket, folder) {
  const { data, error } = await supabase.storage.from(bucket).list(folder, { sortBy: { column: 'created_at', order: 'desc' } });
  if (error) throw new Error(`Storage list failed: ${error.message}`);
  return data || [];
}

module.exports = { uploadFile, deleteFile, generateSignedUrl, listFiles, ALLOWED_BUCKETS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
