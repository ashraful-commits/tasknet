const socketio = require('socket.io');

const initSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`📡 User connected: ${socket.id}`);

        // Join organization or project rooms
        socket.on('join_project', (projectId) => {
            socket.join(`project_${projectId}`);
            console.log(`👤 User ${socket.id} joined project: ${projectId}`);
        });

        socket.on('leave_project', (projectId) => {
            socket.leave(`project_${projectId}`);
            console.log(`👤 User ${socket.id} left project: ${projectId}`);
        });

        socket.on('join_org', (orgId) => {
            socket.join(`org_${orgId}`);
            console.log(`👤 User ${socket.id} joined org: ${orgId}`);
        });

        socket.on('join_user', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`👤 User ${socket.id} joined personal room: ${userId}`);
        });

        // Task activities
        socket.on('task_moved', ({ projectId, taskId, columnId, order }) => {
            socket.to(`project_${projectId}`).emit('task_moved_update', { taskId, columnId, order });
        });

        socket.on('task_updated', ({ projectId, task }) => {
            socket.to(`project_${projectId}`).emit('task_updated_update', { task });
        });

        // Typing activity
        socket.on('typing', ({ projectId, taskId, user }) => {
            socket.to(`project_${projectId}`).emit('user_typing_update', { taskId, user });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`📡 User disconnected: ${socket.id}`);
        });
    });

    return io;
};

// Global helper to emit notifications
const emitNotification = (io, userId, notification) => {
    if (io) {
        io.to(`user_${userId}`).emit('new_notification', notification);
    }
};

module.exports = { initSocket, emitNotification };
