const crypto = require('crypto');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError('User already exists with this email', 400));
    }

    // Check if it's the first user
    const userCount = await User.countDocuments();
    const systemRole = userCount === 0 ? 'superadmin' : 'user';

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        systemRole
    });

    // Generate verification OTP
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
        await sendVerificationEmail(user.email, otp);
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email with the OTP sent.',
            email: user.email,
        });
    } catch (err) {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Email could not be sent', 500));
    }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');

    if (!user || !(await user.matchPassword(password))) {
        return next(new AppError('Invalid credentials', 401));
    }

    if (!user.isActive) {
        return next(new AppError('Account is deactivated', 401));
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
        return res.status(200).json({
            success: true,
            require2FA: true,
            userId: user._id,
        });
    }

    // Update login stats
    user.lastLogin = Date.now();
    user.loginCount += 1;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res, 'Logged in successfully');
});

// @desc    Verify Email
// @route   POST /api/v1/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
        email,
        emailVerificationToken: hashedOTP,
        emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Invalid or expired OTP', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res, 'Email verified successfully');
});

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('There is no user with that email', 404));
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
        await sendResetEmail(user.email, resetUrl);
        res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Email could not be sent', 500));
    }
});

// @desc    Reset Password
// @route   PUT /api/v1/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new AppError('Invalid or expired token', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendToken(user, 200, res, 'Password reset successful');
});

// Helper: Send Verification Email
const sendVerificationEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'TaskNest - Email Verification',
        html: `<h1>Welcome to TaskNest!</h1><p>Your verification OTP is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);
};

// Helper: Send Reset Email
const sendResetEmail = async (email, url) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'TaskNest - Password Reset',
        html: `<p>You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link: <a href="${url}">${url}</a></p>`,
    };

    await transporter.sendMail(mailOptions);
};

// @desc    Change Password (authenticated)
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Please provide current and new password', 400));
    }

    if (newPassword.length < 8) {
        return next(new AppError('New password must be at least 8 characters', 400));
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
        return next(new AppError('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
});

module.exports = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
};
