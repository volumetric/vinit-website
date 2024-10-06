'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MemePromptForm from './components/MemePromptForm';
import SearchResultsGrid from './components/SearchResultsGrid';
import MemeActions from './components/MemeActions';
import MemeGallery from './components/MemeGallery';

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

interface OldMemeTemplate {
  name: string;
  media: {
    image_url: string;
    video_url: string;
    gif_url: string;
  };
  keywords: string[];
  source: string;
}

export default function MemeGeneratorPage() {
  const [searchResults, setSearchResults] = useState<OldMemeTemplate[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<string | null>(null);
  const [memeTemplates, setMemeTemplates] = useState<MemeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemeTemplates();
  }, []);

  const fetchMemeTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('meme-generator/api/meme-templates');
      if (response.ok) {
        const data = await response.json();
        setMemeTemplates(data);
      } else {
        console.error('Failed to fetch meme templates');
      }
    } catch (error) {
      console.error('Error fetching meme templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemeGeneration = useCallback(async (prompt: string) => {
    try {
      const response = await fetch(`/meme-generator/api/search-meme-templates?search=${encodeURIComponent(prompt)}`);
      if (response.ok) {
        const data: OldMemeTemplate[] = await response.json();
        setSearchResults(data.slice(0, 10)); // Limit to top 10 results
        setSelectedMeme(null);
      } else {
        console.error('Failed to search meme templates');
      }
    } catch (error) {
      console.error('Error searching meme templates:', error);
    }
  }, []);

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
      <div className="mb-12">
        <MemePromptForm onSubmit={handleMemeGeneration} />
        {searchResults.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-8 mb-4">Search Results</h2>
            <SearchResultsGrid 
              results={searchResults} 
              onSelect={handleMemeSelect} 
              selectedMeme={selectedMeme} 
            />
          </>
        )}
        {selectedMeme && <MemeActions onUpscale={handleUpscale} onVary={handleVary} />}
      </div>
      
      <div className="border-t-2 pt-8">
        <h2 className="text-3xl font-bold mb-6">Meme Gallery</h2>
        <MemeGallery memes={memeTemplates} itemsPerPage={20} isLoading={isLoading} />
      </div>
    </div>
  );
}