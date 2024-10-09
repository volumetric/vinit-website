import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/shared/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const memeTemplatesCollection = db.collection('meme-templates-kym');

    const [memeTemplates, totalCount] = await Promise.all([
      memeTemplatesCollection
        .find({})
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      memeTemplatesCollection.countDocuments({}),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      memeTemplates,
      currentPage: page,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching meme templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}