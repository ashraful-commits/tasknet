const mongoose = require('mongoose');
const { ORGANIZATION_ROLES } = require('../utils/roles');

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Organization name is required'], trim: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, maxlength: 500, default: '' },
    logo: { url: String, publicId: String },
    coverImage: { url: String, publicId: String },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'], default: '1-10' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Branding
    branding: {
        primaryColor: { type: String, default: '#6366f1' },
        accentColor: { type: String, default: '#8b5cf6' },
        logoUrl: String,
    },
    // Members with roles
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: {
            type: String,
            enum: Object.values(ORGANIZATION_ROLES),
            default: ORGANIZATION_ROLES.MEMBER
        },
        joinedAt: { type: Date, default: Date.now },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permissions: {
            canCreateProjects: { type: Boolean, default: false },
            canDeleteProjects: { type: Boolean, default: false },
            canManageMembers: { type: Boolean, default: false },
            canManageBilling: { type: Boolean, default: false },
            canViewAnalytics: { type: Boolean, default: true },
        },
        isActive: { type: Boolean, default: true },
    }],
    // Pending Invitations
    pendingInvitations: [{
        email: { type: String, required: true },
        role: { type: String, enum: ['admin', 'project_manager', 'member', 'guest'], default: 'member' },
        token: String,
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        invitedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 },
    }],
    // Settings
    settings: {
        defaultProjectVisibility: { type: String, enum: ['public', 'private'], default: 'private' },
        allowMemberInvites: { type: Boolean, default: false },
        requireEmailVerification: { type: Boolean, default: true },
        taskApprovalRequired: { type: Boolean, default: false },
        dataRetentionDays: { type: Number, default: 365 },
        emailDomain: String,
        sso: {
            enabled: { type: Boolean, default: false },
            provider: String,
            entryPoint: String,
            certificate: String,
        },
    },
    // Subscription
    subscription: {
        plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        stripePriceId: { type: String },
        subscriptionStatus: { type: String, enum: ['active', 'past_due', 'canceled', 'incomplete'], default: 'active' },
        maxMembers: { type: Number, default: 5 },
        maxProjects: { type: Number, default: 10 },
        storage: { used: { type: Number, default: 0 }, limit: { type: Number, default: 1073741824 } }, // 1GB default
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate slug
organizationSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).substring(7);
    }
    next();
});

organizationSchema.index({ owner: 1 });
organizationSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Organization', organizationSchema);
