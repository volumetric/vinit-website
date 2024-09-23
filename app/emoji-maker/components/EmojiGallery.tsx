import React from 'react';
import { Card } from '../../../components/ui/card';
import { Download, Heart } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const EmojiGallery = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Generated Emojis</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* TODO: Replace with actual generated emojis */}
        {[...Array(12)].map((_, index) => (
          <Card key={index} className="relative w-full pt-[100%]">
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Emoji {index + 1}</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
              <Button variant="ghost" size="icon">
                <Download className="h-6 w-6 text-white" />
              </Button>
              <Button variant="ghost" size="icon">
                <Heart className="h-6 w-6 text-white" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmojiGallery;