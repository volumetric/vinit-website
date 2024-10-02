// To run this script independently, copy environment variables from .env.local file
process.env.MONGODB_URI = "";
process.env.MONGODB_DB = "vinit-agrawal-website";
process.env.OPENAI_API_KEY = "";

import { connectToDatabase } from '../../shared/mongodb';
import OpenAI from 'openai';

// Setup OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to get the embeddings using the OpenAI API
export async function createEmbedding(text) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return response.data[0].embedding;
}

async function run() {
    // Connect to the database
    const { db } = await connectToDatabase();
    const collection = db.collection('meme-templates');
    
    try {
        const batchSize = 100; // Can be adjusted as needed
        let processed = 0;
        let hasMore = true;

        while (hasMore) {
            // Get a batch of documents from the collection
            const documents = await collection.find({ 
                $or: [
                    { name_embedding: { $exists: false } },
                    { name_embedding: null }
                ]
            }).limit(batchSize).toArray();

            if (documents.length === 0) {
                hasMore = false;
                break;
            }

            // Process each document in the batch
            for (const doc of documents) {
                if (doc.name) {
                    // Create embedding for the name
                    const embedding = await createEmbedding(doc.name);

                    // Update the document with the new embedding
                    await collection.updateOne(
                        { _id: doc._id },
                        { $set: { name_embedding: embedding } }
                    );

                    console.log(`Updated embedding for: ${doc.name}`);
                    processed++;
                }
            }

            console.log(`Processed ${processed} documents so far`);
        }

        console.log(`Finished processing. Total documents processed: ${processed}`);
    } catch (err) {
        console.error('Error processing documents:', err);
    }
}
run().catch(console.dir);