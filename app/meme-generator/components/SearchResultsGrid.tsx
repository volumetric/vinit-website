import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import MemePromptForm from './MemePromptForm';

interface SearchResult {
  name: string;
  media: {
    image_url: string;
    video_url: string;
    gif_url: string;
  };
  keywords: string[];
  source: string;
}

interface SearchResultsGridProps {
  onSelect: (meme: string) => void;
  selectedMeme: string | null;
}

const SearchResultsGrid: React.FC<SearchResultsGridProps> = ({ onSelect, selectedMeme }) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = "https://vinit-agrawal-website.s3.amazonaws.com/meme-generator";

  const handleSearch = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get('/meme-generator/api/search-meme-templates', {
        params: { search: prompt }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching memes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <MemePromptForm onSubmit={handleSearch} />
      {isLoading ? (
        <div className="text-center mt-4">
          <p>Searching for memes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {results.map((result, index) => {
            const imageUrl = result.media.image_url || result.media.gif_url || result.media.video_url;
            const fullImageUrl = `${baseUrl}${imageUrl}`;

            return (
              <div key={index} className="relative aspect-square">
                <Image
                  src={fullImageUrl}
                  alt={result.name}
                  layout="fill"
                  objectFit="cover"
                  className={`cursor-pointer ${selectedMeme === fullImageUrl ? 'border-4 border-blue-500' : ''}`}
                  onClick={() => onSelect(fullImageUrl)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <p className="font-bold text-sm">{result.name}</p>
                  <p className="text-xs mt-1">{result.keywords.join(', ')}</p>
                  <a 
                    href={result.source} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-300 hover:text-blue-100"
                  >
                    Source
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResultsGrid;