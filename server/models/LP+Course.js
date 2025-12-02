const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Saran: Jika 'learning_path_id' dan 'course_id' adalah referensi ke koleksi lain,
// pertimbangkan untuk menggunakan tipe ObjectId dan 'ref' untuk memungkinkan populasi data.
// Contoh:
// learning_path_id: { type: Schema.Types.ObjectId, ref: 'LearningPath', required: true },
// course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },

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
    course_level_str: { type: String, trim: true }, // Pertimbangkan menggunakan enum jika nilainya terbatas, contoh: enum: ['Beginner', 'Intermediate', 'Advanced']
    hours_to_study: { type: Number, required: true }
});

const LPCourse = mongoose.model('LPCourse', lpCourseSchema);

module.exports = LPCourse;
