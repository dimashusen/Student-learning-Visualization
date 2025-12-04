const mongoose = require('mongoose');

const lpCourseSchema = new mongoose.Schema({
  learning_path_name: String,
  course_name: String,
  course_level_str: String,
  tutorial_title: String
});

module.exports = mongoose.model('LP_Course', lpCourseSchema);
