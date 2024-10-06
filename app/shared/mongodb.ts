// To run this script independently, copy environment variables from .env.local file
process.env.MONGODB_URI = "";
process.env.MONGODB_DB = "vinit-agrawal-website";


import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  let client: MongoClient | null = null;
  let retries = 5;

  while (retries > 0) {
    try {
      if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
      client = await MongoClient.connect(MONGODB_URI);
      break;
    } catch (error) {
      console.error('Failed to connect to MongoDB, retrying...', error);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before retrying
    }
  }

  if (!client) {
    throw new Error('Failed to connect to MongoDB after multiple retries');
  }

  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Initialize the connection when the app starts
connectToDatabase().catch(console.error);