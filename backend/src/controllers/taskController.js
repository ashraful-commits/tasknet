const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAndEmitNotification } = require('../utils/notification');

// Helper: Apply Automation Rules
const applyAutomationRules = async (task, project, trigger, context = {}) => {
    if (!project.automationRules || project.automationRules.length === 0) return task;

    for (const rule of project.automationRules) {
        if (!rule.active) continue;
        if (rule.trigger !== trigger) continue;

        // Custom conditions (contextual)
        if (trigger === 'status_changed' && rule.params.targetStatus && context.newStatus !== rule.params.targetStatus) continue;

        // Apply Actions
        switch (rule.action) {
            case 'assign_to':
                if (rule.params.userId) task.assignees = [...new Set([...task.assignees, rule.params.userId])];
                break;
            case 'set_priority':
                if (rule.params.priority) task.priority = rule.params.priority;
                break;
            case 'set_status':
                if (rule.params.status) task.status = rule.params.status;
                break;
        }
    }
    return task;
};

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private (Project Member)
const createTask = asyncHandler(async (req, res, next) => {
    const { title, description, project, assignee, assignees, priority, dueDate, columnId } = req.body;

    // If organization is missing, get it from the project
    let organizationId = req.body.organization || req.user.organization;
    if (!organizationId) {
        const parentProject = await Project.findById(project).select('organization');
        if (parentProject) organizationId = parentProject.organization;
    }

    if (!organizationId) {
        return next(new AppError('Organization context is required to create a task.', 400));
    }

    const task = await Task.create({
        title,
        description,
        project,
        organization: organizationId,
        assignees: assignees || (assignee ? [assignee] : []),
        priority: priority || 'medium',
        dueDate,
        columnId: columnId || 'todo',
        createdBy: req.user._id,
    });

    // Check Automation Rules
    const projectDoc = await Project.findById(project);
    if (projectDoc) {
        let updatedTask = await applyAutomationRules(task, projectDoc, 'task_created');
        if (updatedTask.isModified()) await updatedTask.save();

        // Increment project stats
        projectDoc.stats.totalTasks += 1;
        if (task.status === 'done') projectDoc.stats.completedTasks += 1;
        await projectDoc.save();
    }

    // Log Activity
    await Activity.create({
        actor: req.user._id,
        organization: organizationId,
        project: project,
        task: task._id,
        type: 'task_created',
        description: `created task: ${task.title}`
    });

    res.status(201).json({
        success: true,
        data: task,
    });

    // Send assignment notification to all new assignees
    const io = req.app.get('socketio');
    const notificationAssignees = assignees || (assignee ? [assignee] : []);

    for (const userId of notificationAssignees) {
        if (userId.toString() !== req.user._id.toString()) {
            await createAndEmitNotification({
                recipient: userId,
                sender: req.user._id,
                type: 'assigned',
                title: 'New Task Assigned',
                message: `You have been assigned: ${title}`,
                referenceId: task._id,
                referenceType: 'Task'
            }, io);
        }
    }
});

// @desc    Get all project tasks
// @route   GET /api/v1/tasks/project/:projectId
// @access  Private (Project Member)
const getTasks = asyncHandler(async (req, res, next) => {
    const tasks = await Task.find({ project: req.params.projectId, isDeleted: false })
        .populate('assignees', 'name email avatar')
        .sort('columnId');

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
    });
});

// @desc    Get all organization tasks (for global view)
// @route   GET /api/v1/tasks/org/:orgId
// @access  Private (Org Member)
const getOrgTasks = asyncHandler(async (req, res, next) => {
    const tasks = await Task.find({ organization: req.params.orgId, isDeleted: false })
        .populate('project', 'name')
        .populate('assignees', 'name email avatar')
        .sort('dueDate');

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
    });
});

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private (Project Member)
const getTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.id)
        .populate('project', 'name')
        .populate('assignees', 'name email avatar')
        .populate('createdBy', 'name email');

    if (!task) return next(new AppError('Task not found', 404));

    res.status(200).json({
        success: true,
        data: task,
    });
});

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private (Project Member)
const updateTask = asyncHandler(async (req, res, next) => {
    let task = await Task.findById(req.params.id);

    if (!task) return next(new AppError('Task not found', 404));

    // Handle single assignee mapping to plural assignees
    if (req.body.assignee && !req.body.assignees) {
        req.body.assignees = [req.body.assignee];
    }

    const oldAssignees = task.assignees.map(a => a.toString());

    const oldStatus = task.status;
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    // Update project stats if status changed
    if (req.body.status && req.body.status !== oldStatus) {
        const inc = { 'stats.completedTasks': 0 };
        if (oldStatus === 'done') inc['stats.completedTasks'] = -1;
        if (task.status === 'done') inc['stats.completedTasks'] = 1;

        if (inc['stats.completedTasks'] !== 0) {
            const p = await Project.findById(task.project);
            if (p) {
                p.stats.completedTasks += inc['stats.completedTasks'];
                await p.save();
            }
        }

        // Log Status Activity
        await Activity.create({
            actor: req.user._id,
            organization: task.organization,
            project: task.project,
            task: task._id,
            type: 'task_status_changed',
            description: `changed status to ${task.status}`,
            metadata: { oldStatus, newStatus: task.status }
        });
    }

    res.status(200).json({
        success: true,
        data: task,
    });

    // Notify newly added assignees
    const newAssignees = task.assignees.map(a => a.toString());
    const added = newAssignees.filter(id => !oldAssignees.includes(id));

    if (added.length > 0) {
        const io = req.app.get('socketio');
        for (const userId of added) {
            if (userId !== req.user._id.toString()) {
                await createAndEmitNotification({
                    recipient: userId,
                    sender: req.user._id,
                    type: 'assigned',
                    title: 'Task Assigned',
                    message: `You are now assigned to: ${task.title}`,
                    referenceId: task._id,
                    referenceType: 'Task'
                }, io);
            }
        }
    }
});

