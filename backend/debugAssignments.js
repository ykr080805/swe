const mongoose = require('mongoose');
require('dotenv').config();
require('./models/Course');
require('./models/User');
const CourseOffering = require('./models/CourseOffering');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const o1 = await CourseOffering.findById('69eae866ae149cafc4bfb2d8').populate('course', 'code name').populate('faculty', 'name');
  const o2 = await CourseOffering.findById('69eb0d995a0a8897e835234d').populate('course', 'code name').populate('faculty', 'name');
  console.log('Offering with assignment:', o1?.course?.code, o1?.course?.name, '|', o1?.semester, o1?.year);
  console.log('Offering student enrolled in:', o2?.course?.code, o2?.course?.name, '|', o2?.semester, o2?.year);
  mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });
