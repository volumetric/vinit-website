import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import MemeModal from './MemeModal';
import axios from 'axios';

interface MemeTemplate {
  _id?: { $oid: string };
  title?: string;
  url?: string;
  kym_url?: string;
  image_url?: string; 
  image_alt_text?: string;
  image_title?: string;
  added_on?: {
    date: string;
    user: string;
  };
  content?: Array<{
    heading: string;
    text: string[];
    image_url: string[];
    yt_videoid: string[];
    a_urls: string[];
  }>;
  external_reference_urls?: string[];
  image?: {
    image_url: string;
    image_alt_text: string;
    image_title: string;
  };
  last_changed_on?: {
    date: string;
    user: string;
  };
  metadata?: {
    category: string;
    status: string;
    types: string[];
    year: string;
    origin: string;
    tags: string[];
  };
  parent?: {
    name: string;
    url: string;
  };
  stats?: {
    fav_count: { $numberInt: string };
    views_count: { $numberInt: string };
    videos_count: { $numberInt: string };
    photos_count: { $numberInt: string };
    comments_count: { $numberInt: string };
  };
  created_at?: {
    $date: { $numberLong: string };
  };
  updated_at?: {
    $date: { $numberLong: string };
  };
}

interface PaginatedResponse {
  memeTemplates: MemeTemplate[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

interface MemeGalleryProps {
  itemsPerPage: number;
}

const MemeGallery: React.FC<MemeGalleryProps> = ({ itemsPerPage }) => {
  const [memes, setMemes] = useState<MemeTemplate[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeme, setSelectedMeme] = useState<MemeTemplate | null>(null);

  useEffect(() => {
    fetchMemes(currentPage);
  }, [currentPage]);

  const fetchMemes = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get<PaginatedResponse>(`/meme-generator/api/meme-templates?page=${page}`);
      setMemes(response.data.memeTemplates);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching meme templates:', error);
    } finally {
      setIsLoading(false);
    }
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
        {memes.map((meme, index) => (
          <div key={index} className="relative aspect-square group cursor-pointer" onClick={() => openModal(meme)}>
            <Image
              src={meme.image_url ?? ''}
              alt={meme.title ?? ''}
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