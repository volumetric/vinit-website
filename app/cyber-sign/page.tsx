'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PDFUploader = dynamic(() => import('./components/PDFUploader'), { ssr: false });
const SignatureCanvas = dynamic(() => import('./components/SignatureCanvas'), { ssr: false });
const PDFViewer = dynamic(() => import('./components/PDFViewer'), { ssr: false });

export default function CyberSignPage() {
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);

  const handlePdfUpload = (url: string) => {
    console.log('PDF uploaded, URL:', url);
    setUploadedPdfUrl(url);
  };

  useEffect(() => {
    console.log('Current PDF URL:', uploadedPdfUrl);
  }, [uploadedPdfUrl]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cyber-Sign: eSignature Tool (WIP)</h1>
      <PDFUploader onUpload={handlePdfUpload} />
      <SignatureCanvas />
      <PDFViewer pdfUrl={uploadedPdfUrl} />
    </div>
  );
}