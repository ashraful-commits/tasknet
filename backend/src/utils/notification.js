const Notification = require('../models/Notification');
const { emitNotification } = require('../socket/socketHandler');

/**
 * @desc    Create and emit a real-time notification
 * @param   {Object} data - Notification details (recipient, sender, type, title, message, reference)
 * @param   {Object} io - Socket.io instance from req.app.get('socketio')
 */
const createAndEmitNotification = async (data, io) => {
    try {
        const notification = await Notification.create(data);

        // Populate sender for frontend UI
        const populatedNotification = await Notification.findById(notification._id)
            .populate('sender', 'name avatar');

        if (io) {
            emitNotification(io, data.recipient, populatedNotification);
        }

        return populatedNotification;
    } catch (error) {
        console.error('❌ Notification creation failed:', error);
    }
};

module.exports = { createAndEmitNotification };
