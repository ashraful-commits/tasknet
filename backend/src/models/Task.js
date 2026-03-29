const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: 500 },
    description: { type: String, default: '', maxlength: 10000 }, // Rich text HTML
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Assignment
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Workflow
    status: { type: String, required: true, default: 'todo' },
    columnId: { type: String, default: 'todo' },
    order: { type: Number, default: 0 },
    // Priority
    priority: { type: String, enum: ['none', 'low', 'medium', 'high', 'urgent'], default: 'none' },
    // Dates
    startDate: Date,
    dueDate: Date,
    completedAt: Date,
    // Time Estimation
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    // Labels / Tags
    labels: [String],
    tags: [String],
    // Attachments
    attachments: [{
        name: String,
        url: String,
        publicId: String,
        type: String,
        size: Number,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
    }],
    // Sub-tasks
    subtasks: [{
        id: String,
        title: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
        assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
    }],
    // Dependencies
    dependencies: {
        blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    },
    // Parent Task (for sub-tasks)
    parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    // Watchers
    watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Custom Fields Values
    customFields: mongoose.Schema.Types.Mixed,
    // Milestone
    milestone: String,
    // Recurring
    recurring: {
        enabled: { type: Boolean, default: false },
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
        interval: { type: Number, default: 1 },
        endDate: Date,
        nextDue: Date,
    },
    // Links
    links: [{
        url: String,
        title: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
    }],
    // AI Fields
    aiDescription: { type: Boolean, default: false },
    aiPriority: String,
    aiEstimate: Number,
    aiTags: [String],
    isBillable: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    // Activity Log (lightweight)
    activityCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
}, { timestamps: true });

// Computed field: completion
taskSchema.virtual('isCompleted').get(function () {
    return this.completedAt != null;
});

taskSchema.virtual('subtaskProgress').get(function () {
    if (!this.subtasks || this.subtasks.length === 0) return 0;
    const done = this.subtasks.filter(s => s.completed).length;
    return Math.round((done / this.subtasks.length) * 100);
});

taskSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'done') {
        this.completedAt = this.completedAt || new Date();
    } else if (this.isModified('status') && this.status !== 'done') {
        this.completedAt = null;
    }
    next();
});

taskSchema.index({ project: 1, order: 1 });
taskSchema.index({ organization: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ parentTask: 1 });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);
