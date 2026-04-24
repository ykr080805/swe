require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const HMCMember = require('./models/HMCMember');

const seedHMC = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-erp');
    console.log('Connected to MongoDB for HMC seeding...');

    // Create a Warden user
    const wardenId = 'warden123';
    let user = await User.findOne({ userId: wardenId });
    if (!user) {
      user = new User({
        userId: wardenId,
        password: 'password123',
        role: 'hmc_member',
        name: 'Dr. Hostel Warden',
        email: 'warden@college.edu',
        department: 'Hostel Administration'
      });
      await user.save();
      console.log(`Warden user created! (userId: ${wardenId}, password: password123)`);
    } else {
      console.log('Warden user already exists.');
    }

    // Create HMCMember record
    const memberExists = await HMCMember.findOne({ user: user._id });
    if (!memberExists) {
      await HMCMember.create({
        user: user._id,
        role: 'Warden',
        hostel: 'Lohit',
        isActive: true
      });
      console.log('Warden HMC Member record created successfully!');
    } else {
      console.log('Warden HMC Member record already exists.');
    }

    console.log('\nYou can now log in with:');
    console.log('User ID: warden123');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding HMC data:', error);
    process.exit(1);
  }
};

seedHMC();
