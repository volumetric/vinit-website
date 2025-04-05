"use client";

import { useState } from "react";
import ConfigPanel from "./ConfigPanel";
import PreviewPanel from "./PreviewPanel";

export default function PromptGenerator() {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");

  const handleGenerate = (config: any) => {
    // TODO: Implement prompt generation logic
    setGeneratedPrompt("Generated prompt will appear here...");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Configurations */}
      <div className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
          Prompt Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Configure your prompt settings below to generate optimized prompts.
        </p>
        <ConfigPanel onGenerate={handleGenerate} />
      </div>

      {/* Right Panel - Preview */}
      <div className="w-full lg:w-1/2 p-6 bg-white dark:bg-gray-800">
        <PreviewPanel prompt={generatedPrompt} />
      </div>
    </div>
  );
}
