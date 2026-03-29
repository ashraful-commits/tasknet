const Notification = require('../models/Notification');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get my notifications
// @route   GET /api/v1/notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(50);

    const unreadCount = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false
    });

    res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications
    });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) return next(new AppError('Notification not found', 404));

    if (notification.recipient.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 401));
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true, readAt: Date.now() }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
