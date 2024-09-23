import { NextResponse } from 'next/server';
import openai from '../../../shared/openai';
import { uploadImageToS3 } from '../../../shared/s3Uploader';
import fetch from 'node-fetch';

type SupportedSize = "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";

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

      // Upload to S3 using the shared function
      const s3Url = await uploadImageToS3(imageBuffer);

      const imageId = s3Url.split('/').pop()?.replace('generated-image-', '').replace('.png', '') || '';

      return NextResponse.json({ imageUrl: s3Url, imageId });
    } else {
      throw new Error('Image URL not found in the response');
    }
  } catch (error) {
    console.error('Error generating or uploading image:', error);
    return NextResponse.json({ error: 'Failed to generate or upload image' }, { status: 500 });
  }
}
