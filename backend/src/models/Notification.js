const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: [
            'task_assigned', 'task_updated', 'task_completed', 'task_comment',
            'task_mention', 'task_due_soon', 'task_overdue',
            'project_update', 'project_invitation',
            'org_invitation', 'org_role_changed',
            'comment_reply', 'comment_reaction',
            'team_added', 'team_removed',
            'subscription_update', 'payment_success', 'payment_failed',
            'system_announcement', 'generic',
        ],
        required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Links
    link: String,
    // Reference
    reference: {
        type: { type: String, enum: ['task', 'project', 'organization', 'comment', 'team'] },
        id: { type: mongoose.Schema.Types.ObjectId },
    },
    // Status
    isRead: { type: Boolean, default: false },
    readAt: Date,
    // Priority
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    // Email sent
    emailSent: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
