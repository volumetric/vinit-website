"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Loader2, Download, Heart } from 'lucide-react';

// Debug flag
const DEBUG = true;

const debugLog = (...args: unknown[]) => {
  if (DEBUG) {
    console.log('%cDebug:', 'color: #bada55; font-weight: bold', ...args);
  }
};

const EmojiMaker = () => {
  const [prompt, setPrompt] = useState('a cute cat floating in space');
  const [generatedEmoji, setGeneratedEmoji] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageError, setImageError] = useState(false);

  const generateEmoji = async () => {
    debugLog('Generating emoji with prompt:', prompt);
    setIsGenerating(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

      const response = await fetch('/emoji-maker/api/generate-emoji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to generate emoji');
      }

      const data = await response.json();
      debugLog('Emoji generated:', data.emojiUrl);
      setGeneratedEmoji(Array.isArray(data.emojiUrl) ? data.emojiUrl[0] : data.emojiUrl);
    } catch (error) {
      console.error('Error generating emoji:', error);
      debugLog('Error generating emoji:', error);
      // You might want to set an error state here and display it to the user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedEmoji) {
      window.open(generatedEmoji, '_blank');
    }
  };

  const handleImageError = () => {
    console.error('Failed to load image');
    setImageError(true);
  };

  return (
    <Card className="p-6 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Emoji Maker</h2>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Enter your prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={generateEmoji} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="animate-spin" /> : 'Generate'}
        </Button>
      </div>
      <div className="relative w-32 h-32 mx-auto">
        {generatedEmoji && !imageError ? (
          <>
            <Image 
              src={generatedEmoji} 
              alt="Generated Emoji" 
              layout="fill" 
              objectFit="cover" 
              onError={handleImageError}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
              <Button variant="ghost" size="icon" onClick={handleDownload}>
                <Download className="h-6 w-6 text-white" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="h-6 w-6 text-white" />
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-gray-200 text-gray-400">
            {isGenerating ? <Loader2 className="animate-spin" /> : (imageError ? 'Failed to load image' : 'No emoji yet')}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EmojiMaker;