const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/seo_dashboard';

let client = null;
let db = null;

async function connectToDatabase() {
  if (db) return { client, db };
  try {
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db();
    console.log(`[MongoDB] Connected successfully to database: ${db.databaseName}`);
    
    // Ensure index on common fields
    try {
      await db.collection('audits').createIndex({ url: 1 });
      await db.collection('audits').createIndex({ created_at: -1 });
      await db.collection('domains').createIndex({ domain_name: 1 }, { unique: true });
      await db.collection('keywords').createIndex({ domain_id: 1 });
      await db.collection('keywords').createIndex({ keyword: 1 });
    } catch (idxErr) {
      console.warn('[MongoDB] Index creation warning:', idxErr.message);
    }
    
    return { client, db };
  } catch (err) {
    console.error('[MongoDB] Connection error:', err.message);
    console.warn('[MongoDB] Server will start, but database operations may fail if MongoDB is offline.');
    return { client: null, db: null };
  }
}

function getDb() {
  return db;
}

const collections = {
  audits: () => (db ? db.collection('audits') : null),
  keywordTracks: () => (db ? db.collection('keyword_tracks') : null),
  domains: () => (db ? db.collection('domains') : null),
  keywords: () => (db ? db.collection('keywords') : null),
  rankHistory: () => (db ? db.collection('rank_history') : null),
  backlinks: () => (db ? db.collection('backlinks') : null),
  trafficHistory: () => (db ? db.collection('traffic_history') : null),
  authorityHistory: () => (db ? db.collection('authority_history') : null),
  visibilityHistory: () => (db ? db.collection('visibility_history') : null),
  competitors: () => (db ? db.collection('competitors') : null),
  seoRecords: () => (db ? db.collection('seo_records') : null),
  gbpRecords: () => (db ? db.collection('gbp_records') : null),
};

module.exports = {
  connectToDatabase,
  getDb,
  collections,
  ObjectId,
};
