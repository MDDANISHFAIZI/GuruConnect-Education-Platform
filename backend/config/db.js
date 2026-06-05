import mongoose from 'mongoose';

const runMigrations = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('studentenrollments')) {
      console.log('[MIGRATION] Found old collection: studentenrollments');
      const studentenrollments = db.collection('studentenrollments');
      const enrollments = db.collection('enrollments');

      const count = await studentenrollments.countDocuments();
      if (count > 0) {
        console.log(`[MIGRATION] Migrating ${count} records from studentenrollments to enrollments...`);
        const cursor = studentenrollments.find({});
        let migratedCount = 0;
        while (await cursor.hasNext()) {
          const doc = await cursor.next();
          const exists = await enrollments.findOne({ _id: doc._id });
          if (!exists) {
            await enrollments.insertOne(doc);
            migratedCount++;
          }
        }
        console.log(`[MIGRATION] Migration complete. Migrated ${migratedCount} new records. Keeping studentenrollments for fallback safety.`);
      } else {
        console.log('[MIGRATION] Old collection studentenrollments is empty. No records to migrate.');
      }
    } else {
      console.log('[MIGRATION] Old collection studentenrollments not found. Skipping migration.');
    }
  } catch (err) {
    console.error('[MIGRATION ERROR]', err);
  }
};

const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/guruconnect';
    // Log dynamic info to help debugging without exposing passwords
    const connectionLogString = dbUrl.startsWith('mongodb+srv://') 
      ? 'MongoDB Atlas Cluster' 
      : dbUrl;
    console.log(`Attempting to connect to: ${connectionLogString}`);
    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Run migration
    await runMigrations();
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
