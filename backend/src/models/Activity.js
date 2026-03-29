const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    type: {
        type: String,
        enum: [
            // Task activities
            'task_created', 'task_updated', 'task_deleted', 'task_status_changed',
            'task_priority_changed', 'task_assigned', 'task_unassigned',
            'task_due_date_changed', 'task_completed', 'task_reopened',
            'task_moved', 'task_archived', 'task_duplicated',
            'subtask_added', 'subtask_completed', 'subtask_deleted',
            'attachment_added', 'attachment_deleted',
            'label_added', 'label_removed',
            'time_logged',
            // Comment activities
            'comment_added', 'comment_edited', 'comment_deleted', 'comment_resolved',
            // Project activities
            'project_created', 'project_updated', 'project_archived', 'project_deleted',
            'member_added', 'member_removed', 'member_role_changed',
            'milestone_created', 'milestone_completed',
            // Org activities
            'org_created', 'org_updated', 'org_member_invited', 'org_member_removed',
        ],
        required: true,
    },
    description: { type: String, required: true },
    changes: [{
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
    }],
    metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

activitySchema.index({ task: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ organization: 1, createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
