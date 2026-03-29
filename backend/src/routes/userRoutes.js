const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMe, updateProfile, updateNotificationPreferences, uploadAvatar, deleteAccount } = require('../controllers/userController');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');

router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/notifications', updateNotificationPreferences);
router.post('/avatar', uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.delete('/account', deleteAccount);

module.exports = router;
