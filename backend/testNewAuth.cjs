const { MongoClient } = require('mongodb');

async function check() {
  const uri = 'mongodb+srv://pandiyagokul_db_user:animshort1@short-video.qrccidm.mongodb.net/';
  
  console.log(`Checking URI: ${uri.replace(/:[^:]*@/, ':***@')}`);
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log("SUCCESS!");
    await client.close();
  } catch (err) {
    console.error("Error:", err.message);
  }
}

check();
