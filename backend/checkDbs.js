const { MongoClient } = require('mongodb');

async function check() {
  const uri1 = 'mongodb+srv://admin:Shortvideo123@cluster0.cnaewl6.mongodb.net/';
  const uri2 = 'mongodb+srv://short-video-app-db:Shortvideo123@short-video-app.xud2kk4.mongodb.net/short-video-app-db';

  console.log("Checking URI 1...");
  try {
    const client1 = new MongoClient(uri1);
    await client1.connect();
    const adminDb = client1.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log("URI 1 Databases:");
    for (let dbInfo of dbs.databases) {
      console.log(`- ${dbInfo.name}`);
      const db = client1.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      for (let coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`  - ${coll.name} (${count} docs)`);
      }
    }
    await client1.close();
  } catch (err) {
    console.error("URI 1 Error:", err.message);
  }

  console.log("\nChecking URI 2...");
  try {
    const client2 = new MongoClient(uri2);
    await client2.connect();
    const adminDb = client2.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log("URI 2 Databases:");
    for (let dbInfo of dbs.databases) {
      console.log(`- ${dbInfo.name}`);
      const db = client2.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      for (let coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`  - ${coll.name} (${count} docs)`);
      }
    }
    await client2.close();
  } catch (err) {
    console.error("URI 2 Error:", err.message);
  }
}

check();
