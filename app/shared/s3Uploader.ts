import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function uploadImageToS3(imageBuffer: ArrayBuffer, contentType: string = 'image/png', path: string = ''): Promise<string> {
  const fileName = `${path}/${Date.now()}.png`;
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    Body: Buffer.from(imageBuffer),
    ContentType: contentType,
  };

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);

  const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  console.log('Image uploaded to S3:', s3Url);

  return s3Url;
}

export async function uploadFileToS3(file: Buffer, fileName: string, contentType: string, path: string = ''): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('S3_BUCKET_NAME is not defined in environment variables');
  }

  const key = `${path}/${Date.now()}-${fileName}`;
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);

  const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  console.log('File uploaded to S3:', s3Url);

  return s3Url;
}