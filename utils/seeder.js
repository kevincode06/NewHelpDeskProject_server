const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' });

const createFirstAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminExists = await User.findOne({ email: 'admin@helpdesk.com' });

        if (adminExists) { 
            console.log('Admin user already exists');
            process.exit(0);
        }

        await User.create({
            name: 'Admin User',
            email: 'admin@helpdesk.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Admin created successfully!'); 
        console.log('Email: admin@helpdesk.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};


createFirstAdmin();