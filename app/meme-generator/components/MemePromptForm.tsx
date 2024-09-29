import React, { useState } from 'react';

interface MemePromptFormProps {
  onSubmit: (prompt: string) => void;
}

const MemePromptForm: React.FC<MemePromptFormProps> = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter meme prompt or situation"
        className="w-full p-2 border border-gray-300 rounded"
      />
      <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        Generate Memes
      </button>
    </form>
  );
};

export default MemePromptForm;