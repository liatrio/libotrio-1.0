const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

if (!process.env.MONGODB_URI) {
  console.log('Error: Specify MONGODB_URI in environment');
  process.exit(1);
}

const db_url = process.env.MONGODB_URI;

console.log('Connecting to mongo instance: ' + db_url);

// Connect to the DB
MongoClient.connect(db_url, { useNewUrlParser: true }, function (err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  client.close();

});
