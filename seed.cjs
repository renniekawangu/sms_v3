/**
 * Seed script — creates initial Firebase Auth accounts + Firestore profiles.
 *
 * Usage:
 *   FIREBASE_WEB_API_KEY=... node seed.js
 *
 * This will create:
 *   admin@sms.local       / password123  (role: admin)
 *   student1@sms.local    / password123  (role: student)
 *   teacher1@sms.local    / password123  (role: teacher)
 *   headteacher@sms.local / password123  (role: head-teacher)
 *   accounts@sms.local    / password123  (role: accounts)
 */

require('dotenv').config();
const { auth, db } = require('./config/firebase');

const SEED_USERS = [
  { email: 'admin@sms.local',       password: 'password123', role: 'admin',        name: 'System Admin' },
  { email: 'student1@sms.local',    password: 'password123', role: 'student',      name: 'Alice Johnson' },
  { email: 'teacher1@sms.local',    password: 'password123', role: 'teacher',      name: 'Mr. Bob Smith' },
  { email: 'headteacher@sms.local', password: 'password123', role: 'head-teacher', name: 'Dr. Carol White' },
  { email: 'accounts@sms.local',    password: 'password123', role: 'accounts',     name: 'Dave Accounts' },
];

async function seed() {
  console.log('🌱 Seeding Firebase Auth + Firestore...\n');

  for (const u of SEED_USERS) {
    try {
      // Try to create; if email already exists, fetch and update claims
      let userRecord;
      try {
        userRecord = await auth.createUser({
          email: u.email,
          password: u.password,
          displayName: u.name,
        });
        console.log(`  ✅ Created Auth user: ${u.email}`);
      } catch (err) {
        if (err.code === 'auth/email-already-exists') {
          userRecord = await auth.getUserByEmail(u.email);
          console.log(`  ♻️  Auth user already exists: ${u.email}`);
        } else {
          throw err;
        }
      }

      // Set custom claims (role)
      await auth.setCustomUserClaims(userRecord.uid, { role: u.role });

      // Upsert Firestore user profile
      await db.collection('users').doc(userRecord.uid).set({
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      // Create role-specific profile documents
      if (u.role === 'student') {
        const existing = await db.collection('students').where('uid', '==', userRecord.uid).limit(1).get();
        if (existing.empty) {
          await db.collection('students').add({
            name: u.name,
            email: u.email,
            uid: userRecord.uid,
            createdBy: 'seed',
            createdAt: new Date().toISOString(),
          });
          console.log(`     + Created student profile for ${u.name}`);
        }
      }

      if (u.role === 'teacher') {
        const existing = await db.collection('teachers').where('uid', '==', userRecord.uid).limit(1).get();
        if (existing.empty) {
          await db.collection('teachers').add({
            name: u.name,
            email: u.email,
            uid: userRecord.uid,
            createdBy: 'seed',
            createdAt: new Date().toISOString(),
          });
          console.log(`     + Created teacher profile for ${u.name}`);
        }
      }

      if (['teacher', 'head-teacher', 'accounts'].includes(u.role)) {
        const existing = await db.collection('staff').where('uid', '==', userRecord.uid).limit(1).get();
        if (existing.empty) {
          const parts = u.name.trim().split(' ');
          await db.collection('staff').add({
            firstName: parts[0],
            lastName: parts.slice(1).join(' ') || '',
            name: u.name,
            email: u.email,
            role: u.role,
            uid: userRecord.uid,
            createdBy: 'seed',
            createdAt: new Date().toISOString(),
          });
          console.log(`     + Created staff profile for ${u.name}`);
        }
      }

    } catch (err) {
      console.error(`  ❌ Failed for ${u.email}:`, err.message);
    }
  }

  console.log('\n✅ Seed complete!');
  console.log('\nCredentials:');
  SEED_USERS.forEach(u => console.log(`  ${u.role.padEnd(14)} ${u.email}  /  ${u.password}`));
  process.exit(0);
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
