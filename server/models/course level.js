const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Mendefinisikan schema untuk CourseLevel
const courseLevelSchema = new Schema({
    level_id: {
        type: Number,
        required: [true, 'Level ID wajib diisi.'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Nama level wajib diisi.'],
        trim: true
    }
});

module.exports = mongoose.model('CourseLevel', courseLevelSchema);