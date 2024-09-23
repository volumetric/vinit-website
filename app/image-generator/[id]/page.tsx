'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function SharedImage() {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const params = useParams();
  const imageId = params.id as string;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/image-generator/api/get-image?id=${imageId}`);
        if (!response.ok) throw new Error('Failed to fetch image');
        const data = await response.json();
        setImageUrl(data.imageUrl);
      } catch (err) {
        setError('Failed to load image. It may have been deleted or does not exist.');
      }
    };

    fetchImage();
  }, [imageId]);

  const handleDownload = async () => {
    if (!imageUrl) {
      setError('No image to download.');
      return;
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `shared-image-${imageId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-[family-name:var(--font-geist-sans)]">
      
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-12 text-green-400">Shared Image</h1>
        
        <div className="flex flex-col items-center">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {imageUrl && (
            <div className="space-y-4">
              <img src={imageUrl} alt="Shared image" className="max-w-full h-auto rounded-lg shadow-lg" />
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Download Image
              </button>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}