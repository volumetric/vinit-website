import React from 'react';

interface MemeActionsProps {
  onUpscale: () => void;
  onVary: () => void;
}

const MemeActions: React.FC<MemeActionsProps> = ({ onUpscale, onVary }) => {
  return (
    <div className="flex space-x-4">
      <button onClick={onUpscale} className="bg-green-500 text-white px-4 py-2 rounded">
        Upscale
      </button>
      <button onClick={onVary} className="bg-purple-500 text-white px-4 py-2 rounded">
        Vary
      </button>
    </div>
  );
};

export default MemeActions;