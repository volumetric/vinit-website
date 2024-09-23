import { NextResponse } from 'next/server';
import openai from '../../../shared/openai';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';

type SupportedSize = "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  const { prompt, model, resolution } = await request.json();

  try {
    console.log('Generating image with OpenAI...');
    const response = await openai.images.generate({
      model: model === 'dalle-3' ? 'dall-e-3' : 'dall-e-2',
      prompt: prompt,
      n: 1,
      size: resolution as SupportedSize,
    });

    const imageUrl = response.data[0].url;

    if (imageUrl) {
      console.log('Image generated successfully. URL:', imageUrl);
      
      // Download the image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      // Upload to S3
      const fileName = `generated-image-${Date.now()}.png`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
        Body: Buffer.from(imageBuffer),
        ContentType: 'image/png',
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      const imageId = fileName.replace('generated-image-', '').replace('.png', '');
      const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      console.log('Image uploaded to S3:', s3Url);

      return NextResponse.json({ imageUrl: s3Url, imageId });
    } else {
      throw new Error('Image URL not found in the response');
    }
  } catch (error) {
    console.error('Error generating or uploading image:', error);
    return NextResponse.json({ error: 'Failed to generate or upload image' }, { status: 500 });
  }
}

// Commenting out email sending function
/*
async function sendEmailInBackground(imageUrl: string, prompt: string, model: string, resolution: string) {
  try {
    console.log('Sending email with image URL...');
    // Send email with the image URL
    const emailResult = await sendEmail(
      { name: model, email: '', message: prompt },
      { imageUrl: imageUrl, resolution: resolution }
    );
    console.log('Email sent result:', emailResult);
  } catch (error) {
    console.error('Error in sendEmailInBackground:', error);
  }
}
*/
