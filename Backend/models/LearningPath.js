const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  learning_path_id: String,
  learning_path_name: String
});

module.exports = mongoose.model('LearningPath', learningPathSchema);