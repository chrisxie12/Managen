const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const spaces = require('../config/spaces');
const { protect } = require('./school');

// POST /api/user/upload-avatar
router.post('/upload-avatar', protect, async (req, res) => {
  try {
    const { userId, imageDataUri } = req.body;
    if (!userId || !imageDataUri) {
      return res.status(400).json({ error: 'Missing required parameters: userId, imageDataUri' });
    }

    // Parse data URI: "data:image/png;base64,iVBOR..."
    const matches = imageDataUri.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image data URI format. Expected data:image/{ext};base64,...' });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Verify the requesting user matches the target userId
    if (req.user.userId !== userId && req.user.role !== 'school_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only upload your own avatar.' });
    }

    // Use tenant context if available, otherwise use user's school
    const tenantId = req.tenant?.id || req.user.schoolId || req.user.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Could not resolve school context.' });
    }

    const key = spaces.buildKey(tenantId, 'documents', userId, `avatar.${ext}`);
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    await spaces.uploadBuffer('documents', key, buffer, contentType);

    const { error: dbError } = await supabase
      .from('users')
      .update({ avatar_url: key })
      .eq('id', userId);

    if (dbError) throw dbError;

    return res.json({ success: true, avatar_url: key });
  } catch (error) {
    console.error('Avatar upload failure:', error);
    return res.status(500).json({ error: 'Failed to upload avatar.' });
  }
});

module.exports = router;
