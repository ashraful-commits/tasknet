const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true, maxlength: 5000 },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
    // Thread
    parentMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    threadCount: { type: Number, default: 0 },
    // Attachments
    attachments: [{ name: String, url: String, type: String, size: Number }],
    // Reactions
    reactions: [{ emoji: String, users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }],
    // Mentions
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Status
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
    isDeleted: { type: Boolean, default: false },
    // Read receipts
    readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: Date }],
    // GIF/Emoji only
    isGif: { type: Boolean, default: false },
    gifUrl: String,
}, { timestamps: true });

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['public', 'private', 'direct', 'group', 'project'], default: 'public' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
        lastSeen: Date,
        isMuted: { type: Boolean, default: false },
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    avatar: String,
    isArchived: { type: Boolean, default: false },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: Date,
    messageCount: { type: Number, default: 0 },
}, { timestamps: true });

channelSchema.index({ organization: 1, type: 1 });
channelSchema.index({ 'members.user': 1 });

const Message = mongoose.model('Message', messageSchema);
const Channel = mongoose.model('Channel', channelSchema);

module.exports = { Message, Channel };
