import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/shared/mongodb';
import { uploadImageToS3 } from '@/app/shared/s3Uploader';

export async function POST(req: Request) {
  try {
    const { prompt, imageUrl } = await req.json();

    console.log('Submitting emoji:', { prompt, imageUrl });

    // Upload image to S3
    console.log('Uploading image to S3...');
    const s3Url = await uploadImageToS3(imageUrl);
    console.log('Image uploaded successfully. S3 URL:', s3Url);

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const { db } = await connectToDatabase();
    console.log('Connected to MongoDB successfully');

    // Save emoji data to MongoDB
    console.log('Saving emoji data to MongoDB...');
    const result = await db.collection('emojis').insertOne({
      prompt,
      s3Url,
      createdAt: new Date(),
    });
    console.log('Emoji data saved successfully. Inserted ID:', result.insertedId);

    return NextResponse.json({ success: true, emojiId: result.insertedId, s3Url });
  } catch (error) {
    console.error('Error in submit-emoji route:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit emoji' }, { status: 500 });
  }
}