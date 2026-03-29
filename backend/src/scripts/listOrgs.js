require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Organization = require('../models/Organization');

const listOrgs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const orgs = await Organization.find();
        console.log('--- ORGS LIST ---');
        orgs.forEach(o => {
            console.log(`ID: ${o._id} | Name: ${o.name} | Members: ${o.members.map(m => m.user)}`);
        });
        console.log('---------------------');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

listOrgs();
