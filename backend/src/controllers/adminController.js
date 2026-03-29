const User = require('../models/User');
const Organization = require('../models/Organization');
const Task = require('../models/Task');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Get system-wide statistics
// @route   GET /api/v1/admin/stats
// @access  Private (System Admin)
const getSystemStats = asyncHandler(async (req, res, next) => {
    if (req.user.systemRole !== 'admin' && req.user.systemRole !== 'superadmin') {
        return next(new AppError('Unauthorized access to administrative metrics', 403));
    }

    const [userCount, orgCount, taskCount] = await Promise.all([
        User.countDocuments(),
        Organization.countDocuments(),
        Task.countDocuments()
    ]);

    res.status(200).json({
        success: true,
        data: {
            users: userCount,
            organizations: orgCount,
            tasks: taskCount,
            uptime: process.uptime()
        }
    });
});

// @desc    Get all users (paginated)
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res, next) => {
    if (req.user.systemRole !== 'admin' && req.user.systemRole !== 'superadmin') {
        return next(new AppError('Forbidden', 403));
    }

    const users = await User.find().select('-password').sort('-createdAt');

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc    Update user system role or status
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Superadmin)
const updateUserStatus = asyncHandler(async (req, res, next) => {
    if (req.user.systemRole !== 'superadmin') {
        return next(new AppError('Only superadmins can modify system-wide roles', 403));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    const { systemRole, isActive } = req.body;
    if (systemRole) user.systemRole = systemRole;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});

module.exports = {
    getSystemStats,
    getAllUsers,
    updateUserStatus
};
