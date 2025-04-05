"use client";

import { useState, useRef } from "react";
import ImageUploader from "./components/ImageUploader";
import FaceCanvas from "./components/FaceCanvas";
import ExpressionControls from "./components/ExpressionControls";

export default function AnimeCharacterPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentExpression, setCurrentExpression] = useState<string>("neutral");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
  };

  const handleExpressionChange = (expression: string) => {
    setCurrentExpression(expression);
  };

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    // Implementation will be added in FaceCanvas component
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Anime Character Face Animator
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {!uploadedImage ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <div className="space-y-6">
              <FaceCanvas
                ref={canvasRef}
                image={uploadedImage}
                expression={currentExpression}
                isSpeaking={isSpeaking}
              />
              <ExpressionControls
                onExpressionChange={handleExpressionChange}
                onSpeak={handleSpeak}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
