const Organization = require('../models/Organization');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const User = require('../models/User');
const crypto = require('crypto');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new organization
// @route   POST /api/v1/organizations
// @access  Private
const createOrganization = asyncHandler(async (req, res, next) => {
    const { name, description, industry, size } = req.body;

    const organization = await Organization.create({
        name,
        description,
        industry,
        size,
        owner: req.user._id,
        members: [{ user: req.user._id, role: 'owner' }],
    });

    res.status(201).json({
        success: true,
        data: organization,
    });
});

// @desc    Get user organizations
// @route   GET /api/v1/organizations
// @access  Private
const getMyOrganizations = asyncHandler(async (req, res, next) => {
    const organizations = await Organization.find({
        'members.user': req.user._id,
        isDeleted: false,
    }).populate('members.user', 'name email avatar systemRole');

    res.status(200).json({
        success: true,
        count: organizations.length,
        data: organizations,
    });
});

// @desc    Get organization by ID
// @route   GET /api/v1/organizations/:id
// @access  Private (Org Member)
const getOrganization = asyncHandler(async (req, res, next) => {
    const organization = await Organization.findById(req.params.id)
        .populate('members.user', 'name email avatar')
        .populate('owner', 'name email avatar');

    if (!organization || organization.isDeleted) {
        return next(new AppError('Organization not found', 404));
    }

    res.status(200).json({
        success: true,
        data: organization,
    });
});

// @desc    Update organization
// @route   PUT /api/v1/organizations/:id
// @access  Private (Org Admin/Owner)
const updateOrganization = asyncHandler(async (req, res, next) => {
    let organization = await Organization.findById(req.params.id);

    if (!organization || organization.isDeleted) {
        return next(new AppError('Organization not found', 404));
    }

    organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: organization,
    });
});

// @desc    Invite member to organization
// @route   POST /api/v1/organizations/:id/invite
// @access  Private (Org Admin/Owner)
const inviteMember = asyncHandler(async (req, res, next) => {
    const { email, role } = req.body;
    const org = await Organization.findById(req.params.id);

    if (!org) return next(new AppError('Organization not found', 404));

    // Check if already a member
    const user = await User.findOne({ email });
    if (user && org.members.some(m => m.user.toString() === user._id.toString())) {
        return next(new AppError('User is already a member', 400));
    }

    // If user exists, join directly
    if (user) {
        org.members.push({
            user: user._id,
            role: role || 'member'
        });
        await org.save();

        // Send notification to the user
        const io = req.app.get('socketio');
        await createAndEmitNotification({
            recipient: user._id,
            sender: req.user._id,
            type: 'announcement',
            title: 'Welcome to Organization',
            message: `You have been added to: ${org.name}`,
            referenceId: org._id,
            referenceType: 'Organization'
        }, io);

        return res.status(200).json({
            success: true,
            message: `User ${user.name} added successfully!`,
            data: user
        });
    }

    // Create invitation for new users
    const token = crypto.randomBytes(20).toString('hex');
    const invitation = {
        email,
        role: role || 'member',
        invitedBy: req.user._id,
        token,
    };

    org.pendingInvitations.push(invitation);
    await org.save();

    res.status(200).json({
        success: true,
        message: `Invitation sent to ${email}`,
    });
});

// Stripe price IDs — set these in .env after creating products in your Stripe dashboard
const PRICE_IDS = {
    pro: process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_placeholder',
};

// @desc    Create Stripe Checkout Session for plan upgrade
// @route   POST /api/v1/orgs/:id/checkout
// @access  Private (Org Owner)
const createCheckoutSession = asyncHandler(async (req, res, next) => {
    const { plan } = req.body;
    const org = await Organization.findById(req.params.id);

    if (!org) return next(new AppError('Organization not found', 404));
    if (org.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Only organization owners can manage subscriptions', 403));
    }
    if (!PRICE_IDS[plan]) {
        return next(new AppError('Invalid plan — only pro and enterprise require checkout', 400));
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: req.user.email,
        line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
        metadata: {
            orgId: org._id.toString(),
            plan,
            userId: req.user._id.toString(),
        },
        success_url: `${process.env.CLIENT_URL}/settings?upgrade=success&plan=${plan}`,
        cancel_url: `${process.env.CLIENT_URL}/settings?upgrade=cancelled`,
    });

    res.status(200).json({ success: true, url: session.url });
});

