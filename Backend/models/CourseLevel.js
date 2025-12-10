const mongoose = require('mongoose');

const courseLevelSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  course_level: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('CourseLevel', courseLevelSchema);