const { MongoClient } = require('mongodb');

async function migrate() {
  const localUri = 'mongodb://127.0.0.1:27017/shortvideo';
  const newAtlasUri = 'mongodb+srv://pandiyagokul_db_user:animshort1@short-video.qrccidm.mongodb.net/shortvideo?retryWrites=true&w=majority';

  console.log("Connecting to local MongoDB...");
  const localClient = new MongoClient(localUri);
  await localClient.connect();
  const localDb = localClient.db('shortvideo');

  console.log("Connecting to New MongoDB Atlas...");
  const atlasClient = new MongoClient(newAtlasUri);
  await atlasClient.connect();
  const atlasDb = atlasClient.db('shortvideo');

  const collections = await localDb.listCollections().toArray();
  
  for (let collInfo of collections) {
    const collName = collInfo.name;
    console.log(`\nMigrating collection: ${collName}`);
    
    const docs = await localDb.collection(collName).find({}).toArray();
    console.log(`Found ${docs.length} documents in local ${collName}`);
    
    if (docs.length > 0) {
      await atlasDb.collection(collName).deleteMany({});
      const result = await atlasDb.collection(collName).insertMany(docs);
      console.log(`Inserted ${result.insertedCount} documents into New Atlas ${collName}`);
    } else {
      console.log(`No documents to migrate for ${collName}`);
    }
  }

  console.log("\nMigration completed successfully!");
  await localClient.close();
  await atlasClient.close();
}

migrate().catch(console.error);
