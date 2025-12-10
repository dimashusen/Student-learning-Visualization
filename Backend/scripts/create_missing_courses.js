const mongoose = require('mongoose');
const fs = require('fs');

const MONGO_URI = 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

const StudentSchema = new mongoose.Schema(
  { name: String, email: String, course_name: String, course_id: String, learning_path_id: String, active_tutorials: Number, completed_tutorials: Number, total_tutorials: Number, is_graduated: String, already_generated_certificate: String, final_submission_id: String, submission_rating: String, final_exam_id: String, exam_score: String, started_learning_at: String, tutorial_ids: [String], synced_at: Date },
  { strict: false }
);

const CourseSchema = new mongoose.Schema(
  { course_id: String, course_name: String, learning_path_id: String, learning_path_name: String, course_level_id: String, course_level_name: String },
  { strict: false }
);

const TutorialSchema = new mongoose.Schema(
  { tutorial_id: String, tutorial_name: String, course_id: String },
  { strict: false }
);

const Student = mongoose.model('Student', StudentSchema);
const Course = mongoose.model('Course', CourseSchema);
const Tutorial = mongoose.model('Tutorial', TutorialSchema);

async function createMissingCoursesAndSync() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'dicoding_db' });
    console.log('Connected to MongoDB\n');

    // Get all unsynced students
    const unsyncedStudents = await Student.find({ synced_at: { $exists: false } });
    console.log(`Found ${unsyncedStudents.length} unsynced students\n`);

    const missingCourses = new Map();
    const failedStudents = [];

    // Collect unique missing course names
    for (const student of unsyncedStudents) {
      const existingCourse = await Course.findOne({ course_name: student.course_name });
      if (!existingCourse) {
        if (!missingCourses.has(student.course_name)) {
          missingCourses.set(student.course_name, []);
        }
        missingCourses.get(student.course_name).push(student.name);
      }
    }

    console.log(`Found ${missingCourses.size} unique missing courses\n`);
    console.log('Creating missing course records...\n');

    const coursesToCreate = [];
    let courseIdCounter = 100; // Start from ID 100 to avoid conflicts

    for (const [courseName, studentNames] of missingCourses) {
      const courseId = `C-${courseIdCounter}`;
      coursesToCreate.push({
        course_id: courseId,
        course_name: courseName,
        learning_path_id: 'LP-UNKNOWN',
        learning_path_name: 'Unknown Path',
        course_level_id: 'CL-UNKNOWN',
        course_level_name: 'Unknown Level'
      });
      console.log(`[${courseIdCounter}] Created Course: ${courseName} (ID: ${courseId}) - ${studentNames.length} students`);
      courseIdCounter++;
    }

    // Bulk insert missing courses
    if (coursesToCreate.length > 0) {
      const result = await Course.insertMany(coursesToCreate);
      console.log(`\n✅ Inserted ${result.length} new course records\n`);
    }

    // Now sync all unsynced students again
    console.log('Syncing all unsynced students with their courses...\n');

    let syncedCount = 0;
    const batchSize = 50;

    for (let i = 0; i < unsyncedStudents.length; i += batchSize) {
      const batch = unsyncedStudents.slice(i, i + batchSize);

      for (const student of batch) {
        try {
          // Find course
          const course = await Course.findOne({ course_name: student.course_name });
          if (!course) {
            console.log(`⚠️  Skipped ${student.name}: Course "${student.course_name}" not found`);
            failedStudents.push(student);
            continue;
          }

          // Find tutorials for this course
          const tutorials = await Tutorial.find({ course_id: course.course_id });
          const tutorial_ids = tutorials.map(t => t.tutorial_id);

          // Update student
          await Student.updateOne(
            { _id: student._id },
            {
              $set: {
                course_id: course.course_id,
                tutorial_ids: tutorial_ids,
                total_tutorials: tutorials.length,
                synced_at: new Date()
              }
            }
          );

          syncedCount++;
        } catch (err) {
          console.log(`❌ Error syncing ${student.name}: ${err.message}`);
          failedStudents.push(student);
        }
      }

      console.log(`Processed ${Math.min(i + batchSize, unsyncedStudents.length)}/${unsyncedStudents.length}`);
    }

    console.log(`\n✅ Successfully synced ${syncedCount} additional students\n`);

    // Final report
    const totalSynced = await Student.countDocuments({ synced_at: { $exists: true } });
    const stillUnsynced = await Student.countDocuments({ synced_at: { $exists: false } });
    const totalStudents = await Student.countDocuments({});

    console.log('📊 FINAL SYNC REPORT');
    console.log('═══════════════════════════════════════');
    console.log(`Total Students: ${totalStudents}`);
    console.log(`Synced: ${totalSynced}`);
    console.log(`Still Unsynced: ${stillUnsynced}`);
    console.log(`Overall Success Rate: ${((totalSynced / totalStudents) * 100).toFixed(2)}%\n`);

    if (failedStudents.length > 0) {
      console.log(`Still Failed (${failedStudents.length}):`);
      failedStudents.slice(0, 10).forEach(s => {
        console.log(`  - ${s.name} (${s.course_name})`);
      });
      if (failedStudents.length > 10) {
        console.log(`  ... and ${failedStudents.length - 10} more`);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createMissingCoursesAndSync();
