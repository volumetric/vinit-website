'use client';

import React, { useState } from 'react';
import SearchResultsGrid from './components/SearchResultsGrid';
import MemeGallery from './components/MemeGallery';

const MemeGeneratorPage: React.FC = () => {
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);

  const handleMemeSelect = (meme: string) => {
    setSelectedMeme(meme);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Meme Generator</h1>
      <SearchResultsGrid onSelect={handleMemeSelect} selectedMeme={selectedMeme} />
      <div className="border-t-2 pt-8 mt-8">
        <h2 className="text-3xl font-bold mb-6">Meme Gallery</h2>
        <MemeGallery itemsPerPage={20} />
      </div>
    </div>
  );
};

export default MemeGeneratorPage;