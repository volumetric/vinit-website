"use client";

import { useState } from "react";

interface ExpressionControlsProps {
  onExpressionChange: (expression: string) => void;
  onSpeak: (text: string) => void;
}

const expressions = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "angry", label: "Angry", emoji: "😠" },
  { id: "surprised", label: "Surprised", emoji: "😮" },
  { id: "neutral", label: "Neutral", emoji: "😐" },
];

export default function ExpressionControls({
  onExpressionChange,
  onSpeak,
}: ExpressionControlsProps) {
  const [speakText, setSpeakText] = useState("");

  const handleSpeak = () => {
    if (speakText.trim()) {
      onSpeak(speakText);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">Expressions</h3>
        <div className="flex flex-wrap gap-2">
          {expressions.map((expr) => (
            <button
              key={expr.id}
              onClick={() => onExpressionChange(expr.id)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm
                hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="mr-2">{expr.emoji}</span>
              {expr.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">Lip Sync</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={speakText}
            onChange={(e) => setSpeakText(e.target.value)}
            placeholder="Enter text to speak..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSpeak}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm
              hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Speak
          </button>
        </div>
      </div>
    </div>
  );
}
