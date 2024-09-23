'use server';

import nodemailer from 'nodemailer';

export async function sendEmail(
  formData: { name: string; email: string; message: string },
  imageData?: { imageUrl: string; resolution?: string }
) {
  console.log('Starting sendEmail function');
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  });

  try {
    console.log('Preparing mail options');
    const mailOptions: nodemailer.SendMailOptions = {
      from: '"Asimov AI Contact Form" <vinit@hellotars.com>',
      to: "vinit@hellotars.com",
      subject: imageData ? "New Image Generation" : "New Contact Form Submission",
      text: imageData
        ? `
          Prompt: ${formData.message}
          Model: ${formData.name}
          Resolution: ${imageData.resolution}
          Image URL: ${imageData.imageUrl}
        `
        : `
          Name: ${formData.name}
          Email: ${formData.email}
          Message: ${formData.message}
        `,
      html: imageData
        ? `
          <h1>New Image Generation</h1>
          <p><strong>Prompt:</strong> ${formData.message}</p>
          <p><strong>Model:</strong> ${formData.name}</p>
          <p><strong>Resolution:</strong> ${imageData.resolution}</p>
          <p><strong>Image URL:</strong> <a href="${imageData.imageUrl}">${imageData.imageUrl}</a></p>
          <img src="${imageData.imageUrl}" alt="Generated Image" style="max-width: 100%;">
        `
        : `
          <h1>New Contact Form Submission</h1>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Message:</strong> ${formData.message}</p>
        `,
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    return { success: true } as const;
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message } as const;
    }
    return { success: false, error: 'An unknown error occurred' } as const;
  }
}