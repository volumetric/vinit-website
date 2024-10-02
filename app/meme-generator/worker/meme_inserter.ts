// #TOUSE Need to set these env variables in this script before running it
// process.env.MONGODB_URI;
// process.env.MONGODB_DB;

import { connectToDatabase } from '../../shared/mongodb';
import fs from 'fs/promises';
import path from 'path';

interface MemeTemplate {
  name: string;
  source: string | null;
  keywords: (string | null)[];
  text: any[];
  example: string[];
  overlay: any[];
  media: {
    image_url: string;
    video_url: string;
    gif_url: string;
  };
}

async function insertMemeTemplates() {
  try {
    // Read the JSON file
    const jsonPath = path.join(__dirname, 'meme-templates.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const memeTemplates: MemeTemplate[] = JSON.parse(jsonData);

    // Connect to the database
    const { db } = await connectToDatabase();
    const collection = db.collection('meme-templates');

    // Insert the meme templates
    const result = await collection.insertMany(memeTemplates);

    console.log(`Successfully inserted ${result.insertedCount} meme templates.`);
  } catch (error) {
    console.error('Error inserting meme templates:', error);
  }
}

// Run the insertion function
insertMemeTemplates();