"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Emoji {
  _id: string;
  prompt: string;
  s3Url: string;
  createdAt: string;
}

interface EmojiContextType {
  newEmoji: Emoji | null;
  addEmoji: (emoji: Emoji) => void;
}

const EmojiContext = createContext<EmojiContextType | undefined>(undefined);

export const useEmojiContext = () => {
  const context = useContext(EmojiContext);
  if (!context) {
    throw new Error('useEmojiContext must be used within an EmojiProvider');
  }
  return context;
};

interface EmojiProviderProps {
  children: ReactNode;
}

export const EmojiProvider: React.FC<EmojiProviderProps> = ({ children }) => {
  const [newEmoji, setNewEmoji] = useState<Emoji | null>(null);

  const addEmoji = (emoji: Emoji) => {
    setNewEmoji(emoji);
  };

  return (
    <EmojiContext.Provider value={{ newEmoji, addEmoji }}>
      {children}
    </EmojiContext.Provider>
  );
};