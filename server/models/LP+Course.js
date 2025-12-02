const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lpCourseSchema = new Schema({
    learning_path_id: {
        type: String,
        required: true,
        trim: true
    },
    learning_path_name: {
        type: String,
        required: true,
        trim: true
    },
    course_id: {
        type: String,
        required: true,
        trim: true
    },
    course_name: { type: String, required: true, trim: true },
    course_level_str: { type: String, trim: true }, 
    hours_to_study: { type: Number, required: true }
});

const LPCourse = mongoose.model('LPCourse', lpCourseSchema);

module.exports = LPCourse;
