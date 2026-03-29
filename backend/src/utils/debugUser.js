require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const checkUser = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to:', conn.connection.host);

        const user = await User.findOne({ email: 'admin@tasknet.com' }).select('+password');
        if (!user) {
            console.log('User NOT found!');
            process.exit(1)
        }

        console.log('User found:', user.email);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
