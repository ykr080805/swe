/**
 * Seeds IITG Departments and Programs into MongoDB.
 * Run once: node seedIITG.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');
const Program = require('./models/Program');

const DEPARTMENTS = [
  { name: 'Computer Science and Engineering', code: 'CSE' },
  { name: 'Electronics and Electrical Engineering', code: 'EEE' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Civil Engineering', code: 'CE' },
  { name: 'Chemical Engineering', code: 'ChE' },
  { name: 'Biotechnology', code: 'BT' },
  { name: 'Mathematics', code: 'MA' },
  { name: 'Physics', code: 'PH' },
  { name: 'Chemistry', code: 'CY' },
  { name: 'Humanities and Social Sciences', code: 'HSS' },
  { name: 'Design', code: 'Des' },
  { name: 'Energy', code: 'Ene' },
  { name: 'Earth Sciences', code: 'ES' },
  { name: 'Data Science and Artificial Intelligence', code: 'DSAI' },
];

// Programs: { name, deptCode, duration (years), totalCredits }
const PROGRAMS_BY_DEPT = {
  CSE: [
    { name: 'B.Tech Computer Science and Engineering', duration: 4, totalCredits: 160 },
    { name: 'M.Tech Computer Science and Engineering', duration: 2, totalCredits: 64 },
    { name: 'PhD Computer Science and Engineering', duration: 5, totalCredits: 96 },
  ],
  EEE: [
    { name: 'B.Tech Electronics and Electrical Engineering', duration: 4, totalCredits: 160 },
    { name: 'M.Tech Signal Processing', duration: 2, totalCredits: 64 },
    { name: 'M.Tech VLSI Design', duration: 2, totalCredits: 64 },
    { name: 'PhD Electronics and Electrical Engineering', duration: 5, totalCredits: 96 },
  ],
  ME: [
    { name: 'B.Tech Mechanical Engineering', duration: 4, totalCredits: 160 },
    { name: 'M.Tech Thermal Engineering', duration: 2, totalCredits: 64 },
    { name: 'M.Tech Design Engineering', duration: 2, totalCredits: 64 },
    { name: 'PhD Mechanical Engineering', duration: 5, totalCredits: 96 },
  ],
  CE: [
    { name: 'B.Tech Civil Engineering', duration: 4, totalCredits: 160 },
    { name: 'M.Tech Structural Engineering', duration: 2, totalCredits: 64 },
    { name: 'M.Tech Environmental Engineering', duration: 2, totalCredits: 64 },
    { name: 'PhD Civil Engineering', duration: 5, totalCredits: 96 },
  ],
  ChE: [
    { name: 'B.Tech Chemical Engineering', duration: 4, totalCredits: 160 },
    { name: 'M.Tech Chemical Engineering', duration: 2, totalCredits: 64 },
    { name: 'PhD Chemical Engineering', duration: 5, totalCredits: 96 },
  ],
  BT: [
    { name: 'B.Tech Biotechnology', duration: 4, totalCredits: 160 },
    { name: 'M.Tech Biotechnology', duration: 2, totalCredits: 64 },
    { name: 'PhD Biotechnology', duration: 5, totalCredits: 96 },
  ],
  MA: [
    { name: 'M.Sc Mathematics', duration: 2, totalCredits: 80 },
    { name: 'PhD Mathematics', duration: 5, totalCredits: 96 },
  ],
  PH: [
    { name: 'B.Tech Engineering Physics', duration: 4, totalCredits: 160 },
    { name: 'M.Sc Physics', duration: 2, totalCredits: 80 },
    { name: 'PhD Physics', duration: 5, totalCredits: 96 },
  ],
  CY: [
    { name: 'M.Sc Chemistry', duration: 2, totalCredits: 80 },
    { name: 'PhD Chemistry', duration: 5, totalCredits: 96 },
  ],
  HSS: [
    { name: 'MBA', duration: 2, totalCredits: 80 },
    { name: 'PhD Humanities and Social Sciences', duration: 5, totalCredits: 96 },
  ],
  Des: [
    { name: 'B.Des Design', duration: 4, totalCredits: 160 },
    { name: 'M.Des Design', duration: 2, totalCredits: 64 },
    { name: 'PhD Design', duration: 5, totalCredits: 96 },
  ],
  Ene: [
    { name: 'M.Tech Energy', duration: 2, totalCredits: 64 },
    { name: 'PhD Energy', duration: 5, totalCredits: 96 },
  ],
  ES: [
    { name: 'M.Tech Earth Sciences', duration: 2, totalCredits: 64 },
    { name: 'PhD Earth Sciences', duration: 5, totalCredits: 96 },
  ],
  DSAI: [
    { name: 'B.Tech Data Science and Artificial Intelligence', duration: 4, totalCredits: 160 },
    { name: 'M.Tech Data Science and Artificial Intelligence', duration: 2, totalCredits: 64 },
    { name: 'PhD Data Science and Artificial Intelligence', duration: 5, totalCredits: 96 },
  ],
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const deptMap = {};

  for (const d of DEPARTMENTS) {
    const existing = await Department.findOne({ code: d.code });
    if (existing) {
      deptMap[d.code] = existing._id;
      console.log(`  ⏭  Department already exists: ${d.code}`);
    } else {
      const dept = await Department.create(d);
      deptMap[d.code] = dept._id;
      console.log(`  ✅ Created department: ${d.code} — ${d.name}`);
    }
  }

  console.log('\nSeeding Programs...');

  for (const [deptCode, programs] of Object.entries(PROGRAMS_BY_DEPT)) {
    const deptId = deptMap[deptCode];
    if (!deptId) { console.warn(`  ⚠️  No dept found for code ${deptCode}`); continue; }

    for (const p of programs) {
      const existing = await Program.findOne({ name: p.name, department: deptId });
      if (existing) {
        console.log(`  ⏭  Program already exists: ${p.name}`);
      } else {
        await Program.create({ ...p, department: deptId, isActive: true });
        console.log(`  ✅ Created program: ${p.name}`);
      }
    }
  }

  console.log('\n🎉 IITG seed complete.');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
