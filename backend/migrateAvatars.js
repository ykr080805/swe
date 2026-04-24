/**
 * One-time migration script: reads avatar images from disk,
 * converts them to Base64 data URLs, and saves them into the
 * User.avatar field in MongoDB. Deletes the disk file after success.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');

const AVATARS_DIR = path.join(__dirname, 'uploads', 'avatars');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const files = fs.readdirSync(AVATARS_DIR);
  if (files.length === 0) {
    console.log('No avatar files found on disk. Nothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  for (const filename of files) {
    // filename format: avatar-<mongoId>.<ext>
    const match = filename.match(/^avatar-([a-f0-9]{24})\.(jpg|jpeg|png|gif|webp)$/i);
    if (!match) {
      console.warn(`  ⚠️  Skipping unrecognised file: ${filename}`);
      continue;
    }

    const userId = match[1];
    const ext = match[2].toLowerCase();
    const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    const filePath = path.join(AVATARS_DIR, filename);
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const user = await User.findByIdAndUpdate(userId, { avatar: dataUrl }, { new: true }).select('_id name userId');
    if (!user) {
      console.warn(`  ⚠️  No user found with _id ${userId} (file: ${filename}) — skipping`);
      continue;
    }

    // Delete the file from disk after successful DB write
    fs.unlinkSync(filePath);
    console.log(`  ✅ Migrated avatar for ${user.name} (${user.userId}) — disk file deleted`);
  }

  console.log('\n🎉 Migration complete.');
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
