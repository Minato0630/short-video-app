const { MongoClient } = require('mongodb');

async function check() {
  const uri = 'mongodb+srv://gokulan:gokul123@cluster0.cnaewl6.mongodb.net/';
  
  console.log(`Checking URI: ${uri.replace(/:[^:]*@/, ':***@')}`);
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log("SUCCESS!");
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log("Databases:");
    for (let dbInfo of dbs.databases) {
      console.log(`- ${dbInfo.name}`);
    }
    await client.close();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

check();
