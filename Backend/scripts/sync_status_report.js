const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

const StudentSchema = new mongoose.Schema(
  { name: String, email: String, course_name: String, course_id: String, learning_path_id: String, active_tutorials: Number, completed_tutorials: Number, total_tutorials: Number, is_graduated: String, already_generated_certificate: String, final_submission_id: String, submission_rating: String, final_exam_id: String, exam_score: String, started_learning_at: String, tutorial_ids: [String], synced_at: Date },
  { strict: false }
);

const Student = mongoose.model('Student', StudentSchema);

async function reportSyncStatus() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'dicoding_db' });
    console.log('Connected to MongoDB\n');

    const totalStudents = await Student.countDocuments({});
    const syncedStudents = await Student.countDocuments({ synced_at: { $exists: true } });
    const unsyncedStudents = await Student.countDocuments({ synced_at: { $exists: false } });

    console.log('📊 SYNC STATUS REPORT');
    console.log('═══════════════════════════════════════');
    console.log(`Total Students: ${totalStudents}`);
    console.log(`Synced (with course_id & tutorial_ids): ${syncedStudents}`);
    console.log(`Not Synced: ${unsyncedStudents}`);
    console.log(`Sync Success Rate: ${((syncedStudents / totalStudents) * 100).toFixed(2)}%\n`);

    // Sample synced student
    const sampleSynced = await Student.findOne({ synced_at: { $exists: true } });
    if (sampleSynced) {
      console.log('✅ SAMPLE SYNCED STUDENT:');
      console.log(`   Name: ${sampleSynced.name}`);
      console.log(`   Course: ${sampleSynced.course_name}`);
      console.log(`   Course ID: ${sampleSynced.course_id}`);
      console.log(`   Active Tutorials: ${sampleSynced.active_tutorials}`);
      console.log(`   Completed Tutorials: ${sampleSynced.completed_tutorials}`);
      console.log(`   Total Tutorials Available: ${sampleSynced.total_tutorials}`);
      console.log(`   Tutorial IDs Count: ${sampleSynced.tutorial_ids?.length || 0}\n`);
    }

    // Sample unsynced student
    const sampleUnsynced = await Student.findOne({ synced_at: { $exists: false } });
    if (sampleUnsynced) {
      console.log('⚠️  SAMPLE UNSYNCED STUDENT (course not in DB):');
      console.log(`   Name: ${sampleUnsynced.name}`);
      console.log(`   Course: ${sampleUnsynced.course_name}`);
      console.log(`   Active Tutorials: ${sampleUnsynced.active_tutorials}`);
      console.log(`   Completed Tutorials: ${sampleUnsynced.completed_tutorials}\n`);
    }

    // Statistics on active/completed tutorials
    const stats = await Student.aggregate([
      { $match: { synced_at: { $exists: true } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avg_active: { $avg: '$active_tutorials' },
          avg_completed: { $avg: '$completed_tutorials' },
          avg_total: { $avg: '$total_tutorials' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('📈 SYNCED STUDENTS STATISTICS:');
      console.log(`   Average Active Tutorials: ${stats[0].avg_active?.toFixed(2) || 0}`);
      console.log(`   Average Completed Tutorials: ${stats[0].avg_completed?.toFixed(2) || 0}`);
      console.log(`   Average Total Tutorials per Course: ${stats[0].avg_total?.toFixed(2) || 0}\n`);
    }

    console.log('✅ Sync status report complete!');

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

reportSyncStatus();
