import React, { useRef, useEffect } from 'react';
import Image from 'next/image';

interface MemeModalProps {
  meme: any; // Use the MemeTemplate interface from MemeGallery.tsx
  onClose: () => void;
}

const MemeModal: React.FC<MemeModalProps> = ({ meme, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div ref={modalRef} className="bg-gray-950 text-gray-200 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-2xl font-bold truncate">{meme.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                <Image
                  src={meme.image_url || meme.image?.image_url}
                  alt={meme.title}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="md:w-1/2 space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Meme Info</h3>
                <p><span className="font-medium">Category:</span> {meme.metadata?.category || 'N/A'}</p>
                <p><span className="font-medium">Status:</span> {meme.metadata?.status || 'N/A'}</p>
                <p><span className="font-medium">Year:</span> {meme.metadata?.year || 'N/A'}</p>
                <p><span className="font-medium">Origin:</span> {meme.metadata?.origin || 'N/A'}</p>
                <p><span className="font-medium">Types:</span> {meme.metadata?.types?.join(', ') || 'N/A'}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Stats</h3>
                <p><span className="font-medium">Views:</span> {meme.stats?.views_count}</p>
                <p><span className="font-medium">Favorites:</span> {meme.stats?.fav_count}</p>
                <p><span className="font-medium">Videos:</span> {meme.stats?.videos_count}</p>
                <p><span className="font-medium">Photos:</span> {meme.stats?.photos_count}</p>
                <p><span className="font-medium">Comments:</span> {meme.stats?.comments_count}</p>
              </div>
            </div>
          </div>
          {meme.metadata?.tags && (
            <div className="bg-gray-900 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {meme.metadata.tags.map((tag: string, index: number) => (
                  <span key={index} className="bg-gray-800 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {meme.content && (
            <div className="bg-gray-900 rounded-lg p-4 shadow">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Meme Details</h3>
              {meme.content.map((section: any, index: number) => (
                <div key={index} className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-200 mb-2">{section.heading}</h4>
                  {section.text.map((paragraph: string, pIndex: number) => (
                    <p key={pIndex} className="text-gray-400 mb-2">{paragraph}</p>
                  ))}
                  {section.image_url && section.image_url.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {section.image_url.map((url: string, imgIndex: number) => (
                        <Image key={imgIndex} src={url} alt={`Image ${imgIndex + 1}`} width={200} height={200} objectFit="cover" className="rounded" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="bg-gray-900 rounded-lg p-4 shadow">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Additional Information</h3>
            <p><span className="font-medium">Added on:</span> {new Date(meme.added_on?.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Added by:</span> {meme.added_on?.user}</p>
            <p><span className="font-medium">Last changed:</span> {new Date(meme.last_changed_on?.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Changed by:</span> {meme.last_changed_on?.user}</p>
            {meme.parent && (
              <p><span className="font-medium">Parent:</span> <a href={meme.parent.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-100">{meme.parent.name}</a></p>
            )}
          </div>
          <div className="flex justify-between items-center">
            <a 
              href={meme.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              View Source
            </a>
            {meme.kym_url && (
              <a 
                href={meme.kym_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                View on Know Your Meme
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeModal;