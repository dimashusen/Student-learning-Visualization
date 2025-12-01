const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  course_name: String,
  learning_path_id: String,
  active_tutorials: Number,
  completed_tutorials: Number,
  is_graduated: String,
  already_generated_certificate: String,
  final_submission_id: String,
  submission_rating: String,
  final_exam_id: String,
  exam_score: String,
  started_learning_at: String
});

module.exports = mongoose.model('Student', studentSchema);