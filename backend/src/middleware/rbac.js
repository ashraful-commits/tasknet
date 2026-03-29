const Organization = require('../models/Organization');
const Project = require('../models/Project');

// Check if user is a member of the organization with certain role
const checkOrgAccess = (minRole = 'guest') => {
    const roleHierarchy = { guest: 0, member: 1, project_manager: 2, admin: 3, owner: 4 };
    return async (req, res, next) => {
        try {
            const orgId = req.params.orgId || req.body.organization || req.query.organization;
            if (!orgId) return res.status(400).json({ success: false, message: 'Organization ID is required' });
            const org = await Organization.findById(orgId);
            if (!org || org.isDeleted) return res.status(404).json({ success: false, message: 'Organization not found' });
            const member = org.members.find(m => m.user.toString() === req.user._id.toString() && m.isActive);
            if (!member && org.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not a member of this organization' });
            }
            const memberRole = org.owner.toString() === req.user._id.toString() ? 'owner' : member?.role || 'guest';
            if (roleHierarchy[memberRole] < roleHierarchy[minRole]) {
                return res.status(403).json({ success: false, message: `Requires ${minRole} role or above` });
            }
            req.organization = org;
            req.orgRole = memberRole;
            next();
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    };
};

// Check if user has access to a project
const checkProjectAccess = (minRole = 'viewer') => {
    const roleHierarchy = { viewer: 0, member: 1, manager: 2, admin: 3, owner: 4 };
    return async (req, res, next) => {
        try {
            const projectId = req.params.projectId || req.params.id || req.body.project;
            if (!projectId) return res.status(400).json({ success: false, message: 'Project ID is required' });
            const project = await Project.findById(projectId);
            if (!project || project.isDeleted) return res.status(404).json({ success: false, message: 'Project not found' });
            const member = project.members.find(m => m.user.toString() === req.user._id.toString());
            if (!member && project.owner.toString() !== req.user._id.toString()) {
                // Check if user is org admin
                const org = await Organization.findById(project.organization);
                const orgMember = org?.members.find(m => m.user.toString() === req.user._id.toString());
                if (!orgMember || !['admin', 'owner'].includes(orgMember.role)) {
                    return res.status(403).json({ success: false, message: 'Not a member of this project' });
                }
            }
            const projectRole = project.owner.toString() === req.user._id.toString() ? 'owner' : member?.role || 'viewer';
            if (roleHierarchy[projectRole] < roleHierarchy[minRole]) {
                return res.status(403).json({ success: false, message: `Requires ${minRole} role or above in the project` });
            }
            req.project = project;
            req.projectRole = projectRole;
            next();
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    };
};

module.exports = { checkOrgAccess, checkProjectAccess };
