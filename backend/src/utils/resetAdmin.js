require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const resetAdmin = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('Using DB:', conn.connection.host);

        await User.deleteMany({ email: 'admin@tasknet.com' });

        const admin = new User({
            name: 'TaskNest Admin',
            email: 'admin@tasknet.com',
            password: 'password123',
            systemRole: 'superadmin',
            isEmailVerified: true
        });

        await admin.save();
        console.log('Admin user recreated/reset correctly.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetAdmin();
