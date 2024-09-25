"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Download } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import Image from 'next/image';
import { useEmojiContext } from './EmojiContext'; // We'll create this context

interface Emoji {
  _id: string;
  prompt: string;
  s3Url: string;
  createdAt: string;
}

const EmojiGallery = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { newEmoji } = useEmojiContext(); // Get the newEmoji from context

  const fetchEmojis = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/emoji-maker/api/fetch-emojis?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch emojis');
      }
      const data = await response.json();
      setEmojis(data.emojis);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching emojis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmojis(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (newEmoji) {
      setEmojis(prevEmojis => [newEmoji, ...prevEmojis.slice(0, 9)]);
    }
  }, [newEmoji]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleImageError = (emojiId: string) => {
    setImageErrors(prev => ({ ...prev, [emojiId]: true }));
    console.error(`Failed to load image for emoji ${emojiId}`);
  };

  const handleDownload = (emojiUrl: string, prompt: string) => {
    fetch(emojiUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        // Use the prompt as the filename, replacing spaces with underscores
        a.download = `emoji_${prompt.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error downloading emoji:', error));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Generated Emojis</h2>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {emojis.map((emoji) => (
              <Card key={emoji._id} className="relative w-full pt-[100%]">
                <div className="absolute inset-0">
                  {!imageErrors[emoji._id] ? (
                    <Image
                      src={emoji.s3Url}
                      alt={emoji.prompt}
                      layout="fill"
                      objectFit="cover"
                      onError={() => handleImageError(emoji._id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Image unavailable</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
                  <p className="text-white text-center text-sm mb-2 px-2">{emoji.prompt}</p>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownload(emoji.s3Url, emoji.prompt)}
                  >
                    <Download className="h-6 w-6 text-white" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex justify-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiGallery;