const mongoose = require('mongoose');

const lpCourseSchema = new mongoose.Schema({
  learning_path_name: {
    type: String,
    required: true,
    index: true
  },
  course_name: {
    type: String,
    required: true,
    index: true
  },
  course_level_str: {
    type: String,
    required: true
  },
  tutorial_title: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('LPCourse', lpCourseSchema);