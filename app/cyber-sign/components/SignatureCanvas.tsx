'use client';

import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad: React.FC = () => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [name, setName] = useState('');
  const [canvasWidth, setCanvasWidth] = useState(500);

  useEffect(() => {
    const updateCanvasWidth = () => {
      const container = document.querySelector('.signature-container');
      if (container) {
        setCanvasWidth(container.clientWidth);
      }
    };

    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);

    return () => window.removeEventListener('resize', updateCanvasWidth);
  }, []);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const save = () => {
    if (sigCanvas.current) {
      const signatureData = sigCanvas.current.toDataURL();
      console.log('Signature saved:', { name, signatureData });
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Create Signature</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="mb-2 p-2 border rounded w-full"
      />
      {/* IMPORTANT: Keep the background color white for visibility */}
      <div className="signature-container border rounded p-2 mb-2" style={{ touchAction: 'none', backgroundColor: 'white' }}>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: canvasWidth,
            height: 200,
            className: 'signature-canvas',
            style: { 
              width: '100%', 
              height: '200px',
              backgroundColor: 'white', // Ensure canvas background is white
            }
          }}
          backgroundColor="white"
          penColor="black"
          velocityFilterWeight={0.7}
        />
      </div>
      <button onClick={clear} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">
        Clear
      </button>
      <button onClick={save} className="bg-green-500 text-white px-4 py-2 rounded">
        Save Signature
      </button>
    </div>
  );
};

export default SignaturePad;