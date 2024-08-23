import { MongoClient } from "mongodb";

const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/";
const dbName = process.env.DB_NAME || "chatBox";

let client;


async function connect() {
  client = new MongoClient(url);
  await client.connect();
  console.log("Connected to MongoDB");
}

function getDatabase() {
  return client.db(dbName);
}
export { connect, getDatabase };
