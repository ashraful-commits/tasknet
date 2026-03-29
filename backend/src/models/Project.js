const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Project name is required'], trim: true, maxlength: 200 },
    slug: { type: String, lowercase: true },
    description: { type: String, default: '', maxlength: 2000 },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: { url: String, publicId: String },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '📋' },
    // Dates
    startDate: Date,
    endDate: Date,
    // Status
    status: { type: String, enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'], default: 'planning' },
    // Privacy
    visibility: { type: String, enum: ['public', 'private', 'team'], default: 'private' },
    // Template type
    template: { type: String, enum: ['blank', 'agile', 'waterfall', 'marketing', 'software', 'design', 'research', 'custom'], default: 'blank' },
    // Members with roles
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['owner', 'admin', 'manager', 'member', 'viewer'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
    }],
    // Teams assigned to project
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    // Columns / Workflow status
    columns: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        color: { type: String, default: '#6366f1' },
        order: { type: Number, default: 0 },
        wipLimit: { type: Number, default: 0 }, // 0 = unlimited
        isDefault: { type: Boolean, default: false },
        isDone: { type: Boolean, default: false },
    }],
    // Labels
    labels: [{
        id: String,
        name: String,
        color: String,
    }],
    // Custom Fields
    customFields: [{
        id: String,
        name: String,
        type: { type: String, enum: ['text', 'number', 'date', 'dropdown', 'checkbox', 'url', 'email', 'phone', 'user'] },
        options: [String],
        required: { type: Boolean, default: false },
    }],
    // Milestones
    milestones: [{
        id: String,
        name: String,
        description: String,
        dueDate: Date,
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        completedAt: Date,
    }],
    // Settings
    settings: {
        defaultView: { type: String, enum: ['kanban', 'list', 'calendar', 'timeline', 'dashboard'], default: 'kanban' },
        allowGuestComments: { type: Boolean, default: false },
        taskEstimationEnabled: { type: Boolean, default: true },
        timeTrackingEnabled: { type: Boolean, default: true },
        priorityEnabled: { type: Boolean, default: true },
        subtasksEnabled: { type: Boolean, default: true },
        dependenciesEnabled: { type: Boolean, default: true },
    },
    // Tags
    tags: [String],
    // Analytics
    stats: {
        totalTasks: { type: Number, default: 0 },
        completedTasks: { type: Number, default: 0 },
        overdueTasks: { type: Number, default: 0 },
        totalTimeLogged: { type: Number, default: 0 },
    },
    // Progress percentage
    progress: { type: Number, default: 0, min: 0, max: 100 },
    // Automation Rules
    automationRules: [{
        trigger: { type: String, enum: ['task_created', 'status_changed', 'priority_changed', 'due_date_approaching', 'member_added'], required: true },
        action: { type: String, enum: ['assign_to', 'set_status', 'set_priority', 'send_notification', 'create_subtask'], required: true },
        params: mongoose.Schema.Types.Mixed,
        active: { type: Boolean, default: true },
    }],
    isArchived: { type: Boolean, default: false },
    archivedAt: Date,
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate slug
projectSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    }
    // Update progress
    if (this.stats.totalTasks > 0) {
        this.progress = Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
    }
    next();
});

projectSchema.index({ organization: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ slug: 1 });

module.exports = mongoose.model('Project', projectSchema);
