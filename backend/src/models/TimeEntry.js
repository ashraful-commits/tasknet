const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
    // Time
    startTime: { type: Date, required: true },
    endTime: Date,
    duration: { type: Number, default: 0 }, // in seconds
    isRunning: { type: Boolean, default: false },
    // Billing
    isBillable: { type: Boolean, default: false },
    hourlyRate: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    // Date of work
    date: { type: Date, required: true },
}, { timestamps: true });

timeEntrySchema.pre('save', function (next) {
    if (this.startTime && this.endTime) {
        this.duration = Math.floor((this.endTime - this.startTime) / 1000);
        this.isRunning = false;
        if (this.isBillable && this.hourlyRate > 0) {
            this.totalAmount = (this.duration / 3600) * this.hourlyRate;
        }
    }
    next();
});

timeEntrySchema.index({ task: 1 });
timeEntrySchema.index({ user: 1, date: -1 });
timeEntrySchema.index({ project: 1 });
timeEntrySchema.index({ organization: 1 });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
