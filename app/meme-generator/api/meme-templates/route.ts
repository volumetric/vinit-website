import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/shared/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const memeTemplates = await db.collection('meme-templates-kym').find({}).toArray();
    return NextResponse.json(memeTemplates);
  } catch (error) {
    console.error('Error fetching meme templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}