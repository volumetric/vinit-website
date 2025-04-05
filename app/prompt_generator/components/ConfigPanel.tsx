"use client";

import { useState } from "react";

interface ConfigPanelProps {
  onGenerate: (config: any) => void;
}

const presetOptions = [
  { id: "python-debugger", label: "Python debugger", icon: "🐍" },
  { id: "translation", label: "Translation", icon: "🌐" },
  { id: "meeting-takeaways", label: "Meeting takeaways", icon: "📝" },
  { id: "writing-polisher", label: "Writing polisher", icon: "✍️" },
  { id: "professional-analyst", label: "Professional analyst", icon: "👔" },
  { id: "excel-expert", label: "Excel formula expert", icon: "📊" },
  { id: "travel-planning", label: "Travel planning", icon: "✈️" },
  { id: "sql-sorcerer", label: "SQL sorcerer", icon: "🔍" },
  { id: "git-gud", label: "Git gud", icon: "🔄" },
];

export default function ConfigPanel({ onGenerate }: ConfigPanelProps) {
  const [instructions, setInstructions] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      instructions,
      selectedPreset,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Try it
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {presetOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedPreset(option.id)}
              className={`flex items-center p-3 rounded-lg border transition-colors ${
                selectedPreset === option.id
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400"
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 dark:bg-gray-800"
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              <span
                className={`text-sm ${
                  selectedPreset === option.id
                    ? "text-purple-700 dark:text-purple-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Instructions
        </h2>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Write clear and specific instructions..."
          className="w-full h-40 p-3 border border-gray-200 dark:border-gray-700 rounded-lg 
                   bg-white dark:bg-gray-800 
                   text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-500
                   focus:border-purple-500 dark:focus:border-purple-400 
                   focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400"
          aria-label="Instructions input"
        />
      </div>

      <button
        type="submit"
        className="flex items-center justify-center w-full py-2 px-4 
                 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700
                 text-white rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-offset-2 
                 dark:focus:ring-offset-gray-900 transition-colors"
      >
        <span className="mr-2">+</span>
        Generate
      </button>
    </form>
  );
}
