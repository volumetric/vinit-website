import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface MemeTemplate {
  name: string;
  media: {
    image_url: string;
    video_url: string;
    gif_url: string;
  };
}

interface MemeGalleryProps {
  memes: MemeTemplate[];
  itemsPerPage: number;
}

const MemeGallery: React.FC<MemeGalleryProps> = ({ memes, itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMemes, setCurrentMemes] = useState<MemeTemplate[]>([]);
  const totalPages = Math.ceil(memes.length / itemsPerPage);

  useEffect(() => {
    updateCurrentMemes();
  }, [currentPage, memes]);

  const updateCurrentMemes = () => {
    setIsLoading(true);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentMemes(memes.slice(startIndex, endIndex));
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
    setIsLoading(true);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Meme Gallery</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentMemes.map((meme, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="relative w-full pt-[100%]">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              <Image
                src={`https://vinit-agrawal-website.s3.amazonaws.com/meme-generator${meme.media.image_url || `https://vinit-agrawal-website.s3.amazonaws.com/meme-generator${meme.media.gif_url}`}`}
                alt={meme.name}
                layout="fill"
                objectFit="contain"
                className={`rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
              />
            </div>
            <p className="mt-2 text-center text-sm">{meme.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center items-center space-x-4">
        <button
          onClick={() => changePage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MemeGallery;