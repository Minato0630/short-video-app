const { MongoClient } = require('mongodb');

async function check() {
  const uris = [
    'mongodb+srv://admin:Shortvideo123@cluster0.cnaewl6.mongodb.net/?appName=Cluster0',
    'mongodb+srv://admin:shortvideo123@cluster0.cnaewl6.mongodb.net/?appName=Cluster0',
    'mongodb+srv://shortvideo:Shortvideo123@cluster0.cnaewl6.mongodb.net/?appName=Cluster0',
    'mongodb+srv://shortvideo:shortvideo123@cluster0.cnaewl6.mongodb.net/?appName=Cluster0'
  ];
  
  for (let uri of uris) {
    console.log(`Checking URI: ${uri.replace(/:[^:]*@/, ':***@')}`);
    try {
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
      await client.connect();
      console.log("SUCCESS!");
      await client.close();
      return;
    } catch (err) {
      console.error("Error:", err.message);
    }
  }
}

check();
