const express = require('express');
const router = express.Router();
const { protect, authorizeOrgRole } = require('../middleware/auth');
const { ORGANIZATION_ROLES } = require('../utils/roles');
const {
    createOrganization,
    getMyOrganizations,
    getOrganization,
    updateOrganization,
    inviteMember,
    updateMemberRole,
    removeMember,
    updateSubscription,
    createCheckoutSession,
    stripeWebhook,
} = require('../controllers/organizationController');

router.use(protect);

router.post('/', createOrganization);
router.get('/', getMyOrganizations);

// Resource-specific routes with deep Role Validation
router.get('/:id', authorizeOrgRole(ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN, ORGANIZATION_ROLES.PROJECT_MANAGER, ORGANIZATION_ROLES.MEMBER, ORGANIZATION_ROLES.GUEST), getOrganization);
router.put('/:id', authorizeOrgRole(ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN), updateOrganization);
router.post('/:id/invite', authorizeOrgRole(ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN), inviteMember);

// Member Management
router.put('/:id/members/:userId', authorizeOrgRole(ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN), updateMemberRole);
router.delete('/:id/members/:userId', authorizeOrgRole(ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN), removeMember);

router.post('/:id/subscription', authorizeOrgRole(ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN), updateSubscription);
router.post('/:id/checkout', authorizeOrgRole(ORGANIZATION_ROLES.OWNER, ORGANIZATION_ROLES.ADMIN), createCheckoutSession);

module.exports = router;
