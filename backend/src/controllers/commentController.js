const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAndEmitNotification } = require('../utils/notification');

// @desc    Add comment to task
// @route   POST /api/v1/comments
// @access  Private (Project Member)
const addComment = asyncHandler(async (req, res, next) => {
    const { content, task, project, parentComment, mentions } = req.body;

    // Check if task exists
    const taskObj = await Task.findById(task);
    if (!taskObj) return next(new AppError('Task not found', 404));

    const comment = await Comment.create({
        content,
        task,
        project,
        author: req.user._id,
        parentComment: parentComment || null,
        mentions: mentions || [],
    });

    // If it's a subcomment, add to parent
    if (parentComment) {
        const parent = await Comment.findById(parentComment);
        if (parent) {
            parent.replies.push(comment._id);
            await parent.save();
        }
    }

    // Update task stats
    taskObj.commentCount += 1;
    await taskObj.save();

    // Send real-time notification
    const io = req.app.get('socketio');
    if (taskObj.assignee && taskObj.assignee.toString() !== req.user._id.toString()) {
        await createAndEmitNotification({
            recipient: taskObj.assignee,
            sender: req.user._id,
            type: 'comment',
            title: 'New Comment',
            message: `${req.user.name} commented on: ${taskObj.title}`,
            referenceId: task,
            referenceType: 'Task'
        }, io);
    }

    res.status(201).json({
        success: true,
        data: comment,
    });
});

// @desc    Get task comments
// @route   GET /api/v1/comments/task/:taskId
// @access  Private (Project Member)
const getTaskComments = asyncHandler(async (req, res, next) => {
    const comments = await Comment.find({
        task: req.params.taskId,
        parentComment: null, // Only fetch top-level comments
        isDeleted: false,
    })
        .populate('author', 'name email avatar')
        .populate({
            path: 'replies',
            populate: { path: 'author', select: 'name email avatar' },
        })
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: comments.length,
        data: comments,
    });
});

// @desc    Update comment
// @route   PUT /api/v1/comments/:id
// @access  Private (Comment Author)
const updateComment = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    let comment = await Comment.findById(req.params.id);

    if (!comment) return next(new AppError('Comment not found', 404));
    if (comment.author.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to edit this comment', 403));
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = Date.now();
    await comment.save();

    res.status(200).json({
        success: true,
        data: comment,
    });
});

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private (Comment Author)
const deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(new AppError('Comment not found', 404));

    if (comment.author.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized to delete this comment', 403));
    }

    comment.isDeleted = true;
    await comment.save();

    // Update task stats
    const task = await Task.findById(comment.task);
    if (task) {
        task.commentCount -= 1;
        await task.save();
    }

    res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
    });
});

module.exports = {
    addComment,
    getTaskComments,
    updateComment,
    deleteComment,
};
