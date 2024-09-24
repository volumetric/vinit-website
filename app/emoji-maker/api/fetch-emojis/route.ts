import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/shared/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const { db } = await connectToDatabase();
    const skip = (page - 1) * limit;

    const emojis = await db.collection('emoji-maker')
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('emoji-maker').countDocuments();

    return NextResponse.json({
      emojis,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEmojis: total
    });
  } catch (error) {
    console.error('Error fetching emojis:', error);
    return NextResponse.json({ error: 'Failed to fetch emojis' }, { status: 500 });
  }
}