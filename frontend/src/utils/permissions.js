/**
 * Frontend Permission Helpers for TaskNest
 */

export const SYSTEM_ROLES = {
    SUPER_ADMIN: 'superadmin',
    ADMIN: 'admin',
    USER: 'user'
};

export const ORG_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    PROJECT_MANAGER: 'project_manager',
    MEMBER: 'member',
    GUEST: 'guest'
};

/**
 * Checks if a user has at least one of the required organization roles.
 * Also grants access if the user is a platform-level Super Admin.
 */
export const hasOrgPermission = (user, organization, allowedRoles) => {
    if (!user || !organization) return false;

    // Super Admins bypass organization checks
    if (user.systemRole === SYSTEM_ROLES.SUPER_ADMIN) return true;

    // Find user in organization members
    const member = organization.members?.find(m =>
        (m.user?._id || m.user) === user._id && m.isActive
    );

    if (!member) return false;

    return allowedRoles.includes(member.role);
};

/**
 * Higher-order check for common permissions
 */
export const canManageOrganization = (user, organization) =>
    hasOrgPermission(user, organization, [ORG_ROLES.OWNER, ORG_ROLES.ADMIN]);

export const canManageProjects = (user, organization) =>
    hasOrgPermission(user, organization, [ORG_ROLES.OWNER, ORG_ROLES.ADMIN, ORG_ROLES.PROJECT_MANAGER]);

export const isOrgMember = (user, organization) =>
    hasOrgPermission(user, organization, Object.values(ORG_ROLES));
