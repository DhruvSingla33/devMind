/**
 * Reset content collections for the new data model where:
 *   - a Page belongs directly to a Textbook (book), not a Chapter
 *   - a quiz Question belongs to a Page
 *   - a Chapter is just a labelled page-range on the book (startPage/endPage)
 *
 * This DROPS the `pages`, `sections` and `questions` collections. Dropping (vs.
 * deleteMany) is required so the OLD indexes — notably the unique index on
 * { chapterId, pageNumber } — are removed too; Mongoose recreates the new
 * indexes on next app/seed start. Existing chapter page-ranges are cleared so
 * you re-enter them against the new pages.
 *
 * Usage:
 *   node scripts/reset-content.mjs           (drop + clear ranges)
 *   node scripts/reset-content.mjs --dry-run (show what would happen)
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const dryRun = process.argv.includes('--dry-run');

async function dropIfExists(db, name) {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length === 0) {
    console.log(`   • ${name}: not present, skipping`);
    return;
  }
  if (dryRun) {
    console.log(`   • ${name}: WOULD drop`);
    return;
  }
  await db.dropCollection(name);
  console.log(`   • ${name}: dropped`);
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aarambh_db';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  console.log(`🔌 Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  console.log(dryRun ? '🧪 DRY RUN — nothing will be changed.\n' : '');

  console.log('🗑️  Dropping content collections (removes old indexes too):');
  await dropIfExists(db, 'pages');
  await dropIfExists(db, 'sections');
  await dropIfExists(db, 'questions');

  console.log('\n♻️  Clearing chapter page-ranges (startPage/endPage):');
  const chapters = db.collection('chapters');
  if ((await db.listCollections({ name: 'chapters' }).toArray()).length === 0) {
    console.log('   • chapters: not present, skipping');
  } else if (dryRun) {
    const count = await chapters.countDocuments({});
    console.log(`   • chapters: WOULD clear ranges on ${count} doc(s)`);
  } else {
    const res = await chapters.updateMany({}, { $set: { startPage: null, endPage: null } });
    console.log(`   • chapters: cleared ranges on ${res.modifiedCount} doc(s)`);
  }

  console.log('\n✅ Done. Restart the app (or run `npm run seed`) to rebuild indexes.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('💥 Reset failed:', err.message);
  process.exit(1);
});
