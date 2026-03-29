require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Project = require('../models/Project');

const listProjects = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const projects = await Project.find({ isDeleted: false });
        console.log('--- PROJECTS LIST ---');
        projects.forEach(p => {
            console.log(`ID: ${p._id} | Name: ${p.name} | Org: ${p.organization}`);
        });
        console.log('---------------------');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

listProjects();
