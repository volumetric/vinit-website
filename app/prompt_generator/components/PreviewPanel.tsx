"use client";

interface PreviewPanelProps {
  prompt: string;
}

export default function PreviewPanel({ prompt }: PreviewPanelProps) {
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
      </div>

      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-y-auto">
        <div className="prose dark:prose-invert max-w-none">
          {prompt || (
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
