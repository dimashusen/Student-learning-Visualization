const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  tutorial_id: String,
  course_id: String,
  tutorial_title: String
});

module.exports = mongoose.model('Tutorial', tutorialSchema);