// @desc    Stripe Webhook — activates plan after successful payment
// @route   POST /api/v1/orgs/webhook
// @access  Public (Stripe only — raw body required)
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { orgId, plan } = session.metadata;

        const plans = {
            pro: { maxMembers: 50, maxProjects: 100, storage: { used: 0, limit: 10737418240 } },
            enterprise: { maxMembers: 1000, maxProjects: 10000, storage: { used: 0, limit: 107374182400 } },
        };

        await Organization.findByIdAndUpdate(orgId, {
            subscription: {
                plan,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                ...plans[plan],
            },
        });
    }

    res.json({ received: true });
};

// @desc    Update organization subscription plan (free downgrade)
// @route   POST /api/v1/orgs/:id/subscription
// @access  Private (Org Owner)
const updateSubscription = asyncHandler(async (req, res, next) => {
    const { plan } = req.body;
    const org = await Organization.findById(req.params.id);

    if (!org) return next(new AppError('Organization not found', 404));
    if (org.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Forbidden: Only organization owners can manage subscriptions', 403));
    }

    const plans = {
        free: { maxMembers: 5, maxProjects: 10, storage: { used: 0, limit: 1073741824 } },
        pro: { maxMembers: 50, maxProjects: 100, storage: { used: 0, limit: 10737418240 } },
        enterprise: { maxMembers: 1000, maxProjects: 10000, storage: { used: 0, limit: 107374182400 } },
    };

    if (!plans[plan]) return next(new AppError('Invalid plan selected', 400));

    const updatedOrg = await Organization.findByIdAndUpdate(req.params.id, {
        $set: {
            'subscription.plan': plan,
            'subscription.maxMembers': plans[plan].maxMembers,
            'subscription.maxProjects': plans[plan].maxProjects,
            'subscription.storage': plans[plan].storage
        }
    }, { new: true, runValidators: true });

    res.status(200).json({
        success: true,
        data: updatedOrg.subscription,
        message: `Success! Your workspace is now on the ${plan.toUpperCase()} plan.`
    });
});

// @desc    Update a member's role in the organization
// @route   PUT /api/v1/organizations/:id/members/:userId
// @access  Private (Org Owner/Admin)
const updateMemberRole = asyncHandler(async (req, res, next) => {
    const { role } = req.body;
    const { id, userId } = req.params;

    if (!role) return next(new AppError('Please provide a role', 400));
    if (!Object.values(require('../utils/roles').ORGANIZATION_ROLES).includes(role)) {
        return next(new AppError('Invalid role', 400));
    }

    const org = await Organization.findById(id);
    if (!org) return next(new AppError('Organization not found', 404));

    // Find the member to update
    const memberIndex = org.members.findIndex(m => m.user.toString() === userId && m.isActive);

    if (memberIndex === -1) {
        return next(new AppError('Member not found in this organization', 404));
    }

    // Role specific logic
    if (org.members[memberIndex].role === 'owner' && role !== 'owner') {
        return next(new AppError('Ownership cannot be removed this way. Please transfer ownership instead.', 400));
    }

    org.members[memberIndex].role = role;
    await org.save();

    res.status(200).json({
        success: true,
        message: 'Member role updated successfully',
        data: org.members[memberIndex]
    });
});

// @desc    Remove a member from the organization
// @route   DELETE /api/v1/organizations/:id/members/:userId
// @access  Private (Org Owner/Admin)
const removeMember = asyncHandler(async (req, res, next) => {
    const { id, userId } = req.params;

    const org = await Organization.findById(id);
    if (!org) return next(new AppError('Organization not found', 404));

    const memberIndex = org.members.findIndex(m => m.user.toString() === userId);

    if (memberIndex === -1) {
        return next(new AppError('Member not found', 404));
    }

    if (org.members[memberIndex].role === 'owner') {
        return next(new AppError('The organization owner cannot be removed', 400));
    }

    org.members.splice(memberIndex, 1);
    await org.save();

    res.status(200).json({
        success: true,
        message: 'Member removed successfully'
    });
});

module.exports = {
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
};
