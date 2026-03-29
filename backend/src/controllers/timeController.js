const TimeEntry = require('../models/TimeEntry');
const Task = require('../models/Task');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Start timer
// @route   POST /api/v1/time/start
// @access  Private
const startTimer = asyncHandler(async (req, res, next) => {
    const { taskId, projectId, organizationId, description, taskName, isBillable } = req.body;

    // Stop any existing timer for this user
    await TimeEntry.updateMany({ user: req.user._id, isRunning: true }, {
        endTime: new Date(),
        isRunning: false
    });

    const timeEntry = await TimeEntry.create({
        task: taskId || null,
        project: projectId || null,
        organization: organizationId,
        user: req.user._id,
        startTime: new Date(),
        isRunning: true,
        date: new Date(),
        description: description || taskName || '',
        isBillable: isBillable || false
    });

    res.status(201).json({
        success: true,
        data: timeEntry
    });
});

// @desc    Stop timer
// @route   PUT /api/v1/time/stop/:id
// @access  Private
const stopTimer = asyncHandler(async (req, res, next) => {
    const timeEntry = await TimeEntry.findById(req.params.id);

    if (!timeEntry) return next(new AppError('No active timer found', 404));

    timeEntry.endTime = new Date();
    timeEntry.isRunning = false;
    await timeEntry.save();

    res.status(200).json({
        success: true,
        data: timeEntry
    });
});

// @desc    Get my time entries
// @route   GET /api/v1/time/me
// @access  Private
const getMyTimeEntries = asyncHandler(async (req, res, next) => {
    const entries = await TimeEntry.find({ user: req.user._id })
        .populate('task', 'title')
        .populate('project', 'name')
        .sort({ date: -1 });

    res.status(200).json({
        success: true,
        count: entries.length,
        data: entries
    });
});

module.exports = {
    startTimer,
    stopTimer,
    getMyTimeEntries
};
