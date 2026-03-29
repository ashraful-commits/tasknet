const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Access Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// Generate JWT Refresh Token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });
};

// Send token in cookie and response
const sendToken = (user, statusCode, res, message = 'Success') => {
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Remove password from user object
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.twoFactorSecret;
    delete userObj.twoFactorBackupCodes;

    res.status(statusCode).json({
        success: true,
        message,
        token,
        refreshToken,
        user: userObj,
    });
};

// Protect routes - require authentication
const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password -twoFactorSecret');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        if (!user.isActive || user.isDeleted) {
            return res.status(401).json({ success: false, message: 'Account is deactivated or deleted' });
        }

        // Update last active
        await User.findByIdAndUpdate(decoded.id, { lastActive: new Date() }, { timestamps: false });

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        res.status(500).json({ success: false, message: 'Server error in authentication' });
    }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }
    } catch (err) {
        // ignore errors for optional auth
    }
    next();
};

// Authorize specific system roles
// Authorize specific system roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.systemRole)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.systemRole}' is not authorized to access this resource`,
            });
        }
        next();
    };
};

const Organization = require('../models/Organization');
const { ORGANIZATION_ROLES } = require('../utils/roles');

// Authorize specific organization roles
const authorizeOrgRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const orgId = req.params.orgId || req.params.id || req.body.organizationId || req.body.organization || req.query.orgId || req.headers['x-org-id'];

            if (!orgId) {
                return res.status(400).json({ success: false, message: 'Organization ID is required for this action' });
            }

            const organization = await Organization.findById(orgId);
            if (!organization) {
                return res.status(404).json({ success: false, message: 'Organization not found' });
            }

            // Find user's role in the organization
            const member = organization.members.find(m => m.user.toString() === req.user._id.toString() && m.isActive);

            if (!member) {
                return res.status(403).json({ success: false, message: 'You are not a member of this organization' });
            }

            // Grant access if user is superadmin (system-wide) or has the required org role
            const hasRole = allowedRoles.includes(member.role) || req.user.systemRole === 'superadmin';

            if (!hasRole) {
                return res.status(403).json({
                    success: false,
                    message: `Action rejected: Your role '${member.role}' in this workspace lacks the required permissions.`,
                });
            }

            // Attach org and role to request for controllers
            req.organization = organization;
            req.userOrgRole = member.role;
            next();
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error in organization authorization' });
        }
    };
};

module.exports = { protect, optionalAuth, authorize, authorizeOrgRole, generateToken, generateRefreshToken, sendToken };
