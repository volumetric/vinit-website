import React from 'react';
import EmojiMaker from './components/EmojiMaker';
import EmojiGallery from './components/EmojiGallery';
import { EmojiProvider } from './components/EmojiContext';

const EmojiMakerPage = () => {
  return (
    <EmojiProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Emoji Maker</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <EmojiMaker />
          <EmojiGallery />
        </div>
      </div>
    </EmojiProvider>
  );
};

export default EmojiMakerPage;
