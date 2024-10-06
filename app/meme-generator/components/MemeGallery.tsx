import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import MemeModal from './MemeModal'; // We'll create this component next

interface MemeTemplate {
  name: string;
  url: string;
  image_url: string;
  keywords?: string[];
  year?: number;
  title: string;
  content?: any[]; // Add this to match the sample data structure
  metadata?: {
    category?: string;
    status?: string;
    year?: string;
    origin?: string;
    tags?: string[];
  };
}

interface MemeGalleryProps {
  memes: MemeTemplate[];
  itemsPerPage: number;
  isLoading: boolean;
}

const MemeGallery: React.FC<MemeGalleryProps> = ({ memes, itemsPerPage, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMemes, setCurrentMemes] = useState<MemeTemplate[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<MemeTemplate | null>(null);

  const totalPages = Math.ceil(memes.length / itemsPerPage);

  useEffect(() => {
    updateCurrentMemes();
  }, [currentPage, memes]);

  const updateCurrentMemes = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentMemes(memes.slice(startIndex, endIndex));
  };

  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const openModal = (meme: MemeTemplate) => {
    setSelectedMeme(meme);
  };

  const closeModal = () => {
    setSelectedMeme(null);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first two pages
    pageNumbers.push(1, 2);
    
    // Show ellipsis if there are more than 5 pages and current page is > 3
    if (totalPages > 5 && currentPage > 3) {
      pageNumbers.push('...');
    }
    
    // Show previous, current, and next page
    if (currentPage > 2 && currentPage < totalPages - 1) {
      pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
    }
    
    // Show ellipsis if there are more than 5 pages and current page is < totalPages - 2
    if (totalPages > 5 && currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    
    // Always show last two pages
    if (totalPages > 1) {
      pageNumbers.push(totalPages - 1, totalPages);
    }
    
    // Remove duplicates and sort
    const uniquePageNumbers = Array.from(new Set(pageNumbers)).sort((a, b) => {
      if (a === '...') return 0;
      if (b === '...') return 0;
      return (a as number) - (b as number);
    });

    // Add ellipsis button between last two pages and the next page to the current
    const finalPageNumbers = [];
    for (let i = 0; i < uniquePageNumbers.length; i++) {
      finalPageNumbers.push(uniquePageNumbers[i]);
      if (i < uniquePageNumbers.length - 1) {
        const current = uniquePageNumbers[i];
        const next = uniquePageNumbers[i + 1];
        if (typeof current === 'number' && typeof next === 'number' && next - current > 1) {
          finalPageNumbers.push('...');
        }
      }
    }

    return finalPageNumbers.map((num, index) => (
      <button
        key={index}
        onClick={() => typeof num === 'number' && changePage(num)}
        disabled={num === currentPage || typeof num !== 'number'}
        className={`px-3 py-1 mx-1 rounded ${
          num === currentPage
            ? 'bg-blue-500 text-white'
            : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {num}
      </button>
    ));
  };

  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Meme Gallery</h2>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading memes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Meme Gallery</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentMemes.map((meme, index) => (
          <div key={index} className="relative aspect-square group cursor-pointer" onClick={() => openModal(meme)}>
            <Image
              src={meme.image_url}
              alt={meme.title}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 text-white p-2 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="font-bold text-sm">{meme.title}</p>
              <p className="text-xs">{meme.metadata?.year || 'Year: N/A'}</p>
              <p className="text-xs">{meme.metadata?.origin || 'Origin: N/A'}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center items-center space-x-2">
        <button
          onClick={() => changePage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white text-blue-500 border border-blue-500 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white text-blue-500 border border-blue-500 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      {selectedMeme && (
        <MemeModal meme={selectedMeme} onClose={closeModal} />
      )}
    </div>
  );
};

export default MemeGallery;