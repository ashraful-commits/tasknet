const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { SYSTEM_ROLES } = require('../utils/roles');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Please provide a name'], trim: true, maxlength: [50, 'Name cannot exceed 50 characters'] },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'] },
    password: { type: String, minlength: [8, 'Password must be at least 8 characters'], select: false },
    avatar: {
        url: { type: String, default: '' },
        publicId: { type: String, default: '' },
    },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'], default: '' },
    phone: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    department: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    timeFormat: { type: String, enum: ['12h', '24h'], default: '12h' },
    systemRole: {
        type: String,
        enum: Object.values(SYSTEM_ROLES),
        default: SYSTEM_ROLES.USER
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    // Two-Factor Authentication
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorBackupCodes: { type: [String], select: false },
    // OAuth
    googleId: { type: String },
    githubId: { type: String },
    oauthProvider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    // Notification Preferences
    notificationPreferences: {
        email: {
            taskAssigned: { type: Boolean, default: true },
            taskUpdated: { type: Boolean, default: true },
            taskComment: { type: Boolean, default: true },
            dueDateReminder: { type: Boolean, default: true },
            projectUpdate: { type: Boolean, default: true },
            teamInvitation: { type: Boolean, default: true },
            digestEmail: { type: String, enum: ['none', 'daily', 'weekly'], default: 'daily' },
        },
        inApp: {
            taskAssigned: { type: Boolean, default: true },
            taskUpdated: { type: Boolean, default: true },
            taskComment: { type: Boolean, default: true },
            dueDateReminder: { type: Boolean, default: true },
            projectUpdate: { type: Boolean, default: true },
            teamInvitation: { type: Boolean, default: true },
        },
        quietHours: {
            enabled: { type: Boolean, default: false },
            start: { type: String, default: '22:00' },
            end: { type: String, default: '08:00' },
        },
    },
    // Subscription
    subscription: {
        plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        status: { type: String, enum: ['active', 'inactive', 'cancelled', 'past_due'], default: 'inactive' },
        currentPeriodStart: Date,
        currentPeriodEnd: Date,
        cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    // Activity
    lastActive: { type: Date, default: Date.now },
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    // Onboarding
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
    // Keyboard shortcuts
    keyboardShortcutsEnabled: { type: Boolean, default: true },
    // Default project view
    defaultProjectView: { type: String, enum: ['kanban', 'list', 'calendar', 'timeline', 'dashboard'], default: 'kanban' },
}, { timestamps: true });

// --- Indexes ---
userSchema.index({ googleId: 1 });
userSchema.index({ githubId: 1 });

// --- Virtuals ---
userSchema.virtual('initials').get(function () {
    return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
});

// --- Hooks ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Methods ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getEmailVerificationToken = function () {
    const token = crypto.randomBytes(20).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;
};

userSchema.methods.getPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
};

userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailVerificationToken = crypto.createHash('sha256').update(otp).digest('hex');
    this.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
};

module.exports = mongoose.model('User', userSchema);
