const express = require('express');
const router = express.Router();
const { protect, authorizeOrgRole } = require('../middleware/auth');
const { ORGANIZATION_ROLES } = require('../utils/roles');
const { createProject, getProjects, getProject, updateProject, addProjectMember, archiveProject, deleteProject } = require('../controllers/projectController');

const OPS_ROLES = [ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN, ORGANIZATION_ROLES.PROJECT_MANAGER];

router.use(protect);

router.post('/', authorizeOrgRole(...OPS_ROLES), createProject);
router.get('/org/:orgId', getProjects); // List view for everyone in org
router.get('/:id', getProject);

// Management actions
router.put('/:id', authorizeOrgRole(...OPS_ROLES), updateProject);
router.post('/:id/members', authorizeOrgRole(...OPS_ROLES), addProjectMember);
router.put('/:id/archive', authorizeOrgRole(...OPS_ROLES), archiveProject);
router.delete('/:id', authorizeOrgRole(ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN), deleteProject);

module.exports = router;
