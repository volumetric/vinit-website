'use client';

import React, { useState } from 'react';
import MemePromptForm from './components/MemePromptForm';
import MemeGrid from './components/MemeGrid';
import MemeActions from './components/MemeActions';

export default function MemeGeneratorPage() {
  const [generatedMemes, setGeneratedMemes] = useState<string[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);

  const handleMemeGeneration = async (prompt: string) => {
    // TODO: Implement API call to generate memes
    const mockMemes = [
      'https://via.placeholder.com/300x300?text=Meme+1',
      'https://via.placeholder.com/300x300?text=Meme+2',
      'https://via.placeholder.com/300x300?text=Meme+3',
      'https://via.placeholder.com/300x300?text=Meme+4',
    ];
    setGeneratedMemes(mockMemes);
    setSelectedMeme(null);
  };

  const handleMemeSelect = (meme: string) => {
    setSelectedMeme(meme);
  };

  const handleUpscale = async () => {
    if (selectedMeme) {
      // TODO: Implement API call to upscale the selected meme
      console.log('Upscaling meme:', selectedMeme);
    }
  };

  const handleVary = async () => {
    if (selectedMeme) {
      // TODO: Implement API call to vary the selected meme
      console.log('Varying meme:', selectedMeme);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Meme Generator</h1>
      <MemePromptForm onSubmit={handleMemeGeneration} />
      <MemeGrid memes={generatedMemes} onSelect={handleMemeSelect} selectedMeme={selectedMeme} />
      {selectedMeme && <MemeActions onUpscale={handleUpscale} onVary={handleVary} />}
    </div>
  );
}