const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  course_name: String,
  course_id: String, // New field
  learning_path_id: String,
  active_tutorials: Number,
  completed_tutorials: Number,
  total_tutorials: Number, // New field - untuk tracking
  is_graduated: String,
  already_generated_certificate: String,
  final_submission_id: String,
  submission_rating: String,
  final_exam_id: String,
  exam_score: String,
  started_learning_at: String,
  tutorial_ids: [String], // New field - for linking to Tutorial collection
  synced_at: Date // New field - timestamp
});

const TutorialSchema = new mongoose.Schema({
  tutorial_id: String,
  course_id: String,
  tutorial_title: String
});

const CourseSchema = new mongoose.Schema({
  course_id: String,
  learning_path_id: String,
  course_name: String,
  course_level_str: String,
  hours_to_study: Number
});

const Student = mongoose.model('Student', StudentSchema);
const Tutorial = mongoose.model('Tutorial', TutorialSchema);
const Course = mongoose.model('Course', CourseSchema);

async function syncStudentData() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'dicoding_db' });
    console.log('Connected to MongoDB');

    // Get all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students to sync`);

    let updated = 0;
    let errors = 0;

    for (const student of students) {
      try {
        // Find course by name
        const course = await Course.findOne({ course_name: student.course_name });
        
        if (!course) {
          console.warn(`⚠️  Course not found for: ${student.course_name}`);
          errors++;
          continue;
        }

        // Find all tutorials for this course
        const tutorials = await Tutorial.find({ course_id: course.course_id });
        const tutorial_ids = tutorials.map(t => t.tutorial_id);
        const total_tutorials = tutorials.length;

        // Update student with references
        await Student.updateOne(
          { _id: student._id },
          {
            $set: {
              course_id: course.course_id,
              tutorial_ids: tutorial_ids,
              total_tutorials: total_tutorials,
              synced_at: new Date()
            }
          }
        );

        updated++;

        if (updated % 50 === 0) {
          console.log(`  ✅ Synced ${updated}/${students.length} students...`);
        }
      } catch (err) {
        console.error(`Error syncing student ${student.email}:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Sync completed:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);

    // Verify sync
    const syncedCount = await Student.countDocuments({ synced_at: { $exists: true } });
    console.log(`   Total synced in DB: ${syncedCount}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

syncStudentData();
