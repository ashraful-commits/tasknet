/**
 * Global Role Definitions for TaskNest
 * Standards for System-wide and Organization-level access.
 */

const SYSTEM_ROLES = {
    SUPER_ADMIN: 'superadmin', // Full access to entire platform, all organizations, and billing
    ADMIN: 'admin',           // System-level administrative access to manage users and global defaults
    USER: 'user'              // Default platform user role
};

const ORGANIZATION_ROLES = {
    OWNER: 'owner',           // Full access to a specific organization. Can delete organization.
    ADMIN: 'admin',           // Can manage members, billing, and all projects in organization.
    PROJECT_MANAGER: 'project_manager', // Can create and manage all projects.
    MEMBER: 'member',         // Standard team member. Can create tasks and participate in projects.
    GUEST: 'guest'            // Restricted access. Can only see projects/tasks they are explicitly added to.
};

module.exports = {
    SYSTEM_ROLES,
    ORGANIZATION_ROLES
};
