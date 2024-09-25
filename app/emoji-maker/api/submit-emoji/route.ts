import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/shared/mongodb';
import { uploadImageToS3 } from '@/app/shared/s3Uploader';

export async function POST(req: Request) {
  try {
    const { prompt, imageUrl } = await req.json();

    console.log('Submitting emoji:', { prompt, imageUrl });

    let s3Url: string;
    try {
      // Upload image to S3
      console.log('Uploading image to S3...');
      console.log('Fetching image from URL:', imageUrl);
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      console.log('Image fetched, uploading to S3');
      s3Url = await uploadImageToS3(imageBuffer, 'image/png', 'emoji-maker');
      console.log('S3 upload successful, URL:', s3Url);
    } catch (s3Error) {
      console.error('Error uploading to S3:', s3Error);
      return NextResponse.json({ success: false, error: 'Failed to upload image to S3' }, { status: 500 });
    }

    try {
      // Connect to MongoDB
      console.log('Connecting to MongoDB...');
      const { db } = await connectToDatabase();
      console.log('Connected to MongoDB successfully');

      // Save emoji data to MongoDB
      console.log('Saving emoji data to MongoDB...');
      const result = await db.collection('emoji-maker').insertOne({
        prompt,
        originalUrl: imageUrl,
        s3Url,
        createdAt: new Date(),
      });
      console.log('Emoji data saved successfully. Inserted ID:', result.insertedId);

      return NextResponse.json({ success: true, emojiId: result.insertedId, s3Url });
    } catch (dbError) {
      console.error('Error saving to MongoDB:', dbError);
      return NextResponse.json({ success: false, error: 'Failed to save emoji data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in submit-emoji route:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit emoji' }, { status: 500 });
  }
}