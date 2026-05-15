const { MongoClient } = require('mongodb');

async function check() {
  const localUri = 'mongodb://127.0.0.1:27017';
  
  console.log("Checking Local URI...");
  try {
    const client = new MongoClient(localUri);
    await client.connect();
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log("Local Databases:");
    for (let dbInfo of dbs.databases) {
      console.log(`- ${dbInfo.name}`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      for (let coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`  - ${coll.name} (${count} docs)`);
      }
    }
    await client.close();
  } catch (err) {
    console.error("Local URI Error:", err.message);
  }
}

check();
