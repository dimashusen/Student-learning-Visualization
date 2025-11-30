const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_id: String,
  learning_path_id: String,
  course_name: String,
  course_level_str: String,
  hours_to_study: Number
});

module.exports = mongoose.model('Course', courseSchema);