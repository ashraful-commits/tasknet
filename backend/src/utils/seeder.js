require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const Task = require('../models/Task');
const TimeEntry = require('../models/TimeEntry');
const Comment = require('../models/Comment');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connected for final premium seeding...');

        // Clear existing data
        await User.deleteMany();
        await Organization.deleteMany();
        await Project.deleteMany();
        await Task.deleteMany();
        await TimeEntry.deleteMany();
        await Comment.deleteMany();

        console.log('🧹 Existing data cleared.');

        // 1. Create Users
        const users = [
            { name: 'Admin User', email: 'admin@tasknet.com', password: 'password123', systemRole: 'superadmin', isEmailVerified: true },
            { name: 'Sarah Wilson', email: 'sarah@tasknet.com', password: 'password123', avatar: { url: 'https://i.pravatar.cc/150?u=sarah' }, isEmailVerified: true },
            { name: 'Marcus Chen', email: 'marcus@tasknet.com', password: 'password123', avatar: { url: 'https://i.pravatar.cc/150?u=marcus' }, isEmailVerified: true },
            { name: 'Elena Gomez', email: 'elena@tasknet.com', password: 'password123', avatar: { url: 'https://i.pravatar.cc/150?u=elena' }, isEmailVerified: true },
            { name: 'Oliver Smith', email: 'oliver@tasknet.com', password: 'password123', avatar: { url: 'https://i.pravatar.cc/150?u=oliver' }, isEmailVerified: true }
        ];

        const createdUsers = await Promise.all(users.map(async u => {
            const user = new User(u);
            return await user.save();
        }));

        const admin = createdUsers[0];
        const team = createdUsers.slice(1);

        console.log('👥 Users created.');

        // 2. Create Organizations
        const orgData = [
            {
                name: 'Creative Pulse Inc.',
                description: 'A leading digital agency providing high-end solutions.',
                owner: admin._id,
                industry: 'Design',
                size: '11-50',
                members: createdUsers.map(u => ({ user: u._id, role: u.email === admin.email ? 'owner' : 'member' }))
            },
            {
                name: 'Acme Research Labs',
                description: 'Innovation hub for the next generation of AI and robotics.',
                owner: admin._id,
                industry: 'Technology',
                size: '51-200',
                members: [{ user: admin._id, role: 'owner' }, { user: team[0]._id, role: 'admin' }]
            }
        ];

        const createdOrgs = [];
        for (const o of orgData) {
            const org = new Organization(o);
            await org.save();
            createdOrgs.push(org);
        }
        console.log('🏢 Organizations created.');

        // 3. Create Projects
        const projectData = [
            {
                name: 'TaskNest Product Launch',
                description: 'Complete UI/UX design and development for the TaskNest platform.',
                organization: createdOrgs[0]._id,
                owner: admin._id,
                template: 'software',
                visibility: 'public',
                members: createdUsers.map(u => ({ user: u._id, role: 'member' })),
                columns: [
                    { id: 'todo', name: 'To Do', order: 0, isDefault: true, color: '#e5e7eb' },
                    { id: 'in_progress', name: 'In Progress', order: 1, color: '#3b82f6' },
                    { id: 'review', name: 'Review', order: 2, color: '#8b5cf6' },
                    { id: 'done', name: 'Done', order: 3, isDone: true, color: '#10b981' },
                ],
                stats: { totalTasks: 8, completedTasks: 2 },
                progress: 25
            }
        ];

        const createdProjects = [];
        for (const p of projectData) {
            const proj = new Project(p);
            await proj.save();
            createdProjects.push(proj);
        }
        console.log('🚀 Projects created.');

        // 4. Create Tasks
        const taskEntries = [
            {
                title: 'High-Fidelity UI Design',
                description: 'Build the premium dashboard with Framer Motion animations.',
                project: createdProjects[0]._id,
                organization: createdOrgs[0]._id,
                createdBy: admin._id,
                status: 'in_progress',
                columnId: 'in_progress',
                priority: 'urgent',
                order: 0,
                assignees: [team[0]._id, team[2]._id]
            },
            {
                title: 'Stripe Checkout Node',
                description: 'Implement the payment gateway with webhook handling.',
                project: createdProjects[0]._id,
                organization: createdOrgs[0]._id,
                createdBy: admin._id,
                status: 'todo',
                columnId: 'todo',
                priority: 'high',
                order: 0,
                assignees: [team[1]._id]
            }
        ];

        await Task.insertMany(taskEntries);
        console.log('📋 Tasks created.');

        console.log('\n🌟 FINAL PRE-SEEDING SUCCESSFUL 🌟');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
