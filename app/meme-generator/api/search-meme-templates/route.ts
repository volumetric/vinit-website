import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/shared/mongodb';

import OpenAI from 'openai';

// Setup OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Vector Index Name for Meme Template Names: "meme_name_vector_index"
// {
//   "fields": [
//     {
//       "type": "vector",
//       "path": "name_embedding",
//       "numDimensions": 1536,
//       "similarity": "dotProduct"
//     }
//   ]
// }

// Function to get the embeddings using the OpenAI API
export async function createEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });
    return response.data[0].embedding;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get('search');

        if (!searchQuery) {
            return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();
        const collection = db.collection("meme-templates");

        const embedding = await createEmbedding(searchQuery);

        const pipeline = [
            {
              '$vectorSearch': {
                'index': 'meme_name_vector_index',
                'path': 'name_embedding',
                'queryVector': embedding,
                'numCandidates': 150,
                'limit': 10
              }
            }, {
              '$project': {
                '_id': 0,
                'name': 1,
                'media': 1,
                'keywords': 1,
                'example': 1,
                'source': 1,
                'score': {
                  '$meta': 'vectorSearchScore'
                }
              }
            }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error searching meme templates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}