const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const LearningPath = require('./models/LearningPath');
const Course = require('./models/Course');
const Tutorial = require('./models/Tutorial');

const CSV_SEPARATOR = ';';

async function seedLpCourse() {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, `../src/public/data/lp+course.csv`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File TIDAK DITEMUKAN: ${filePath}`);
      resolve();
      return;
    }

    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: CSV_SEPARATOR, mapHeaders: ({ header }) => header.trim().replace(/^/, ''), mapValues: ({ value }) => value ? value.trim() : null }))
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          if (rows.length === 0) {
            console.warn('⚠️  Tidak ada data di lp+course.csv');
            resolve();
            return;
          }

          // Maps to collect unique entities
          const lpMap = new Map(); // name -> id
          const courseMap = new Map(); // key(lpName||courseName) -> courseId
          const tutorials = [];

          let lpCounter = 0;
          let courseCounter = 0;
          let tutCounter = 0;

          for (const r of rows) {
            const lpName = (r.learning_path_name || '').trim();
            const courseName = (r.course_name || '').trim();
            const courseLevel = (r.course_level_str || '').trim();
            const tutorialTitle = (r.tutorial_title || '').trim();

            if (!lpName || !courseName) continue; // skip malformed rows

            // learning path
            if (!lpMap.has(lpName)) {
              lpCounter += 1;
              const lpId = String(lpCounter);
              lpMap.set(lpName, lpId);
            }

            const lpId = lpMap.get(lpName);

            // course
            const courseKey = `${lpName}||${courseName}`;
            if (!courseMap.has(courseKey)) {
              courseCounter += 1;
              const courseId = String(courseCounter);
              courseMap.set(courseKey, { course_id: courseId, course_name: courseName, course_level_str: courseLevel, learning_path_id: lpId });
            }

            const courseEntry = courseMap.get(courseKey);

            // tutorial
            if (tutorialTitle) {
              tutCounter += 1;
              tutorials.push({ tutorial_id: String(tutCounter), course_id: courseEntry.course_id, tutorial_title: tutorialTitle });
            }
          }

          // Prepare documents
          const learningPaths = Array.from(lpMap.entries()).map(([name, id]) => ({ learning_path_id: String(id), learning_path_name: name }));
          const courses = Array.from(courseMap.values()).map(c => ({ course_id: String(c.course_id), learning_path_id: String(c.learning_path_id), course_name: c.course_name, course_level_str: c.course_level_str, hours_to_study: 0 }));

          // Replace existing collections with new data
          await LearningPath.deleteMany({});
          await Course.deleteMany({});
          await Tutorial.deleteMany({});

          if (learningPaths.length) await LearningPath.insertMany(learningPaths);
          if (courses.length) await Course.insertMany(courses);
          if (tutorials.length) await Tutorial.insertMany(tutorials);

          console.log(`   ✅ SUKSES: ${learningPaths.length} LearningPath, ${courses.length} Course, ${tutorials.length} Tutorial dimasukkan dari lp+course.csv`);
          resolve();
        } catch (err) {
          console.error('   ❌ Gagal memproses lp+course.csv', err.message || err);
          reject(err);
        }
      })
      .on('error', (err) => {
        console.error('   ❌ Error membaca file lp+course.csv', err.message || err);
        reject(err);
      });
  });
}

module.exports = seedLpCourse;
