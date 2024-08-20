import { MongoClient } from "mongodb";

const url = "mongodb://127.0.0.1:27017/";
const dbName = "chatBox";
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
