const Project = require('../models/Project');
const Organization = require('../models/Organization');
const Team = require('../models/Team');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { createAndEmitNotification } = require('../utils/notification');

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private (Org Member)
const createProject = asyncHandler(async (req, res, next) => {
    const { name, organization, description, template, visibility } = req.body;

    const org = await Organization.findById(organization);
    if (!org) return next(new AppError('Organization not found', 404));

    let columns = [];
    if (template === 'agile' || template === 'software') {
        columns = [
            { id: 'todo', name: 'To Do', order: 0, isDefault: true, color: '#e5e7eb' },
            { id: 'in_progress', name: 'In Progress', order: 1, color: '#3b82f6' },
            { id: 'review', name: 'Review', order: 2, color: '#8b5cf6' },
            { id: 'done', name: 'Done', order: 3, isDone: true, color: '#10b981' },
        ];
    } else {
        columns = [
            { id: 'todo', name: 'To Do', order: 0, isDefault: true },
            { id: 'in_progress', name: 'In Progress', order: 1 },
            { id: 'done', name: 'Done', order: 2, isDone: true },
        ];
    }

    const project = await Project.create({
        name,
        description,
        organization,
        owner: req.user._id,
        template: template || 'blank',
        visibility: visibility || 'private',
        columns,
        members: [{ user: req.user._id, role: 'owner' }],
    });

    res.status(201).json({
        success: true,
        data: project,
    });
});

// @desc    Get organization projects
// @route   GET /api/v1/projects/org/:orgId
// @access  Private (Org Member)
const getProjects = asyncHandler(async (req, res, next) => {
    const projects = await Project.find({
        organization: req.params.orgId,
        'members.user': req.user._id,
        isDeleted: false,
    });

    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
    });
});

// @desc    Get project by ID
// @route   GET /api/v1/projects/:id
// @access  Private (Project Member)
const getProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
        .populate('members.user', 'name email avatar')
        .populate('owner', 'name email avatar')
        .populate('teams');

    if (!project || project.isDeleted) {
        return next(new AppError('Project not found', 404));
    }

    res.status(200).json({
        success: true,
        data: project,
    });
});

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private (Project Manager/Admin)
const updateProject = asyncHandler(async (req, res, next) => {
    let project = await Project.findById(req.params.id);

    if (!project || project.isDeleted) {
        return next(new AppError('Project not found', 404));
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: project,
    });
});

// @desc    Add member to project
// @route   POST /api/v1/projects/:id/members
// @access  Private (Project Manager/Admin)
const addProjectMember = asyncHandler(async (req, res, next) => {
    const { user, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return next(new AppError('Project not found', 404));

    if (project.members.some(m => m.user.toString() === user)) {
        return next(new AppError('User is already a member of this project', 400));
    }

    project.members.push({ user, role: role || 'member' });
    await project.save();

    res.status(200).json({
        success: true,
        data: project,
    });

    // Send notification
    const io = req.app.get('socketio');
    if (user.toString() !== req.user._id.toString()) {
        await createAndEmitNotification({
            recipient: user,
            sender: req.user._id,
            type: 'assigned',
            title: 'Added to Project',
            message: `You have been added to: ${project.name}`,
            referenceId: project._id,
            referenceType: 'Project'
        }, io);
    }
});

// @desc    Archive project
// @route   PUT /api/v1/projects/:id/archive
// @access  Private (Project Manager/Admin)
const archiveProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) return next(new AppError('Project not found', 404));

    project.isArchived = !project.isArchived;
    project.archivedAt = project.isArchived ? Date.now() : null;
    project.status = project.isArchived ? 'archived' : 'active';
    await project.save();

    res.status(200).json({
        success: true,
        data: project,
    });

    // Notify members
    const io = req.app.get('socketio');
    project.members.forEach(member => {
        if (member.user.toString() !== req.user._id.toString()) {
            createAndEmitNotification({
                recipient: member.user,
                sender: req.user._id,
                type: 'project_update',
                title: project.isArchived ? 'Project Archived' : 'Project Restored',
                message: `Project ${project.name} has been ${project.isArchived ? 'archived' : 'restored'}.`,
                referenceId: project._id,
                referenceType: 'Project'
            }, io);
        }
    });
});

// @desc    Delete project (soft delete)
// @route   DELETE /api/v1/projects/:id
// @access  Private (Project Owner/Admin)
const deleteProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) return next(new AppError('Project not found', 404));

    project.isDeleted = true;
    await project.save();

    res.status(200).json({
        success: true,
        message: 'Project moved to trash',
    });
});

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    addProjectMember,
    archiveProject,
    deleteProject,
};
