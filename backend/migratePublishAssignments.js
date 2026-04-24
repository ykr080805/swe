const mongoose = require('mongoose');
require('dotenv').config();
const Assignment = require('./models/Assignment');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await Assignment.updateMany({ isPublished: false }, { isPublished: true });
    console.log(`Published ${result.modifiedCount} previously unpublished assignments.`);
    mongoose.disconnect();
  })
  .catch(e => { console.error(e.message); process.exit(1); });
