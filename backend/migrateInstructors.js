const mongoose = require('mongoose');
require('dotenv').config();
const CourseOffering = require('./models/CourseOffering');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academic_portal')
  .then(async () => {
    console.log('Connected. Back-filling instructors[] from faculty field...');
    
    // Find all offerings where faculty exists but instructors is empty or missing
    const offerings = await CourseOffering.find({
      faculty: { $exists: true, $ne: null }
    });
    
    let updated = 0;
    for (const o of offerings) {
      const hasInstructors = o.instructors && o.instructors.length > 0;
      if (!hasInstructors) {
        o.instructors = [o.faculty];
        await o.save();
        updated++;
        console.log(`  Updated offering ${o._id} — added faculty ${o.faculty} to instructors[]`);
      }
    }
    
    console.log(`\nDone. Updated ${updated} out of ${offerings.length} offerings.`);
    mongoose.disconnect();
  })
  .catch(e => { console.error('Error:', e.message); process.exit(1); });
