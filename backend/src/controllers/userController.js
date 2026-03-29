const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const cloudinary = require('../config/cloudinary');

// @desc    Get current user profile
// @route   GET /api/v1/users/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        bio: req.body.bio,
        phone: req.body.phone,
        jobTitle: req.body.jobTitle,
        department: req.body.department,
        location: req.body.location,
        website: req.body.website,
        language: req.body.language,
        timezone: req.body.timezone,
        theme: req.body.theme,
        dateFormat: req.body.dateFormat,
        timeFormat: req.body.timeFormat,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Update notification preferences
// @route   PUT /api/v1/users/notifications
// @access  Private
const updateNotificationPreferences = asyncHandler(async (req, res, next) => {
    const { email, inApp, quietHours } = req.body;

    const user = await User.findById(req.user._id);

    if (email) user.notificationPreferences.email = { ...user.notificationPreferences.email, ...email };
    if (inApp) user.notificationPreferences.inApp = { ...user.notificationPreferences.inApp, ...inApp };
    if (quietHours) user.notificationPreferences.quietHours = { ...user.notificationPreferences.quietHours, ...quietHours };

    await user.save();

    res.status(200).json({
        success: true,
        data: user.notificationPreferences,
    });
});

// @desc    Upload avatar
// @route   POST /api/v1/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload a file', 400));
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
        folder: 'tasknet/avatars',
        transformation: [{ width: 250, height: 250, crop: 'limit' }],
    });

    const user = await User.findById(req.user._id);

    // Delete old avatar if exists
    if (user.avatar?.publicId) {
        await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    user.avatar = {
        url: result.secure_url,
        publicId: result.public_id,
    };

    await user.save();

    res.status(200).json({
        success: true,
        data: user.avatar,
    });
});

// @desc    Delete account
// @route   DELETE /api/v1/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    user.isActive = false;
    user.isDeleted = true;
    user.deletedAt = Date.now();
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Account deactivated successfully',
    });
});

module.exports = {
    getMe,
    updateProfile,
    updateNotificationPreferences,
    uploadAvatar,
    deleteAccount,
};
