"use client";

interface PreviewPanelProps {
  prompt: string;
  isLoading: boolean;
  error: string | null;
}

export default function PreviewPanel({
  prompt,
  isLoading,
  error,
}: PreviewPanelProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Preview
        </h2>
        {prompt && (
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm text-purple-600 dark:text-purple-400 
                     border border-purple-200 dark:border-purple-700 
                     rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 
                     transition-colors"
            aria-label="Copy to clipboard"
          >
            Copy
          </button>
        )}
      </div>

      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-y-auto">
        <div className="prose dark:prose-invert max-w-none">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-spin">⚡</div>
                <p>Generating your prompt...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500 dark:text-red-400">
              <div className="text-center">
                <div className="text-4xl mb-2">⚠️</div>
                <p>{error}</p>
              </div>
            </div>
          ) : prompt ? (
            <div className="whitespace-pre-wrap">{prompt}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">✨</div>
                <p>
                  Describe your use case on the left,
                  <br />
                  the orchestration preview will show here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
