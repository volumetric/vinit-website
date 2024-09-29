import React from 'react';

interface MemeGridProps {
  memes: string[];
  onSelect: (meme: string) => void;
  selectedMeme: string | null;
}

const MemeGrid: React.FC<MemeGridProps> = ({ memes, onSelect, selectedMeme }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {memes.map((meme, index) => (
        <div
          key={index}
          className={`cursor-pointer border-4 ${
            meme === selectedMeme ? 'border-blue-500' : 'border-transparent'
          }`}
          onClick={() => onSelect(meme)}
        >
          <img src={meme} alt={`Generated meme ${index + 1}`} className="w-full h-auto" />
        </div>
      ))}
    </div>
  );
};

export default MemeGrid;