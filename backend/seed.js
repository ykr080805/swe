require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-erp');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing users if you want to start fresh (optional)
    // await User.deleteMany({});
    
    // Check if admin already exists
    const adminExists = await User.findOne({ userId: 'admin123' });
    if (!adminExists) {
      const admin = new User({
        userId: 'admin123',
        password: 'password123', // This will be hashed by the pre-save hook in User model
        role: 'admin',
        name: 'Super Admin',
        email: 'admin@college.edu',
        department: 'Administration'
      });
      await admin.save();
      console.log('Admin user created successfully! (userId: admin123, password: password123)');
    } else {
      console.log('Admin user already exists.');
    }

    // Check if student already exists
    const studentExists = await User.findOne({ userId: 'student123' });
    if (!studentExists) {
      const student = new User({
        userId: 'student123',
        password: 'password123',
        role: 'student',
        name: 'John Doe',
        email: 'john.student@college.edu',
        department: 'Computer Science'
      });
      await student.save();
      console.log('Student user created successfully! (userId: student123, password: password123)');
    } else {
      console.log('Student user already exists.');
    }

    // Check if faculty already exists
    const facultyExists = await User.findOne({ userId: 'faculty123' });
    if (!facultyExists) {
      const faculty = new User({
        userId: 'faculty123',
        password: 'password123',
        role: 'faculty',
        name: 'Dr. Jane Smith',
        email: 'jane.faculty@college.edu',
        department: 'Computer Science'
      });
      await faculty.save();
      console.log('Faculty user created successfully! (userId: faculty123, password: password123)');
    } else {
      console.log('Faculty user already exists.');
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
