const mongoose = require('mongoose');

const courseLevelSchema = new mongoose.Schema({
  id: String,
  course_level: String
});

module.exports = mongoose.model('CourseLevel', courseLevelSchema);
