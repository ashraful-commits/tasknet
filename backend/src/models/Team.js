const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '👥' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['lead', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
    }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

teamSchema.index({ organization: 1 });

module.exports = mongoose.model('Team', teamSchema);
