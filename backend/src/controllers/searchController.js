const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Universal search across tasks and projects
// @route   GET /api/v1/search
// @access  Private
const universalSearch = asyncHandler(async (req, res, next) => {
    const { query, orgId } = req.query;

    if (!query) {
        return res.status(200).json({ success: true, data: { tasks: [], projects: [] } });
    }

    const regex = new RegExp(query, 'i');

    const [tasks, projects] = await Promise.all([
        Task.find({
            organization: orgId,
            $or: [{ title: regex }, { description: regex }],
            isDeleted: false
        }).limit(5).populate('project', 'name'),
        Project.find({
            organization: orgId,
            $or: [{ name: regex }, { description: regex }],
            isDeleted: false
        }).limit(5)
    ]);

    res.status(200).json({
        success: true,
        data: { tasks, projects }
    });
});

module.exports = { universalSearch };
