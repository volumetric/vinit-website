import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/shared/mongodb';
import { createEmbedding } from '@/app/shared/openai';

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