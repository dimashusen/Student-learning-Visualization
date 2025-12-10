const mongoose = require('mongoose');
const path = require('path');

const MONGO_URI = 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: 'dicoding_db' });
  console.log('Connected to MongoDB');

  const models = {
    CourseLevel: require('../models/course level'),
    LearningPath: require('../models/LearningPath'),
    Course: require('../models/Course'),
    Tutorial: require('../models/Tutorial'),
    LP_Course: require('../models/LP + Course'),
    Student: require('../models/Student')
  };

  for (const [name, Model] of Object.entries(models)) {
    try {
      const c = await Model.countDocuments();
      console.log(`${name}: ${c}`);
    } catch (err) {
      console.error(`Error counting ${name}:`, err.message || err);
    }
  }

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
