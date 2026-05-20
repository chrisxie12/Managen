const spaces = require('./spaces');

async function uploadFile(bucket, file, schoolId) {
  const validationError = spaces.validateFile(bucket, file.mimetype, file.size);
  if (validationError) throw new Error(validationError);

  const key = spaces.buildKey(schoolId, bucket, null, file.originalname);
  await spaces.uploadBuffer(bucket, key, file.buffer, file.mimetype);
  const url = await spaces.generatePresignedGetUrl(key, 3600);

  return { path: key, url };
}

async function deleteFile(bucket, key) {
  await spaces.deleteFile(key);
}

async function generateSignedUrl(key, bucket, expiresIn = 3600) {
  return spaces.generatePresignedGetUrl(key, expiresIn);
}

async function listFiles(bucket, folder) {
  return spaces.listFiles(folder || '');
}

module.exports = { uploadFile, deleteFile, generateSignedUrl, listFiles };
