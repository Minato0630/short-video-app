const { MongoClient } = require('mongodb');

async function migrate() {
  const localUri = 'mongodb://127.0.0.1:27017/shortvideo';
  // Let's use the one in .env that actually works
  const atlasUri = 'mongodb+srv://short-video-app-db:Shortvideo123@short-video-app.xud2kk4.mongodb.net/shortvideo?retryWrites=true&w=majority';

  console.log("Connecting to local MongoDB...");
  const localClient = new MongoClient(localUri);
  await localClient.connect();
  const localDb = localClient.db('shortvideo');

  console.log("Connecting to MongoDB Atlas...");
  const atlasClient = new MongoClient(atlasUri);
  await atlasClient.connect();
  const atlasDb = atlasClient.db('shortvideo');

  const collections = await localDb.listCollections().toArray();
  
  for (let collInfo of collections) {
    const collName = collInfo.name;
    console.log(`\nMigrating collection: ${collName}`);
    
    const docs = await localDb.collection(collName).find({}).toArray();
    console.log(`Found ${docs.length} documents in local ${collName}`);
    
    if (docs.length > 0) {
      // Clear existing data in Atlas for this collection to avoid duplicates
      await atlasDb.collection(collName).deleteMany({});
      
      // Insert data into Atlas
      const result = await atlasDb.collection(collName).insertMany(docs);
      console.log(`Inserted ${result.insertedCount} documents into Atlas ${collName}`);
    } else {
      console.log(`No documents to migrate for ${collName}`);
    }
  }

  console.log("\nMigration completed successfully!");
  await localClient.close();
  await atlasClient.close();
}

migrate().catch(console.error);