// @desc    Update task status (Kanban movement)
// @route   PUT /api/v1/tasks/:id/status
// @access  Private (Project Member)
const updateTaskStatus = asyncHandler(async (req, res, next) => {
    const { status, columnId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return next(new AppError('Task not found', 404));

    // Update project stats
    if (status !== task.status) {
        const p = await Project.findById(task.project);
        if (p) {
            if (task.status === 'done' && status !== 'done') p.stats.completedTasks -= 1;
            if (task.status !== 'done' && status === 'done') p.stats.completedTasks += 1;
            await p.save();
        }

        // Log Activity
        await Activity.create({
            actor: req.user._id,
            organization: task.organization,
            project: task.project,
            task: task._id,
            type: 'task_status_changed',
            description: `moved task to ${status}`,
            metadata: { oldStatus: task.status, newStatus: status }
        });
    }

    // Check Automation Rules
    const projectDoc = await Project.findById(task.project);
    if (projectDoc) {
        let updatedTask = await applyAutomationRules(task, projectDoc, 'status_changed', { newStatus: status });
        if (updatedTask.isModified()) await updatedTask.save();
    }

    // Final update
    const updated = await Task.findByIdAndUpdate(
        req.params.id,
        { status, columnId },
        { new: true }
    );

    res.status(200).json({
        success: true,
        data: updated,
    });
});

// @desc    Reorder tasks within column or move between columns
// @route   PUT /api/v1/tasks/reorder
// @access  Private
const reorderTasks = asyncHandler(async (req, res, next) => {
    const { taskId, newColumnId, newIndex } = req.body;

    const task = await Task.findByIdAndUpdate(taskId, {
        columnId: newColumnId,
        order: newIndex
    }, { new: true });

    res.status(200).json({
        success: true,
        data: task
    });
});

// @desc    Delete task (soft delete)
// @route   DELETE /api/v1/tasks/:id
// @access  Private (Project Lead/Admin)
const deleteTask = asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    if (!task) return next(new AppError('Task not found', 404));

    task.isDeleted = true;
    await task.save();

    // Update project stats
    const p = await Project.findById(task.project);
    if (p) {
        p.stats.totalTasks -= 1;
        if (task.status === 'done') p.stats.completedTasks -= 1;
        await p.save();
    }

    // Log Activity
    await Activity.create({
        actor: req.user._id,
        organization: task.organization,
        project: task.project,
        task: task._id,
        type: 'task_deleted',
        description: `deleted task`
    });

    res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
    });
});

// @desc    Get dashboard statistics for organization
// @route   GET /api/v1/tasks/dashboard/:orgId
// @access  Private (Org Member)
const getOrgDashboard = asyncHandler(async (req, res, next) => {
    const { orgId } = req.params;

    const [
        totalTasks,
        completedTasks,
        urgentTasks,
        overdueTasks,
        statusStats,
        activities
    ] = await Promise.all([
        Task.countDocuments({ organization: orgId, isDeleted: false }),
        Task.countDocuments({ organization: orgId, status: 'done', isDeleted: false }),
        Task.countDocuments({ organization: orgId, priority: 'urgent', isDeleted: false }),
        Task.countDocuments({ organization: orgId, dueDate: { $lt: new Date() }, status: { $ne: 'done' }, isDeleted: false }),
        Task.aggregate([
            { $match: { organization: new mongoose.Types.ObjectId(orgId), isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Activity.find({ organization: orgId })
            .limit(10)
            .sort({ createdAt: -1 })
            .populate('actor', 'name avatar')
            .populate('project', 'name')
            .populate('task', 'title')
    ]);

    // Format status stats
    const statusMap = { todo: 0, in_progress: 0, done: 0 };
    statusStats.forEach(s => { if (statusMap[s._id] !== undefined) statusMap[s._id] = s.count });

    // 7-Day Activity History (counts by day)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityHistoryAggregate = await Task.aggregate([
        {
            $match: {
                organization: new mongoose.Types.ObjectId(orgId),
                createdAt: { $gte: sevenDaysAgo },
                isDeleted: false
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Map history to simple labels/data
    const dayLabels = [];
    const dayData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        dayLabels.push(label);
        const found = activityHistoryAggregate.find(h => h._id === iso);
        dayData.push(found ? found.count : 0);
    }

    res.status(200).json({
        success: true,
        data: {
            totalTasks,
            completedTasks,
            urgentTasks,
            overdueTasks,
            statusMap,
            activities,
            activityHistory: { labels: dayLabels, data: dayData },
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
    });
});

module.exports = {
    createTask,
    getTasks,
    getOrgTasks,
    getTask,
    updateTask,
    updateTaskStatus,
    reorderTasks,
    deleteTask,
    getOrgDashboard,
};
